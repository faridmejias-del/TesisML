# app/auto/actualizar_precios.py
import yfinance as yf
from sqlalchemy.orm import Session
from app.models.empresa import Empresa
from app.models.precio_historico import PrecioHistorico
from datetime import datetime

def actualizar_precios(db: Session):
    empresas = db.query(Empresa).filter(Empresa.Activo == True).all()
    
    for empresa in empresas:
        try:
            
            # Descargamos los últimos datos (ej. últimos 5 días para asegurar)
            data = yf.download(empresa.Ticket, period="max", interval="1d", auto_adjust=False)
            
            if not data.empty:
                # Tomamos el último registro disponible
                ultimo_precio = data.iloc[-1]
                fecha_yf = data.index[-1]
                
                # Evitar duplicados por fecha
                existe = db.query(PrecioHistorico).filter(
                    PrecioHistorico.IdEmpresa == empresa.IdEmpresa,
                    PrecioHistorico.Fecha == fecha_yf.date()
                ).first()
                
                if not existe:
                    nuevo_precio = PrecioHistorico(
                        IdEmpresa=empresa.IdEmpresa,
                        Fecha=fecha_yf.date(),
                        PrecioCierre=float(ultimo_precio['Close']),
                        Volumen=int(ultimo_precio['Volume'])
                    )
                    db.add(nuevo_precio)
            
            db.commit() # Guardamos por cada empresa para no perder progreso
        except Exception as e:
            print(f"Error actualizando {empresa.Ticket}: {e}")
            db.rollback()