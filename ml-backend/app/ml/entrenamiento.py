import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import copy
from sklearn.preprocessing import MinMaxScaler
import joblib
import os
import concurrent.futures
from tqdm import tqdm
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

import torch._dynamo
torch._dynamo.config.suppress_errors = True
torch._dynamo.disable()

from app.services.metrica_service import MetricaService
from app.db.sessions import SessionLocal
from app.models.empresa import Empresa
from app.models.precio_historico import PrecioHistorico
from app.models.modelo_ia import ModeloIA

from app.ml.engine import MLEngine
from app.ml.arquitectura.v1_lstm import obtener_modelo_v1
from app.ml.arquitectura.v2_bidireccional import obtener_modelo_v2

MAPA_ARQUITECTURAS = {
    "v1": obtener_modelo_v1,
    "v2": obtener_modelo_v2
}

class EarlyStopping:
    def __init__(self, paciencia=3, delta=0):
        self.paciencia = paciencia
        self.delta = delta
        self.contador = 0
        self.mejor_loss = None
        self.detener = False
        self.mejores_pesos = None

    def __call__(self, val_loss, modelo):
        if self.mejor_loss is None:
            self.mejor_loss = val_loss
            self.mejores_pesos = copy.deepcopy(modelo.state_dict())
        elif val_loss > self.mejor_loss - self.delta:
            self.contador += 1
            if self.contador >= self.paciencia:
                self.detener = True
        else:
            self.mejor_loss = val_loss
            self.mejores_pesos = copy.deepcopy(modelo.state_dict())
            self.contador = 0

def extraer_y_procesar_empresa(id_empresa):
    db_thread = SessionLocal()
    try:
        precios = db_thread.query(PrecioHistorico).filter(
            PrecioHistorico.IdEmpresa == id_empresa
        ).order_by(PrecioHistorico.Fecha.asc()).all()

        if len(precios) < MLEngine.DIAS_MEMORIA_IA + 50: return None

        datos_formateados = [{
            'Fecha': p.Fecha,
            'Close': float(p.PrecioCierre),
            'Volume': int(p.Volumen),
            'High': float(p.PrecioCierre),
            'Low': float(p.PrecioCierre)
        } for p in precios]
            
        df = pd.DataFrame(datos_formateados)
        df.set_index('Fecha', inplace=True)
        return MLEngine.calcular_indicadores(df)
    except Exception:
        return None
    finally:
        db_thread.close()

def preparar_datos_masivos(lista_dfs):
    df_global = pd.concat(lista_dfs)
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaler.fit(df_global[MLEngine.FEATURES].values)
    
    x_train_global, y_train_reg, y_train_clf = [], [], []
    for df in lista_dfs:
        scaled_data = scaler.transform(df[MLEngine.FEATURES].values)
        for i in range(MLEngine.DIAS_MEMORIA_IA, len(scaled_data)):
            x_train_global.append(scaled_data[i-MLEngine.DIAS_MEMORIA_IA:i, :])
            
            # Target 1: Regresión (El Precio Scalado)
            precio_hoy = scaled_data[i-1, 0]
            precio_manana = scaled_data[i, 0]
            y_train_reg.append(precio_manana)
            
            # Target 2: Clasificador Binario (1 si sube, 0 si baja)
            tendencia = 1.0 if precio_manana > precio_hoy else 0.0
            y_train_clf.append(tendencia)
            
    return np.array(x_train_global), np.array(y_train_reg), np.array(y_train_clf), scaler

def crear_dataloaders(x_train, y_reg, y_clf):
    x_tensor = torch.tensor(x_train, dtype=torch.float32)
    y_reg_tensor = torch.tensor(y_reg, dtype=torch.float32).view(-1, 1)
    y_clf_tensor = torch.tensor(y_clf, dtype=torch.float32).view(-1, 1)
    
    split_idx = int(0.9 * len(x_tensor))
    train_dataset = TensorDataset(x_tensor[:split_idx], y_reg_tensor[:split_idx], y_clf_tensor[:split_idx])
    val_dataset = TensorDataset(x_tensor[split_idx:], y_reg_tensor[split_idx:], y_clf_tensor[split_idx:])
    
    train_loader = DataLoader(train_dataset, batch_size=128, shuffle=True, pin_memory=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=128, shuffle=False, pin_memory=True)
    
    return train_loader, val_loader, x_tensor, y_clf_tensor, split_idx

