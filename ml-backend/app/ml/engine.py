import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
import os

class MLEngine:
    DIAS_MEMORIA_IA = 60
    FEATURES = ['Close', 'Volume', 'RSI', 'MACD', 'ATR', 'EMA20', 'EMA50']

    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, "models", "modelo_acciones.keras") # Cambiado a .keras
        scaler_path = os.path.join(base_dir, "models", "scaler.pkl")
        
        self.model = None
        self.scaler = None
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.model = tf.keras.models.load_model(model_path)
            self.scaler = joblib.load(scaler_path)
        else:
            print("⚠️ Modelos no encontrados. Ejecuta app/ml/entrenamiento.py primero.")

    def calcular_indicadores(self, df):
        # Misma lógica exacta que en entrenamiento para mantener coherencia
        close = df['Close']
        high = df['High']
        low = df['Low']
        
        delta = close.diff()
        ganancia = delta.where(delta > 0, 0).ewm(com=13, adjust=False).mean()
        perdida = -delta.where(delta < 0, 0).ewm(com=13, adjust=False).mean()
        rs = ganancia / perdida
        df['RSI'] = 100 - (100 / (1 + rs))
        
        ema12 = close.ewm(span=12, adjust=False).mean()
        ema26 = close.ewm(span=26, adjust=False).mean()
        df['MACD'] = ema12 - ema26
        
        prev_close = close.shift(1)
        tr = pd.concat([high - low, (high - prev_close).abs(), (low - prev_close).abs()], axis=1).max(axis=1)
        df['ATR'] = tr.rolling(window=14).mean()
        
        df['EMA20'] = close.ewm(span=20, adjust=False).mean()
        df['EMA50'] = close.ewm(span=50, adjust=False).mean()
        
        return df.dropna()

    def predecir(self, df_historico):
        """
        Recibe un DataFrame desde el orquestador (la BD), calcula el bloque de 60 días
        y retorna la predicción final aplicando la lógica de negocio de tu tesis.
        """
        if self.model is None or self.scaler is None:
            raise Exception("El motor de IA no tiene un modelo cargado.")

        # 1. Preparar datos
        df_ind = self.calcular_indicadores(df_historico.copy())
        if len(df_ind) < self.DIAS_MEMORIA_IA:
            return None # No hay suficientes datos en la BD para esta empresa
            
        # 2. Tomar exactamente el último bloque de 60 días
        data = df_ind[self.FEATURES].values[-self.DIAS_MEMORIA_IA:]
        
        # 3. Escalar con el Scaler del entrenamiento
        scaled_data = self.scaler.transform(data)
        
        # Formatear a 3D (1, 60, 7) para LSTM
        X_pred = scaled_data.reshape(1, self.DIAS_MEMORIA_IA, len(self.FEATURES))
        
        # 4. Inferencia
        pred_scaled = self.model.predict(X_pred, verbose=0)
        
        # 5. Desescalar (CRÍTICO: Multiplicar por el rango de la columna 'Close')
        max_val = self.scaler.data_max_[0]
        min_val = self.scaler.data_min_[0]
        pred_real = pred_scaled[0, 0] * (max_val - min_val) + min_val
        
        # 6. Cálculo de lógica de negocio
        precio_actual = df_ind['Close'].iloc[-1]
        var_pct = ((pred_real - precio_actual) / precio_actual) * 100
        
        rsi_actual = df_ind['RSI'].iloc[-1]
        score = 0
        if abs(var_pct) > 1.5: score += 2 if var_pct > 0 else -2
        if rsi_actual < 35: score += 2
        if rsi_actual > 70: score -= 2

        recomendacion = "ALCISTA" if score >= 2 else "BAJISTA" if score <= -2 else "Sin señal"
        
        # Retornamos el objeto procesado para que el orquestador lo guarde en la BD
        return {
            "prediccion": float(pred_real),
            "variacion": float(var_pct),
            "score": float(score),
            "recomendacion": recomendacion,
            "features": df_ind.iloc[-1] # Enviamos la última fila para extraer RSI, MACD, etc.
        }