# app/routers/admin.py
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.sessions import get_db
from app.auto.importar_tickers import importar_desde_csv
from app.auto.actualizar_precios import ejecutar_actualizacion_masiva

router = APIRouter(prefix="/api/v1/admin", tags=["Administración"])

@router.post("/importar-tickers")
def api_importar(db: Session = Depends(get_db)):
    importar_desde_csv(db)
    return {"message": "Importación masiva completada exitosamente."}

@router.post("/actualizar-precios")
def api_actualizar_precios(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Se ejecuta en segundo plano para no bloquear el frontend
    background_tasks.add_task(ejecutar_actualizacion_masiva)
    return {"message": "Proceso de actualización iniciado en segundo plano."}