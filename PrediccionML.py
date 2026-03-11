import numpy as np
import pandas as pd
import yfinance as yf
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout, Input
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.metrics import mean_absolute_error, mean_squared_error
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
import os
import warnings
import logging
import gc

# 1. CONFIGURACIÓN
# -----------------------------------------------------------------------------
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
logging.getLogger('tensorflow').setLevel(logging.ERROR)
warnings.filterwarnings("ignore")

DIAS_MEMORIA_IA = 60
PORTAFOLIO = [
    'MSFT', 'AAPL', 'TSLA', 'AMZN', 'GOOGL', 'NVDA', 'META', 'NFLX', 'INTC', 'AMD', 'KO',
    'JPM', 'V', 'JNJ', 'UNH', 'PG', 'WMT', 'XOM', 'CAT', 'DIS', 'SPY'
]

NOMBRES = {
    'MSFT': 'Microsoft', 
    'AAPL': 'Apple', 
    'TSLA': 'Tesla', 
    'AMZN': 'Amazon',
    'GOOGL': 'Google', 
    'NVDA': 'NVIDIA', 
    'META': 'Meta', 
    'NFLX': 'Netflix',
    'INTC': 'Intel', 
    'AMD': 'AMD', 
    'KO': 'Coca-Cola',
    'JPM': 'JPMorgan', 
    'V': 'Visa', 
    'JNJ': 'Johnson & Johnson', 
    'UNH': 'UnitedHealth', 
    'PG': 'Procter & Gamble', 
    'WMT': 'Walmart', 
    'XOM': 'Exxon Mobil', 
    'CAT': 'Caterpillar', 
    'DIS': 'Disney', 
    'SPY': 'S&P 500 ETF (SPY)'
}

# 2. OPTIMIZACIÓN: CÁLCULO VECTORIZADO DE INDICADORES
# -----------------------------------------------------------------------------
def CalcularIndicadoresMasivos(datos):
    """Calcula indicadores técnicos para todo el dataframe multi-index."""
    close = datos.xs('Close', level=1, axis=1)
    high = datos.xs('High', level=1, axis=1)
    low = datos.xs('Low', level=1, axis=1)
    
    # 1. RSI Vectorizado
    delta = close.diff()
    ganancia = delta.where(delta > 0, 0).ewm(com=13, adjust=False).mean()
    perdida = -delta.where(delta < 0, 0).ewm(com=13, adjust=False).mean()
    rs = ganancia / perdida
    rsi = 100 - (100 / (1 + rs))
    
    # 2. MACD (12, 26, 9)
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    macd = ema12 - ema26
    
    # 3. ATR (Average True Range) - Vectorizado por Ticker
    atr = pd.DataFrame(index=close.index)
    prev_close = close.shift(1)
    for ticker in close.columns:
        tr = pd.concat([
            high[ticker] - low[ticker],
            (high[ticker] - prev_close[ticker]).abs(),
            (low[ticker] - prev_close[ticker]).abs()
        ], axis=1).max(axis=1)
        atr[ticker] = tr.rolling(window=14).mean()
    
    # 4. Medias Móviles (EMA 20, 50 y SMA 200)
    ema20 = close.ewm(span=20, adjust=False).mean()
    ema50 = close.ewm(span=50, adjust=False).mean()
    sma200 = close.rolling(window=200).mean()
    
    return rsi, macd, atr, ema20, ema50, sma200

# 3. OPTIMIZACIÓN: FUNDAMENTALES EN PARALELO (I/O BOUND)
# -----------------------------------------------------------------------------
def ObtenerPE(ticker):
    """Hilos para evitar que la red bloquee el entrenamiento."""
    try:
        info = yf.Ticker(ticker).info
        return ticker, info.get('trailingPE', 999) or 999
    except:
        return ticker, 999

