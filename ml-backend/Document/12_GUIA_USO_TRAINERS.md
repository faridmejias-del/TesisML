# Guía de Uso: Trainers Refactorizados LSTM y CNN

## 📚 Índice
1. [Entrenamiento Básico](#entrenamiento-básico)
2. [Validación Cruzada](#validación-cruzada)
3. [Logging y Monitoreo](#logging-y-monitoreo)
4. [Evaluación de Modelos](#evaluación-de-modelos)
5. [Manejo de Excepciones](#manejo-de-excepciones)
6. [Ejemplos Completos](#ejemplos-completos)

---

## Entrenamiento Básico

### LSTM

```python
from app.ml.pipeline_lstm.trainer import ejecutar_entrenamiento_lstm
from app.ml.pipeline_lstm.data_processor import extraer_y_procesar_empresa, preparar_datos_lstm
from app.ml.arquitectura.v1_lstm import LSTMBidireccional
import torch

# 1. Preparar datos
id_empresa = 1
df_procesado = extraer_y_procesar_empresa(id_empresa)
if df_procesado is None:
    raise ValueError("No hay datos suficientes")

# 2. Crear dataloaders
train_loader, val_loader = preparar_datos_lstm([df_procesado], batch_size=50)

# 3. Crear modelo
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = LSTMBidireccional()
model.to(device)

# 4. Entrenar
pesos_mejores = ejecutar_entrenamiento_lstm(
    model=model,
    train_loader=train_loader,
    val_loader=val_loader,
    device=device,
    epochs=30
)

# 5. Cargar mejores pesos
model.load_state_dict(pesos_mejores)
```

### CNN

```python
from app.ml.pipeline_cnn.trainer import ejecutar_entrenamiento_cnn
from app.ml.pipeline_cnn.data_processor import extraer_y_procesar_empresa_cnn, preparar_datos_cnn
from app.ml.arquitectura.v1_cnn import CNNArchitecture
import torch

# 1. Preparar datos
df_procesado = extraer_y_procesar_empresa_cnn(id_empresa=1)
if df_procesado is None:
    raise ValueError("No hay datos suficientes")

# 2. Crear dataloaders
train_loader, val_loader = preparar_datos_cnn([df_procesado], batch_size=50)

# 3. Crear modelo
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = CNNArchitecture()
model.to(device)

# 4. Entrenar
pesos_mejores = ejecutar_entrenamiento_cnn(
    modelo=model,
    train_loader=train_loader,
    val_loader=val_loader,
    device=device,
    epochs=50
)

# 5. Cargar mejores pesos
model.load_state_dict(pesos_mejores)
```

---

## Validación Cruzada

### LSTM con K-Fold

```python
from app.ml.pipeline_lstm.trainer import ejecutar_validacion_cruzada_lstm
from app.ml.pipeline_lstm.data_processor import DataProcessor
from app.ml.arquitectura.v1_lstm import LSTMBidireccional
import torch

# Preparar datos
data_processor = DataProcessor()
lista_dfs = [extraer_y_procesar_empresa(i) for i in range(1, 6)]
lista_dfs = [df for df in lista_dfs if df is not None]

# Ejecutar validación cruzada
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
resultados = ejecutar_validacion_cruzada_lstm(
    model_class=LSTMBidireccional,
    data_processor=data_processor,
    device=device,
    k=5,
    epochs=30
)

# Resultados
print(f"Score promedio: {resultados['score_promedio']:.4f}")
print(f"Desviación estándar: {resultados['desviacion_estandar']:.4f}")
print(f"Scores por fold: {resultados['scores_por_fold']}")
```

### CNN con K-Fold

```python
from app.ml.pipeline_cnn.trainer import ejecutar_validacion_cruzada_cnn
from app.ml.pipeline_cnn.data_processor import DataProcessor
from app.ml.arquitectura.v1_cnn import CNNArchitecture
import torch

# Ejecutar validación cruzada
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
resultados = ejecutar_validacion_cruzada_cnn(
    model_class=CNNArchitecture,
    data_processor=data_processor,
    device=device,
    k=5,
    epochs=50
)

print(f"Score promedio CNN: {resultados['score_promedio']:.4f}")
print(f"Robustez (1/std): {1/resultados['desviacion_estandar']:.2f}")
```

---

## Logging y Monitoreo

### Acceder a Logs

Los logs se guardan en **formato JSON** en:
```
logs/lstm_training.log
logs/cnn_training.log
```

### Ejemplo de Log LSTM

```json
{
  "timestamp": "2025-04-15T15:30:45.123456",
  "level": "INFO",
  "logger": "ML.Trainer.LSTM",
  "message": "Epoch completada",
  "extra": {
    "epoch": 1,
    "train_loss": 0.2345,
    "val_accuracy": 0.8932,
    "val_auc": 0.9123,
    "val_score_global": 0.8927
  }
}
```

### Monitoreo en Tiempo Real

```python
from app.ml.core.logger import configurar_logger
import json

logger = configurar_logger("Monitor", archivo_log="logs/monitor.log")

# Durante el entrenamiento
logger.info("Checkpoint guardado",
           extra={
               "epoch": 25,
               "best_auc": 0.945,
               "model_size_mb": 15.2
           })

# Leer logs después
with open("logs/lstm_training.log") as f:
    for line in f:
        log_entry = json.loads(line)
        if log_entry["extra"]["val_auc"] > 0.94:
            print(f"Excelente AUC en epoch {log_entry['extra']['epoch']}")
```

---

## Evaluación de Modelos

### Evaluar LSTM

```python
from app.ml.pipeline_lstm.trainer import evaluar_modelo_lstm
import torch

model.eval()
metrics = evaluar_modelo_lstm(model, val_loader, device)

print(f"Accuracy: {metrics['accuracy']:.4f}")
print(f"Precision: {metrics['precision']:.4f}")
print(f"Recall: {metrics['recall']:.4f}")
print(f"F1-Score: {metrics['f1_score']:.4f}")
print(f"MAE: {metrics['mae']:.4f}")
print(f"AUC: {metrics['auc']:.4f}")

# Matriz de confusión
print(f"TP: {metrics['tp']}, TN: {metrics['tn']}")
print(f"FP: {metrics['fp']}, FN: {metrics['fn']}")
print(f"Horizon: {metrics['DiasFuturo']} días")
```

### Comparar Modelos

```python
from app.ml.core.metrics import MetricasNormalizadas

# Evaluar ambos modelos
lstm_metrics = evaluar_modelo_lstm(lstm_model, val_loader, device)
cnn_metrics = evaluar_modelo_cnn(cnn_model, val_loader, device)

# Calcular scores globales
lstm_score = MetricasNormalizadas.calcular_score_global(lstm_metrics)
cnn_score = MetricasNormalizadas.calcular_score_global(cnn_metrics)

print(f"LSTM Score Global: {lstm_score:.4f}")
print(f"CNN Score Global: {cnn_score:.4f}")
print(f"Ganador: {'LSTM' if lstm_score > cnn_score else 'CNN'}")
```

---

## Manejo de Excepciones

### Validación de Datos

```python
from app.ml.core.data_validation import DataValidator

validator = DataValidator()

# Validar dataframe
df_valido = validator.validar_y_limpiar(df_raw)

if df_valido is None:
    logger.error("Datos inválidos detectados")
    # Fallback o reintento
    df_valido = cargar_datos_backup()
else:
    print(f"✅ Datos validados: {len(df_valido)} filas")
```

### Manejo de NaN

```python
import numpy as np
from app.ml.pipeline_lstm.trainer import evaluar_modelo_lstm

# Los trainers manejan NaN automáticamente
metrics = evaluar_modelo_lstm(model, val_loader, device)

# Pero puedes verificar
if np.isnan(metrics['auc']):
    logger.warning("AUC no calculable - clase desbalanceada")
    # Usar métrica alternativa
    use_f1_instead = metrics['f1_score']
```

### Captura de GPU

```python
import torch

try:
    if torch.cuda.is_available():
        device = torch.device("cuda")
        logger.info("GPU disponible - using CUDA")
    else:
        device = torch.device("cpu")
        logger.warning("GPU no disponible - usando CPU")
except RuntimeError as e:
    logger.error(f"Error al inicializar GPU: {str(e)}")
    device = torch.device("cpu")
```

---

## Ejemplos Completos

### Pipeline LSTM Completo

```python
#!/usr/bin/env python3
"""Pipeline LSTM completo con logging y validación"""

import torch
from app.ml.pipeline_lstm.trainer import (
    ejecutar_entrenamiento_lstm,
    evaluar_modelo_lstm,
    ejecutar_validacion_cruzada_lstm
)
from app.ml.pipeline_lstm.data_processor import (
    extraer_y_procesar_empresa,
    preparar_datos_lstm
)
from app.ml.arquitectura.v1_lstm import LSTMBidireccional
from app.ml.core.logger import configurar_logger
from app.ml.core.metrics import MetricasNormalizadas

# Setup
logger = configurar_logger("Pipeline.LSTM", archivo_log="logs/pipeline_lstm.log")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

logger.info("Iniciando pipeline LSTM", extra={"device": device.type.upper()})

try:
    # 1. Cargar datos
    logger.info("Cargando datos...")
    df = extraer_y_procesar_empresa(id_empresa=1)
    if df is None:
        raise ValueError("No hay datos disponibles")
    
    # 2. Preparar dataloaders
    logger.info("Preparando dataloaders...")
    train_loader, val_loader = preparar_datos_lstm([df], batch_size=50)
    
    # 3. Crear modelo
    logger.info("Creando modelo LSTM...")
    model = LSTMBidireccional()
    model.to(device)
    
    # 4. Entrenar
    logger.info("Iniciando entrenamiento...")
    pesos = ejecutar_entrenamiento_lstm(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        device=device,
        epochs=30
    )
    
    # 5. Cargar mejores pesos
    model.load_state_dict(pesos)
    
    # 6. Evaluar
    logger.info("Evaluando modelo...")
    metrics = evaluar_modelo_lstm(model, val_loader, device)
    score = MetricasNormalizadas.calcular_score_global(metrics)
    
    logger.info("Pipeline completado exitosamente",
               extra={
                   "accuracy": metrics['accuracy'],
                   "auc": metrics['auc'],
                   "score_global": score
               })
    
    print(f"✅ Pipeline LSTM completado")
    print(f"   AUC: {metrics['auc']:.4f}")
    print(f"   Score Global: {score:.4f}")

except Exception as e:
    logger.error(f"Error en pipeline: {str(e)}")
    print(f"❌ Pipeline fallido: {str(e)}")
```

### Comparación LSTM vs CNN

```python
#!/usr/bin/env python3
"""Comparar rendimiento LSTM vs CNN"""

import torch
from app.ml.pipeline_lstm.trainer import evaluar_modelo_lstm
from app.ml.pipeline_cnn.trainer import evaluar_modelo_cnn
from app.ml.core.metrics import MetricasNormalizadas

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Cargar modelos entrenados
lstm_model = cargar_modelo_lstm("checkpoints/lstm_best.pt")
cnn_model = cargar_modelo_cnn("checkpoints/cnn_best.pt")

# Evaluar
lstm_metrics = evaluar_modelo_lstm(lstm_model, test_loader, device)
cnn_metrics = evaluar_modelo_cnn(cnn_model, test_loader, device)

# Comparar
lstm_score = MetricasNormalizadas.calcular_score_global(lstm_metrics)
cnn_score = MetricasNormalizadas.calcular_score_global(cnn_metrics)

print("=" * 50)
print("COMPARACIÓN LSTM vs CNN")
print("=" * 50)
print(f"{'Métrica':<15} {'LSTM':<12} {'CNN':<12}")
print("-" * 50)
print(f"{'Accuracy':<15} {lstm_metrics['accuracy']:.4f}     {cnn_metrics['accuracy']:.4f}")
print(f"{'Precision':<15} {lstm_metrics['precision']:.4f}     {cnn_metrics['precision']:.4f}")
print(f"{'Recall':<15} {lstm_metrics['recall']:.4f}     {cnn_metrics['recall']:.4f}")
print(f"{'F1-Score':<15} {lstm_metrics['f1_score']:.4f}     {cnn_metrics['f1_score']:.4f}")
print(f"{'MAE':<15} {lstm_metrics['mae']:.4f}     {cnn_metrics['mae']:.4f}")
print(f"{'AUC':<15} {lstm_metrics['auc']:.4f}     {cnn_metrics['auc']:.4f}")
print(f"{'Score Global':<15} {lstm_score:.4f}     {cnn_score:.4f}")
print("=" * 50)
print(f"Ganador: {'LSTM' if lstm_score > cnn_score else 'CNN'}")
```

---

## 🔍 Debugging

### Verificar que todo esté cargado correctamente

```python
import sys
import logging

# Verificar importaciones
try:
    from app.ml.pipeline_lstm.trainer import ejecutar_entrenamiento_lstm
    from app.ml.core.logger import configurar_logger
    from app.ml.core.metrics import MetricasNormalizadas
    print("✅ Todos los módulos importados correctamente")
except ImportError as e:
    print(f"❌ Error de importación: {e}")
    sys.exit(1)

# Verificar logger
logger = configurar_logger("Test", archivo_log="logs/test.log")
logger.info("Test de logger")
print("✅ Logger funcionando")

# Verificar GPU
import torch
if torch.cuda.is_available():
    print(f"✅ GPU disponible: {torch.cuda.get_device_name()}")
else:
    print("⚠️ GPU no disponible - usando CPU")
```

---

## 📞 Soporte

Para problemas específicos:
1. Revisa los logs en `logs/lstm_training.log` o `logs/cnn_training.log`
2. Verifica que DataValidator está validando correctamente
3. Asegúrate que los dataloaders no están vacíos
4. Comprueba GPU memory si usas CUDA

---

**Última actualización**: 15-04-2025  
**Versión**: 1.0  
**Estado**: Producción