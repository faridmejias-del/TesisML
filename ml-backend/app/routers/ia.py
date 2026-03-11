# app/routers/ia.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.sessions import get_db
from app.models.empresa import Empresa
from app.models.precio_historico import PrecioHistorico
from app.ml.engine import MLEngine
from app.services.resultado_service import ResultadoService
import pandas as pd

router = APIRouter(prefix="/api/v1/ia", tags=["IA Engine"])

@router.post("/analizar/{empresa_id}")
def analizar_empresa_individual(empresa_id: int, db: Session = Depends(get_db)):
    """
    Ejecuta la predicción de IA para una sola empresa específica.
    """
    ml = MLEngine()
    
    # 1. Buscar la empresa
    empresa = db.query(Empresa).filter(Empresa.IdEmpresa == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    # 2. Obtener precios históricos (igual que en tu script)
    precios = db.query(PrecioHistorico).filter(
        PrecioHistorico.IdEmpresa == empresa_id
    ).order_by(PrecioHistorico.Fecha.desc()).limit(100).all()

    if len(precios) < 60: # Necesitas 60 días según tu MLEngine
        raise HTTPException(status_code=400, detail="Datos históricos insuficientes (mínimo 60 días)")

    # 3. Preparar el DataFrame
    df = pd.DataFrame([{
        'Close': float(p.PrecioCierre),
        'Volume': p.Volumen,
        'High' : float(p.PrecioCierre),
        'Low': float(p.PrecioCierre)
    } for p in reversed(precios)])

    # 4. Ejecutar el modelo
    prediccion_data = ml.predecir(df)
    
    if prediccion_data is None:
        raise HTTPException(status_code=500, detail="Error al procesar predicción")

    # 5. Guardar en la BD usando tu servicio
    try:
        ResultadoService.guardar_prediccion(db, empresa_id, prediccion_data, prediccion_data['features'])
        return {"status": "success", "message": f"Análisis de {empresa.NombreEmpresa} completado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar: {str(e)}")