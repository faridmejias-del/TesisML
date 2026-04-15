import os
import gc
import joblib
import torch
from concurrent.futures import ProcessPoolExecutor, as_completed
import logging

from app.db.sessions import SessionLocal
from app.models.modelo_ia import ModeloIA
from app.models.empresa import Empresa
from app.services.metrica_service import MetricaService
from app.ml.arquitectura.v3_cnn import obtener_modelo_v3
from app.ml.core.utils import Timer
from app.ml.core.logger import configurar_logger
from app.ml.core.model_versioning import ModelVersionManager

from app.ml.pipeline_cnn.data_processor import extraer_y_procesar_empresa_cnn, preparar_datos_cnn, crear_dataloaders_cnn
from app.ml.pipeline_cnn.trainer import ejecutar_entrenamiento_cnn, evaluar_modelo_cnn

# Configurar logger
logger = configurar_logger("ML.Pipeline.CNN", archivo_log="logs/cnn_pipeline.log")

def entrenar_pipeline_cnn(id_modelo_especifico: int = None, epochs: int = 50, batch_size: int = 256):
    """Orquesta el flujo completo de entrenamiento exclusivo para la CNN"""
    db = SessionLocal()
    try:
        # 1. Cargar Configuración
        empresas = db.query(Empresa).filter(Empresa.Activo == True).all()
        ids_empresas = [e.IdEmpresa for e in empresas]

        query_modelos = db.query(ModeloIA).filter(ModeloIA.Activo == True, ModeloIA.Version == "v3")
        if id_modelo_especifico:
            query_modelos = query_modelos.filter(ModeloIA.IdModelo == id_modelo_especifico)
        modelos_activos = query_modelos.all()

        if not modelos_activos:
            logger.warning("No hay modelos CNN v3 activos para entrenar")
            return

        logger.info("Iniciando pipeline CNN", extra={"empresas": len(ids_empresas), "modelos": len(modelos_activos)})

        # 2. Extracción Paralela
        datos_procesados = []
        with Timer("Extracción de Datos CNN"):
            with ProcessPoolExecutor(max_workers=4) as executor:
                futuros = [executor.submit(extraer_y_procesar_empresa_cnn, id_e) for id_e in ids_empresas]
                for f in as_completed(futuros):
                    try:
                        res = f.result()
                        if res is not None: datos_procesados.append(res)
                    except Exception as e:
                        logger.error("Error en extracción CNN", extra={"error": str(e)}, exc_info=True)

        logger.info("Extracción CNN completada", extra={"datos_procesados": len(datos_procesados)})

        # 3. Preparación
        with Timer("Preparación de Tensores CNN"):
            xt, yrt, yct, xv, yrv, ycv, scaler = preparar_datos_cnn(datos_procesados)
            train_loader, val_loader = crear_dataloaders_cnn(xt, yrt, yct, xv, yrv, ycv, batch_size)
            del datos_procesados, xt, xv
            gc.collect()

        # 4. Entrenamiento de Modelos
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        ruta_modelos = os.path.join(os.getcwd(), "app", "ml", "models")
        os.makedirs(ruta_modelos, exist_ok=True)

        # Inicializar version manager
        version_manager = ModelVersionManager(ruta_modelos)

        for modelo_db in modelos_activos:
            logger.info("Iniciando entrenamiento CNN", extra={"modelo": modelo_db.Nombre, "version": modelo_db.Version})

            modelo_pt = obtener_modelo_v3(31).to(device)

            mejores_pesos, _ = ejecutar_entrenamiento_cnn(modelo_pt, train_loader, val_loader, device, epochs)

            metricas = evaluar_modelo_cnn(modelo_pt, val_loader, device)
            metricas['DiasFuturo'] = 5  # MLEngine.DIAS_PREDICCION

            MetricaService.guardar_metricas(db, modelo_db.IdModelo, metricas)

            # Guardar modelo con versionamiento
            ruta_version = version_manager.guardar_modelo_versionado(
                mejores_pesos,
                scaler,
                metricas,
                f"CNN_{modelo_db.Version}",
                modelo_db.Version,
                f"Entrenamiento CNN automático - {len(ids_empresas)} empresas"
            )

            logger.info("Modelo CNN guardado exitosamente",
                       extra={"version": modelo_db.Version, "accuracy": metricas.get('accuracy', 0),
                              "auc": metricas.get('auc', 0), "ruta": ruta_version})

        # Guardar scaler global (para compatibilidad)
        joblib.dump(scaler, os.path.join(ruta_modelos, "scaler_cnn.pkl"))

        logger.info("Pipeline CNN finalizado exitosamente")

    except Exception as e:
        logger.error("Error crítico en pipeline CNN", extra={"error": str(e)}, exc_info=True)
    finally:
        db.close()