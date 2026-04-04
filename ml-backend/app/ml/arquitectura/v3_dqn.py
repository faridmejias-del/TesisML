import torch
import torch.nn as nn

class ModeloDQN_v3(nn.Module):
    """
    Agente de Aprendizaje por Refuerzo (DQN) Multi-Tarea
    """
    def __init__(self, num_features):
        super(ModeloDQN_v3, self).__init__()
        self.lstm = nn.LSTM(input_size=num_features, hidden_size=32, batch_first=True)
        self.dropout = nn.Dropout(0.3)
        self.fc1 = nn.Linear(32, 16)
        self.relu = nn.ReLU()
        
        # --- CABEZA 1: Q-Values (Reinforcement Learning) ---
        # 3 Acciones posibles: 0 (Vender), 1 (Mantener), 2 (Comprar)
        self.cabeza_q_values = nn.Linear(16, 3) 
        
        # --- CABEZA 2: Regresión Clásica ---
        # Mantenemos la predicción del precio exacto
        self.cabeza_regresion = nn.Linear(16, 1) 

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        ultimo_dia = lstm_out[:, -1, :] 
        x = self.dropout(ultimo_dia)
        x = self.relu(self.fc1(x))
        
        q_values = self.cabeza_q_values(x)
        precio_predicho = self.cabeza_regresion(x)
        
        return precio_predicho, q_values

def obtener_modelo_v3(dias_pasados, num_features):
    return ModeloDQN_v3(num_features)