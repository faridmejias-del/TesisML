# app/auto/actualizar_precios.py
import yfinance as yf
import pandas as pd
import warnings
from sqlalchemy.orm import Session
from app.models.empresa import Empresa
from app.models.precio_historico import PrecioHistorico

warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

def actualizar_precios(db: Session):
    # Obtenemos las empresas activas
    empresas = db.query(Empresa).filter(Empresa.Activo == True).all()
    
    for empresa in empresas:
        try:
            data = yf.download(empresa.Ticket, period="max", interval="1d", auto_adjust=False)
            
            if not data.empty:
                # 1. OPTIMIZACIÓN: Cargamos las fechas que ya existen para no consultar la BD 10,000 veces
                fechas_bd = db.query(PrecioHistorico.Fecha).filter(PrecioHistorico.IdEmpresa == empresa.IdEmpresa).all()
                fechas_existentes = {f[0] for f in fechas_bd} # Lo convertimos en un Set para búsquedas instantáneas
                
                nuevos_registros = []
                
                # 2. Recorremos TODA la historia descargada
                for index, row in data.iterrows():
                    fecha_yf = index.date()
                    
                    # Si la fecha ya existe en la BD, pasamos al siguiente día
                    if fecha_yf in fechas_existentes:
                        continue
                        
                    # Extracción de Close y Volume
                    precio_bruto = row['Close']
                    volumen_bruto = row['Volume']
                    
                    if isinstance(precio_bruto, pd.Series):
                        precio_bruto = precio_bruto.iloc[0]
                    if isinstance(volumen_bruto, pd.Series):
                        volumen_bruto = volumen_bruto.iloc[0]
                        
                    # Evitamos errores si algún día el mercado no reportó datos (NaN)
                    if pd.isna(precio_bruto) or pd.isna(volumen_bruto):
                        continue
                        
                    # Convertimos a los tipos de datos exactos para la Base de Datos
                    precio_cierre_final = float(precio_bruto)
                    volumen_final = int(volumen_bruto)
                    
                    nuevo_precio = PrecioHistorico(
                        IdEmpresa=empresa.IdEmpresa,
                        Fecha=fecha_yf,
                        PrecioCierre=precio_cierre_final,
                        Volumen=volumen_final
                    )
                    nuevos_registros.append(nuevo_precio)
                
                # 3. Inserción Masiva
                if nuevos_registros:
                    db.bulk_save_objects(nuevos_registros)
                    db.commit() # Guardamos los miles de registros de un solo golpe
                    print(f"✅ {empresa.Ticket}: Se agregaron {len(nuevos_registros)} nuevos días.")
                else:
                    print(f"⚡ {empresa.Ticket}: Ya estaba completamente al día.")
            
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