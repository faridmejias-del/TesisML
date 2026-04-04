import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
import random
from collections import deque
import os
import joblib
from tqdm import tqdm

import torch._dynamo
torch._dynamo.config.suppress_errors = True
torch._dynamo.disable()

from app.db.sessions import SessionLocal
from app.models.modelo_ia import ModeloIA
from app.services.metrica_service import MetricaService
from app.ml.entrenamiento import extraer_y_procesar_empresa, preparar_datos_masivos
from app.ml.engine import MLEngine
from app.ml.arquitectura.v3_dqn import ModeloDQN_v3

# Hiperparámetros de Aprendizaje por Refuerzo
GAMMA = 0.95         # Factor de descuento (Importancia de recompensas futuras)
EPSILON_INICIAL = 1.0 # 100% de exploración al inicio (Adivinar)
EPSILON_MIN = 0.05   # Exploración mínima al final
DECAY_EPSILON = 0.995 # Tasa de decaimiento
BATCH_SIZE = 64

class ReplayBuffer:
    """Memoria de experiencias del Agente"""
    def __init__(self, capacidad=10000):
        self.memoria = deque(maxlen=capacidad)
    
    def guardar(self, estado, accion, recompensa, siguiente_estado, precio_real):
        self.memoria.append((estado, accion, recompensa, siguiente_estado, precio_real))
        
    def samplear(self, batch_size):
        return random.sample(self.memoria, batch_size)

def entrenar_agente_rl(id_modelo_rl: int):
    """Entrena el Agente iterando por episodios y simulando el mercado"""
    db = SessionLocal()
    try:
        modelo_db = db.query(ModeloIA).filter(ModeloIA.IdModelo == id_modelo_rl).first()
        if not modelo_db: return
    finally:
        db.close()

    # 1. Cargar Datos Globales (Reutilizamos la función de tu script clásico)
    print("🌐 Iniciando Entorno de Mercado...")
    MLEngine.inicializar_mercado()
    # Aquí deberías obtener la lista de ids_empresas activos igual que en entrenamiento.py
    # Para el ejemplo, asumiremos que ya tienes x_train_global y los precios.
    
    # IMPORTANTE: Reemplaza esto por la extracción real de tus dataframes
    # x_train, y_reg_train, _, scaler = preparar_datos_masivos(lista_dfs)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n🧠 ENTRENANDO AGENTE RL EN: {device.type.upper()}")

    # 2. Inicializar Redes DQN (La red principal y la red Target para estabilidad)
    agente = ModeloDQN_v3(num_features=len(MLEngine.FEATURES)).to(device)
    target_net = ModeloDQN_v3(num_features=len(MLEngine.FEATURES)).to(device)
    target_net.load_state_dict(agente.state_dict())
    
    optimizer = optim.Adam(agente.parameters(), lr=0.001)
    criterio_q = nn.MSELoss()
    criterio_precio = nn.HuberLoss(delta=1.0)
    
    memoria = ReplayBuffer()
    epsilon = EPSILON_INICIAL
    episodios = 15 # En RL se habla de Episodios, no Épocas

    historial_recompensas = []

    for episodio in range(episodios):
        recompensa_total = 0
        
        # Simulamos caminar por el tiempo (Día a Día)
        # x_train tiene forma [Días, 90_dias_memoria, Features]
        rango_tiempo = tqdm(range(len(x_train) - 1), desc=f"Episodio {episodio+1}/{episodios}", leave=False)
        
        for t in rango_tiempo:
            estado = x_train[t]
            estado_tensor = torch.tensor([estado], dtype=torch.float32).to(device)
            precio_real = y_reg_train[t]
            
            # --- TOMA DE DECISIÓN (Epsilon-Greedy) ---
            if random.random() <= epsilon:
                accion = random.randint(0, 2) # Explorar: Acción aleatoria
            else:
                with torch.no_grad():
                    _, q_values = agente(estado_tensor)
                    accion = torch.argmax(q_values).item() # Explotar: Mejor acción conocida
            
            # --- SIMULAR EL MERCADO (Calcular Recompensa) ---
            precio_hoy = x_train[t][-1][0] # Precio de cierre del día actual
            precio_manana = y_reg_train[t] # Precio de cierre del día siguiente
            variacion = (precio_manana - precio_hoy) / precio_hoy
            
            if accion == 2: recompensa = variacion * 100       # Compró
            elif accion == 0: recompensa = -variacion * 100    # Vendió (Short)
            else: recompensa = -abs(variacion) * 10            # Mantuvo (Penalización ligera por costo de oportunidad)
                
            siguiente_estado = x_train[t + 1]
            
            # Guardar experiencia en memoria
            memoria.guardar(estado, accion, recompensa, siguiente_estado, precio_real)
            recompensa_total += recompensa

            # --- ENTRENAMIENTO DESDE LA MEMORIA (Experience Replay) ---
            if len(memoria.memoria) >= BATCH_SIZE:
                batch = memoria.samplear(BATCH_SIZE)
                
                batch_estados = torch.tensor(np.array([b[0] for b in batch]), dtype=torch.float32).to(device)
                batch_acciones = torch.tensor([b[1] for b in batch], dtype=torch.int64).to(device).unsqueeze(1)
                batch_recompensas = torch.tensor([b[2] for b in batch], dtype=torch.float32).to(device)
                batch_sig_estados = torch.tensor(np.array([b[3] for b in batch]), dtype=torch.float32).to(device)
                batch_precios_reales = torch.tensor([b[4] for b in batch], dtype=torch.float32).to(device).unsqueeze(1)
                
                # 1. Calcular Pérdida Q-Values (RL)
                pred_precios, q_actuales = agente(batch_estados)
                q_actuales_acciones = q_actuales.gather(1, batch_acciones).squeeze(1)
                
                with torch.no_grad():
                    _, q_siguientes = target_net(batch_sig_estados)
                    q_max_siguientes = q_siguientes.max(1)[0]
                    q_targets = batch_recompensas + (GAMMA * q_max_siguientes)
                    
                loss_q = criterio_q(q_actuales_acciones, q_targets)
                
                # 2. Calcular Pérdida del Precio Exacto (Supervisado)
                loss_precio = criterio_precio(pred_precios, batch_precios_reales)
                
                # Pérdida Multi-Tarea
                loss_total = loss_q + loss_precio
                
                optimizer.zero_grad()
                loss_total.backward()
                optimizer.step()
                
        # Actualizar Epsilon (Reducir exploración)
        if epsilon > EPSILON_MIN: epsilon *= DECAY_EPSILON
        
        # Sincronizar Redes
        if episodio % 3 == 0:
            target_net.load_state_dict(agente.state_dict())
            
        print(f"Episodio {episodio+1} | Recompensa Neta: {recompensa_total:.2f} | Epsilon: {epsilon:.2f}")

    # Guardar Agente
    ruta_modelo = os.path.join(os.path.dirname(__file__), 'models', f'modelo_acciones_{modelo_db.Version}.pth')
    torch.save(agente.state_dict(), ruta_modelo)
    print("✅ Agente de Refuerzo entrenado y guardado exitosamente.")