# 4. MOTOR IA (MULTIVARIANTE)
# -----------------------------------------------------------------------------
def EntrenarPredecir(df_ticker):
    try:
        with tf.device('/CPU:0'):
            features = ['Close', 'Volume', 'RSI', 'MACD', 'ATR', 'EMA20', 'EMA50']
            data = df_ticker[features].values
            if len(data) < DIAS_MEMORIA_IA + 30: return None
            
            scaler = MinMaxScaler(feature_range=(0, 1))
            scaled_data = scaler.fit_transform(data)

            x, y = [], []
            for i in range(DIAS_MEMORIA_IA, len(scaled_data)):
                x.append(scaled_data[i-DIAS_MEMORIA_IA:i, :])
                y.append(scaled_data[i, 0])
            x, y = np.array(x), np.array(y)

            # Split para validación (80% tren, 20% test)
            split = int(len(x) * 0.8)
            x_train, x_test = x[:split], x[split:]
            y_train, y_test = y[:split], y[split:]

            model = Sequential([
                Input(shape=(x_train.shape[1], x_train.shape[2])),
                LSTM(32),
                Dense(1)
            ])
            model.compile(optimizer=Adam(0.001), loss='mse')
            model.fit(x_train, y_train, epochs=20, batch_size=32, verbose=0)

            # --- CÁLCULO DE MÉTRICAS ---
            y_pred_scaled = model.predict(x_test, verbose=0)
            
            # Invertir escalado para métricas en dólares/precios reales
            max_val = scaler.data_max_[0]
            min_val = scaler.data_min_[0]
            y_test_real = y_test * (max_val - min_val) + min_val
            y_pred_real = y_pred_scaled.flatten() * (max_val - min_val) + min_val
            
            mae = mean_absolute_error(y_test_real, y_pred_real)
            rmse = np.sqrt(mean_squared_error(y_test_real, y_pred_real))

            # --- PREDICCIÓN FINAL (Mañana) ---
            ultimo_bloque = scaled_data[-DIAS_MEMORIA_IA:].reshape(1, DIAS_MEMORIA_IA, len(features))
            pred_mañana_scaled = model.predict(ultimo_bloque, verbose=0)
            pred_final = pred_mañana_scaled[0,0] * (max_val - min_val) + min_val
            
            precio_hoy = df_ticker['Close'].iloc[-1]
            var_pct = ((pred_final - precio_hoy) / precio_hoy) * 100
            
            tf.keras.backend.clear_session()
            return var_pct, precio_hoy, mae, rmse
    except:
        return None
# 5. TAREA PARA EL WORKER
# -----------------------------------------------------------------------------
def TareaWorker(ticker, df_ticker, pe):
    resultado = EntrenarPredecir(df_ticker)
    if not resultado: return None
    
    var_ia, precio, mae, rmse = resultado
    rsi = df_ticker['RSI'].iloc[-1]
    
    # Veredicto mejorado con MAE
    # Si la variación de la IA es menor al MAE, la señal es débil (ruido)
    score = 0
    if abs(var_ia) > 1.5: score += 2 if var_ia > 0 else -2
    if rsi < 35: score += 2
    if rsi > 70: score -= 2

    return {
        'Ticker': NOMBRES.get(ticker, ticker),
        'Precio': round(precio, 2),
        'IA': f"{var_ia:+.2f}%",
        'MAE ($)': round(mae, 2),  # Cuánto se equivoca en promedio (en $)
        'RMSE': round(rmse, 2),    # Castiga errores grandes
        'RSI': round(rsi, 1),
        'RECOMENDACIÓN': "ALCISTA" if score >= 2 else "BAJISTA" if score <= -2 else "Sin señal",
        'Score': score
    }

# 6. EJECUCIÓN MAESTRA
# -----------------------------------------------------------------------------
def Prediccion():
    print("INICIANDO SCANNER")
    
    # 1. Paralelismo de Red: Descarga e Info simultáneos
    with ThreadPoolExecutor() as threads:
        print("Descargando datos y fundamentales...")
        f_datos = threads.submit(yf.download, PORTAFOLIO, period='4y', interval='1d', group_by='ticker', progress=False, auto_adjust=True)
        f_pe = {ticker: threads.submit(ObtenerPE, ticker) for ticker in PORTAFOLIO}
        
        datos = f_datos.result()
        pe_dict = {f.result()[0]: f.result()[1] for f in f_pe.values()}

    # 2. Vectorización: Calculamos indicadores para todos de una vez
    print("Calculando indicadores vectorizados...")
    rsi_all, macd_all, atr_all, ema20_all, ema50_all, sma_all = CalcularIndicadoresMasivos(datos)

    # 3. Paralelismo de CPU: Procesamiento de IA
    print(f"Entrenando modelos...")
    informe = []
    with ProcessPoolExecutor(max_workers=2) as executor:
        tareas = []
        for ticker in PORTAFOLIO:
            df_t = datos[ticker].copy().dropna()
            # Añadimos los nuevos indicadores al dataframe de cada ticker
            df_t['RSI'] = rsi_all[ticker]
            df_t['MACD'] = macd_all[ticker]
            df_t['ATR'] = atr_all[ticker]
            df_t['EMA20'] = ema20_all[ticker]
            df_t['EMA50'] = ema50_all[ticker]
            df_t['SMA_200'] = sma_all[ticker]
            df_t = df_t.dropna()
            
            tareas.append(executor.submit(TareaWorker, ticker, df_t, pe_dict[ticker]))
        
        for f in tareas:
            res = f.result()
            if res: informe.append(res)

    # Mostrar Resultados
    df = pd.DataFrame(informe).sort_values(by='Score', ascending=False)
    print("Informe Final:")
    print("\n" + "="*100)
    print(df.drop(columns=['Score']).to_string(index=False))

if __name__ == "__main__":
    Prediccion()