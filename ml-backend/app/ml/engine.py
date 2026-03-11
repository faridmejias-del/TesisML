import pandas as pd
import pandas_ta as ta # Librería recomendada para indicadores técnicos
import joblib

class MLEngine:
    def __init__(self, model_path="app/ml/models/modelo_acciones.pkl"):
        # Cargamos el modelo entrenado
        self.model = joblib.load(model_path)

    def preparar_features(self, df_historico):
        """Calcula los indicadores técnicos necesarios para el modelo."""
        # Aseguramos que el DF tenga suficientes datos
        df = df_historico.copy()
        df['RSI'] = ta.rsi(df['Close'], length=14)
        macd = ta.macd(df['Close'])
        df['MACD'] = macd['MACD_12_26_9']
        df['ATR'] = ta.atr(df['High'], df['Low'], df['Close'], length=14)
        df['EMA20'] = ta.ema(df['Close'], length=20)
        df['EMA50'] = ta.ema(df['Close'], length=50)
        
        return df.iloc[-1] # Retornamos solo la fila más reciente para predecir

    def predecir(self, features_row):
        """Genera la predicción y el score."""
        # Formatear datos para el modelo (ejemplo)
        X = features_row[['Close', 'Volume', 'RSI', 'MACD', 'ATR', 'EMA20', 'EMA50']].values.reshape(1, -1)
        prediccion = self.model.predict(X)[0]
        
        # Lógica de recomendación basada en el modelo
        variacion = ((prediccion - features_row['Close']) / features_row['Close']) * 100
        score = min(max(abs(variacion) * 10, 0), 100) # Ejemplo de cálculo de Score
        
        recomendacion = "Comprar" if variacion > 2 else "Vender" if variacion < -2 else "Mantener"
        
        return {
            "prediccion": prediccion,
            "variacion": variacion,
            "score": score,
            "recomendacion": recomendacion
        }