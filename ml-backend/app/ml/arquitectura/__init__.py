"""
Arquitecturas de redes neuronales para predicción.
"""

from app.ml.arquitectura.v1_lstm import ModeloLSTM_v1, obtener_modelo_v1
from app.ml.arquitectura.v2_bidireccional import ModeloBidireccional_v2, obtener_modelo_v2
from app.ml.arquitectura.v3_cnn import ModeloCNN_v3, obtener_modelo_v3

__all__ = [
    "ModeloLSTM_v1",
    "obtener_modelo_v1",
    "ModeloBidireccional_v2",
    "obtener_modelo_v2",
    "ModeloCNN_v3",
    "obtener_modelo_v3",
]
