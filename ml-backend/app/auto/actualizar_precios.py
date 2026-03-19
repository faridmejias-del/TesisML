# app/auto/actualizar_precios.py
import yfinance as yf
import pandas as pd
import warnings
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.empresa import Empresa
from app.models.precio_historico import PrecioHistorico
from datetime import datetime

warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

def actualizar_precios(db: Session):
    # Obtenemos las empresas activas
    empresas = db.query(Empresa).filter(Empresa.Activo == True).all()
    
    for empresa in empresas:
        try:
            # 1. Buscamos la última fecha registrada para esta empresa
            # Así solo le pedimos a Yahoo Finance lo que nos falta
            ultima_fecha = db.query(func.max(PrecioHistorico.Fecha)).filter(
                PrecioHistorico.IdEmpresa == empresa.IdEmpresa
            ).scalar()

            if ultima_fecha:
                # Descargamos solo desde la última fecha que tenemos
                data = yf.download(empresa.Ticket, start=ultima_fecha, interval="1d", auto_adjust=False)
            else:
                # Si la empresa es nueva y no tiene datos, descargamos todo
                data = yf.download(empresa.Ticket, period="max", interval="1d", auto_adjust=False)
            
            if not data.empty:
                nuevos_registros = 0
                
                # 2. OPTIMIZACIÓN: Cargamos las fechas que YA tenemos de esta empresa
                # en un Set de Python. Esto hace que la validación sea instantánea
                # y evita hacer miles de consultas a la base de datos.
                fechas_existentes = {
                    f[0] for f in db.query(PrecioHistorico.Fecha).filter(
                        PrecioHistorico.IdEmpresa == empresa.IdEmpresa
                    ).all()
                }
                
                # 3. Iteramos por TODAS las filas obtenidas (no solo iloc[-1])
                for fecha_yf, fila in data.iterrows():
                    fecha_actual = fecha_yf.date()
                    
                    # Verificamos si la fecha ya existe para esta empresa
                    if fecha_actual in fechas_existentes:
                        continue # Si ya la tenemos, saltamos al siguiente día
                    
                    # Extracción de close y volume
                    precio_bruto = fila['Close']
                    volumen_bruto = fila['Volume']
                    
                    if isinstance(precio_bruto, pd.Series):
                        precio_bruto = precio_bruto.iloc[0]
                    if isinstance(volumen_bruto, pd.Series):
                        volumen_bruto = volumen_bruto.iloc[0]
                        
                    # Convertimos a los tipos de datos exactos para la BD
                    precio_cierre_final = float(precio_bruto)
                    volumen_final = int(volumen_bruto)
                    
                    nuevo_precio = PrecioHistorico(
                        IdEmpresa=empresa.IdEmpresa,
                        Fecha=fecha_actual,
                        PrecioCierre=precio_cierre_final,
                        Volumen=volumen_final
                    )
                    db.add(nuevo_precio)
                    nuevos_registros += 1
            
            # Guardamos todos los registros nuevos de una sola vez por empresa
            db.commit() 
            print(f"✅ {empresa.Ticket} actualizado: {nuevos_registros} nuevos precios agregados.")
            
        except Exception as e:
            print(f"❌ Error actualizando {empresa.Ticket}: {e}")
            db.rollback()

# Bloque para poder probar el script directamente desde la terminal
if __name__ == "__main__":
    from app.db.sessions import SessionLocal
    db = SessionLocal()
    try:
        print("Iniciando actualización de precios...")
        actualizar_precios(db)
        print("Actualización completada con éxito.")
    finally:
        db.close()