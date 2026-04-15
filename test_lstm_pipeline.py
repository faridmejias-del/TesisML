#!/usr/bin/env python3
"""
Script de prueba para ejecutar el pipeline LSTM refactorizado.
Verifica que todas las mejoras funcionen correctamente.
"""

import sys
import os
import logging

# Agregar el directorio ml-backend al path
ml_backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ml-backend')
sys.path.insert(0, ml_backend_path)

from app.ml.pipeline_lstm.orquestador import ejecutar_pipeline_lstm
from app.ml.core.logger import configurar_logger

def main():
    """Función principal de prueba"""
    # Configurar logging
    logger = configurar_logger("Test.LSTM", archivo_log="logs/test_lstm.log")
    logger.info("Iniciando prueba del pipeline LSTM refactorizado")

    try:
        # Ejecutar pipeline con empresa de prueba (ID=1)
        resultado = ejecutar_pipeline_lstm(id_empresa=1, epochs=5)

        if resultado:
            logger.info("Pipeline LSTM ejecutado exitosamente",
                       extra={"modelo_version": resultado.get('version'),
                              "accuracy": resultado.get('accuracy'),
                              "auc": resultado.get('auc')})
            print("✅ Pipeline LSTM ejecutado exitosamente")
            print(f"   Versión del modelo: {resultado.get('version')}")
            print(f"   Accuracy: {resultado.get('accuracy', 'N/A')}")
            print(f"   AUC: {resultado.get('auc', 'N/A')}")
        else:
            logger.error("Pipeline LSTM falló")
            print("❌ Pipeline LSTM falló")
            return False

    except Exception as e:
        logger.error("Error en la prueba del pipeline LSTM", extra={"error": str(e)})
        print(f"❌ Error: {str(e)}")
        return False

    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)