def ejecutar_entrenamiento_pytorch(model, train_loader, val_loader, device, epochs=25):
    criterion_reg = nn.HuberLoss(delta=1.0)
    criterion_clf = nn.BCELoss() # Binary Cross Entropy para la cabeza de Clasificación
    criterion_mae = nn.L1Loss() 
    optimizer = optim.Adam(model.parameters(), lr=0.0005)
    early_stopping = EarlyStopping(paciencia=3, delta=0.0)
    
    historial = {'loss': [], 'mae': [], 'val_loss': [], 'val_mae': []}

    for epoch in range(epochs):
        model.train()
        train_loss, train_mae = 0.0, 0.0
        loop_entrenamiento = tqdm(train_loader, desc=f"Epoch [{epoch+1}/{epochs}]", leave=False, unit="batch")
        
        for x_batch, y_reg_batch, y_clf_batch in loop_entrenamiento:
            x_batch = x_batch.to(device, non_blocking=True)
            y_reg_batch = y_reg_batch.to(device, non_blocking=True)
            y_clf_batch = y_clf_batch.to(device, non_blocking=True)
            
            optimizer.zero_grad()
            
            # La IA devuelve dos respuestas simultáneas
            pred_reg, pred_clf = model(x_batch)
            
            loss_reg = criterion_reg(pred_reg, y_reg_batch)
            loss_clf = criterion_clf(pred_clf, y_clf_batch)
            
            # Sumamos las pérdidas: La IA es castigada por ambos errores
            loss_total = loss_reg + loss_clf
            mae = criterion_mae(pred_reg, y_reg_batch)
            
            loss_total.backward()
            optimizer.step()
            
            train_loss += loss_total.item()
            train_mae += mae.item()
            loop_entrenamiento.set_postfix(loss=f"{loss_total.item():.4f}", mae=f"{mae.item():.4f}")
            
        train_loss /= len(train_loader)
        train_mae /= len(train_loader)
        
        model.eval()
        val_loss, val_mae = 0.0, 0.0
        with torch.no_grad():
            for x_val, y_reg_val, y_clf_val in val_loader:
                x_val = x_val.to(device, non_blocking=True)
                y_reg_val = y_reg_val.to(device, non_blocking=True)
                y_clf_val = y_clf_val.to(device, non_blocking=True)
                
                p_reg, p_clf = model(x_val)
                v_loss = criterion_reg(p_reg, y_reg_val) + criterion_clf(p_clf, y_clf_val)
                val_loss += v_loss.item()
                val_mae += criterion_mae(p_reg, y_reg_val).item()
                
        val_loss /= len(val_loader)
        val_mae /= len(val_loader)
        
        historial['loss'].append(train_loss)
        historial['mae'].append(train_mae)
        historial['val_loss'].append(val_loss)
        historial['val_mae'].append(val_mae)
        
        print(f"Epoch [{epoch+1}/{epochs}] - Multi-Loss: {train_loss:.4f} - val_loss: {val_loss:.4f}")
        
        early_stopping(val_loss, model)
        if early_stopping.detener: break
            
    return historial, early_stopping.mejores_pesos

