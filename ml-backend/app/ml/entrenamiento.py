import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Input
from tensorflow.keras.optimizers import Adam
import joblib
import os

# 1. Importamos la conexión a tu Base de Datos
from app.db.sessions import SessionLocal
from app.models.empresa import Empresa
from app.models.precio_historico import PrecioHistorico

DIAS_MEMORIA_IA = 60
FEATURES = ['Close', 'Volume', 'RSI', 'MACD', 'ATR', 'EMA20', 'EMA50']

def calcular_indicadores(df):
    close = df['Close']
    high = df['High']
    low = df['Low']
    
    # RSI
    delta = close.diff()
    ganancia = delta.where(delta > 0, 0).ewm(com=13, adjust=False).mean()
    perdida = -delta.where(delta < 0, 0).ewm(com=13, adjust=False).mean()
    rs = ganancia / perdida
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # MACD
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    df['MACD'] = ema12 - ema26
    
    # ATR (Usamos High y Low simulados si la BD no los tiene)
    prev_close = close.shift(1)
    tr = pd.concat([
        high - low,
        (high - prev_close).abs(),
        (low - prev_close).abs()
    ], axis=1).max(axis=1)
    df['ATR'] = tr.rolling(window=14).mean()
    
    # EMAs
    df['EMA20'] = close.ewm(span=20, adjust=False).mean()
    df['EMA50'] = close.ewm(span=50, adjust=False).mean()
    
    return df.dropna()

def obtener_datos_bd():
    """Extrae los precios históricos desde SQL Server y los formatea para la IA."""
    db = SessionLocal()
    try:
        # Buscamos una empresa de referencia que tenga muchos datos (ej: MSFT o la primera activa)
        empresa = db.query(Empresa).filter(Empresa.Ticket == 'MSFT', Empresa.Activo == True).first()
        if not empresa:
            empresa = db.query(Empresa).filter(Empresa.Activo == True).first()
            
        print(f"📥 Extrayendo datos de la base de datos para: {empresa.Ticket}...")
        
        # Traemos el histórico ordenado por fecha de más antiguo a más reciente
        precios = db.query(PrecioHistorico).filter(
            PrecioHistorico.IdEmpresa == empresa.IdEmpresa
        ).order_by(PrecioHistorico.Fecha.asc()).all()

        if len(precios) < DIAS_MEMORIA_IA + 50:
            raise ValueError(f"No hay suficientes datos en la BD para {empresa.Ticket}. Ejecuta la carga de precios primero.")

        # Convertimos a formato DataFrame simulando High y Low para el ATR
        datos_formateados = []
        for p in precios:
            datos_formateados.append({
                'Fecha': p.Fecha,
                'Close': float(p.PrecioCierre),
                'Volume': int(p.Volumen),
                'High': float(p.PrecioCierre), # Simulación por falta de columna en BD
                'Low': float(p.PrecioCierre)   # Simulación por falta de columna en BD
            })
            
        df = pd.DataFrame(datos_formateados)
        df.set_index('Fecha', inplace=True)
        return df

    finally:
        db.close()

def entrenar_y_guardar():
    # 1. Obtener datos locales desde SQL Server
    df = obtener_datos_bd()
        
    print("⚙️ Calculando indicadores técnicos...")
    df = calcular_indicadores(df)
    data = df[FEATURES].values
    
    # 2. Escalar datos
    print("⚖️ Escalando variables...")
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)
    
    # 3. Construir Bloques LSTM (60 días de memoria)
    x_train, y_train = [], []
    for i in range(DIAS_MEMORIA_IA, len(scaled_data)):
        x_train.append(scaled_data[i-DIAS_MEMORIA_IA:i, :])
        y_train.append(scaled_data[i, 0]) # Predice la columna 0 ('Close')
        
    x_train, y_train = np.array(x_train), np.array(y_train)
    
    # 4. Entrenar el Modelo LSTM
    print("🧠 Entrenando red neuronal LSTM...")
    model = Sequential([
        Input(shape=(x_train.shape[1], x_train.shape[2])),
        LSTM(32),
        Dense(1)
    ])
    model.compile(optimizer=Adam(0.001), loss='mse')
    model.fit(x_train, y_train, epochs=20, batch_size=32, verbose=1)
    
    # 5. Guardar modelo y scaler en la carpeta correspondiente
    ruta_modelos = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(ruta_modelos, exist_ok=True)
    
    ruta_modelo = os.path.join(ruta_modelos, 'modelo_acciones.keras')
    model.save(ruta_modelo)
    
    ruta_scaler = os.path.join(ruta_modelos, 'scaler.pkl')
    joblib.dump(scaler, ruta_scaler)
    
    print(f"✅ ¡Éxito! Modelo LSTM guardado en: {ruta_modelo}")
    print(f"✅ ¡Éxito! Scaler guardado en: {ruta_scaler}")

if __name__ == "__main__":
    entrenar_y_guardar()