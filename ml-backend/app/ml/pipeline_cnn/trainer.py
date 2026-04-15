import copy
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.amp import autocast, GradScaler
from torch.optim.lr_scheduler import StepLR
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_absolute_error, roc_auc_score, confusion_matrix
from tqdm import tqdm
import logging

from app.ml.core.engine import MLEngine
from app.ml.core.logger import configurar_logger
from app.ml.core.metrics import MetricasNormalizadas
from app.ml.core.validation import validacion_cruzada_k_fold
from app.ml.core.early_stopping import EarlyStopping

# Configurar logger
logger = configurar_logger("ML.Trainer.CNN", archivo_log="logs/cnn_training.log")

def ejecutar_entrenamiento_cnn(modelo, train_loader, val_loader, device, epochs=50):
    optimizer = optim.Adam(modelo.parameters(), lr=0.002)
    scheduler = StepLR(optimizer, step_size=max(1, epochs // 4), gamma=0.5)
    scaler = GradScaler(enabled=(device.type == 'cuda'))

    criterio_reg = nn.HuberLoss(delta=0.01)
    criterio_clf = nn.BCEWithLogitsLoss()

    early_stopping = EarlyStopping(paciencia=8, delta=0.002)

    logger.info("Iniciando entrenamiento CNN",
               extra={"device": device.type.upper(), "batches": len(train_loader), "epochs": epochs})

    if torch.cuda.is_available():
        logger.info("GPU disponible",
                   extra={"gpu_name": torch.cuda.get_device_name(),
                          "vram_gb": torch.cuda.get_device_properties(0).total_memory // 1024**3})

    mejor_modelo = None

    for epoch in range(epochs):
        modelo.train()
        train_loss = 0.0

        loop = tqdm(train_loader, desc=f"Epoch [{epoch+1}/{epochs}]", leave=False)
        for batch_x, batch_y_reg, batch_y_clf in loop:
            batch_x, batch_y_reg, batch_y_clf = batch_x.to(device), batch_y_reg.to(device), batch_y_clf.to(device)

            optimizer.zero_grad()

            with autocast(device_type=device.type):
                pred_reg, pred_clf = modelo(batch_x)
                loss = criterio_reg(pred_reg, batch_y_reg) + criterio_clf(pred_clf, batch_y_clf)

            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(modelo.parameters(), max_norm=1.0)
            scaler.step(optimizer)
            scaler.update()

            train_loss += loss.item()

        scheduler.step()

        # Validación al final de cada epoch
        val_metrics = evaluar_modelo_cnn(modelo, val_loader, device)
        val_score = MetricasNormalizadas.calcular_score_global(val_metrics)

        logger.info("Epoch completada",
                   extra={"epoch": epoch+1, "train_loss": train_loss/len(train_loader),
                          "val_accuracy": val_metrics['accuracy'], "val_auc": val_metrics['auc'],
                          "val_score_global": val_score})

        # Early stopping
        early_stopping(val_score)
        if early_stopping.mejor_score == val_score:
            mejor_modelo = copy.deepcopy(modelo.state_dict())

        if early_stopping.debe_parar():
            logger.info("Early stopping activado", extra={"epoch": epoch+1, "mejor_score": early_stopping.mejor_score})
            break

    # Retornar mejores pesos encontrados
    if mejor_modelo is None:
        mejor_modelo = modelo.state_dict()

    logger.info("Entrenamiento CNN completado", extra={"epochs_completadas": epoch+1})
    return mejor_modelo

def evaluar_modelo_cnn(modelo, val_loader, device):
    modelo.eval()
    y_real_clf, y_prob_clf, y_real_reg, y_pred_reg = [], [], [], []

    with torch.no_grad():
        for xv, yrv, ycv in val_loader:
            xv = xv.to(device)
            pred_reg, pred_clf = modelo(xv)

            y_prob_clf.extend(torch.sigmoid(pred_clf).cpu().numpy().flatten())
            y_real_clf.extend(ycv.numpy().flatten())
            y_pred_reg.extend(pred_reg.cpu().numpy().flatten())
            y_real_reg.extend(yrv.numpy().flatten())

    # Sanitizar las salidas antes de Sklearn
    # Por si acaso la red escupe un NaN residual, lo convertimos en un 0 para no romper la web.
    y_prob_clf = np.nan_to_num(np.array(y_prob_clf), nan=0.0)
    y_pred_reg = np.nan_to_num(np.array(y_pred_reg), nan=0.0)

    y_pred_clf = (y_prob_clf > 0.5).astype(int)

    cm = confusion_matrix(y_real_clf, y_pred_clf)
    tn, fp, fn, tp = cm.ravel() if cm.shape == (2, 2) else (0,0,0,0)

def ejecutar_validacion_cruzada_cnn(model_class, data_processor, device, k=5, epochs=50):
    """
    Ejecuta validación cruzada k-fold para el modelo CNN.

    Args:
        model_class: Clase del modelo CNN
        data_processor: Instancia del data processor
        device: Dispositivo para entrenamiento
        k: Número de folds para validación cruzada
        epochs: Número de epochs por fold

    Returns:
        dict: Resultados de validación cruzada con métricas promedio
    """
    logger.info("Iniciando validación cruzada CNN", extra={"k_folds": k, "epochs_por_fold": epochs})

    def train_fold_function(train_data, val_data):
        # Crear modelo para este fold
        model = model_class()
        model.to(device)

        # Preparar dataloaders
        train_loader = data_processor.crear_dataloaders_generico(train_data, batch_size=32, shuffle=True)
        val_loader = data_processor.crear_dataloaders_generico(val_data, batch_size=32, shuffle=False)

        # Entrenar modelo
        mejores_pesos = ejecutar_entrenamiento_cnn(model, train_loader, val_loader, device, epochs)

        # Cargar mejores pesos y evaluar
        model.load_state_dict(mejores_pesos)
        metrics = evaluar_modelo_cnn(model, val_loader, device)

        return MetricasNormalizadas.calcular_score_global(metrics), metrics

    # Ejecutar validación cruzada
    resultados = validacion_cruzada_k_fold(
        data_processor.df_procesado,
        train_fold_function,
        k=k
    )

    logger.info("Validación cruzada CNN completada",
               extra={"score_promedio": resultados['score_promedio'],
                      "desviacion_estandar": resultados['desviacion_estandar']})

    return resultados