def calcular_metricas_clasificacion(model, x_tensor, y_clf_tensor, split_idx, historial, device):
    x_val_final = x_tensor[split_idx:]
    y_val_real = y_clf_tensor[split_idx:].numpy()
    
    y_val_pred_list = []
    lote_evaluacion = 128 
    
    with torch.no_grad():
        for i in range(0, len(x_val_final), lote_evaluacion):
            x_batch = x_val_final[i:i+lote_evaluacion].to(device)
            _, pred_clf = model(x_batch) # Ignoramos el precio, tomamos la tendencia
            y_val_pred_list.append(pred_clf.cpu().numpy())

    probabilidades = np.vstack(y_val_pred_list)
    # Todo lo mayor a 50% de probabilidad se considera tendencia alcista (1)
    direccion_pred = (probabilidades > 0.5).astype(int)

    acc = accuracy_score(y_val_real, direccion_pred)
    prec = precision_score(y_val_real, direccion_pred, zero_division=0)
    rec = recall_score(y_val_real, direccion_pred, zero_division=0)
    f1 = f1_score(y_val_real, direccion_pred, zero_division=0)

    mejor_idx = np.argmin(historial['val_loss'])
    return {
        'loss': float(historial['loss'][mejor_idx]),
        'mae': float(historial['mae'][mejor_idx]),
        'val_loss': float(historial['val_loss'][mejor_idx]),
        'val_mae': float(historial['val_mae'][mejor_idx]),
        'accuracy': float(acc),
        'precision': float(prec),
        'recall': float(rec),
        'f1_score': float(f1)
    }

def entrenar_y_guardar(id_modelo_especifico: int = None):
    db = SessionLocal()
    try:
        empresas = db.query(Empresa).filter(Empresa.Activo == True).all()
        ids_empresas = [e.IdEmpresa for e in empresas]

        query_modelos = db.query(ModeloIA).filter(ModeloIA.Activo==True)
        if id_modelo_especifico: 
            query_modelos = query_modelos.filter(ModeloIA.IdModelo == id_modelo_especifico)
        modelos_activos = query_modelos.all()
    finally:
        db.close()

    if not ids_empresas or not modelos_activos: return

    print("🌐 Descargando métricas macroeconómicas (S&P 500) para calcular Betas...")
    MLEngine.inicializar_mercado()

    print(f"⚡ Procesando en paralelo {len(ids_empresas)} empresas...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        resultados = list(tqdm(executor.map(extraer_y_procesar_empresa, ids_empresas), total=len(ids_empresas), desc="Extrayendo Datos"))

    lista_dfs = [df for df in resultados if df is not None]
    if not lista_dfs: return

    print("⚖️ Ajustando Scaler y construyendo secuencias Multi-Tarea...")
    x_train, y_reg, y_clf, scaler = preparar_datos_masivos(lista_dfs)
    train_loader, val_loader, x_tensor, y_clf_tensor, split_idx = crear_dataloaders(x_train, y_reg, y_clf)

    ruta_modelos = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(ruta_modelos, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n💻 ACELERADOR DE HARDWARE: {device.type.upper()}")

    for modelo_db in modelos_activos:
        print(f"\n🚀 Entrenando Multi-Task {modelo_db.Nombre} (v{modelo_db.Version}) en PyTorch...")
        funcion_arquitectura = MAPA_ARQUITECTURAS.get(modelo_db.Version)
        if not funcion_arquitectura: continue

        model = funcion_arquitectura(x_train.shape[1], x_train.shape[2]).to(device)
        historial, mejores_pesos = ejecutar_entrenamiento_pytorch(model, train_loader, val_loader, device)
        
        model.load_state_dict(mejores_pesos)
        model.eval()
        metricas = calcular_metricas_clasificacion(model, x_tensor, y_clf_tensor, split_idx, historial, device)

        db_local = SessionLocal()
        try:
            MetricaService.guardar_metricas(db_local, modelo_db.IdModelo, metricas)
        finally:
            db_local.close()

        torch.save(mejores_pesos, os.path.join(ruta_modelos, f'modelo_acciones_{modelo_db.Version}.pth'))
        print(f"✅ {modelo_db.Nombre} (.pth) guardado.")

    joblib.dump(scaler, os.path.join(ruta_modelos, 'scaler.pkl'))
    print("✅ ¡Entrenamiento Multi-Task completado con éxito!")

if __name__ == "__main__":
    entrenar_y_guardar()