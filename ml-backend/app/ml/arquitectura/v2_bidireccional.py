from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Input, Bidirectional, Dropout

def obtener_modelo_v2(shape_1, shape_2):
    """Modelo Avanzado: Lee la historia en ambas direcciones para mayor contexto."""
    return Sequential([
        Input(shape=(shape_1, shape_2)),

        Bidirectional(LSTM(32, return_sequences=True)), 
        Dropout(0.2), 

        Dense(16, activation='relu'),
        Dense(1, activation='linear')
    ])