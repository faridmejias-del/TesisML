import yfinance as yf
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.sessions import SessionLocal
from app.models.empresa import Empresa
from app.models.precio_historico import PrecioHistorico
from datetime import datetime, timedelta

#Ejectur: python -m app.auto.actualizar_precios

def actualizar_precios():
    db = SessionLocal()
    try:
        empresas = db.query(Empresa).filter(Empresa.Activo == True).all()
        print(f"🚀 Iniciando actualización para {len(empresas)} empresas...")

        for empresa in empresas:
            # 1. Buscar la última fecha registrada
            ultima_fecha = db.query(func.max(PrecioHistorico.Fecha)).filter(
                PrecioHistorico.IdEmpresa == empresa.IdEmpresa
            ).scalar()

            # 2. Configurar la descarga
            if ultima_fecha:
                fecha_inicio = ultima_fecha + timedelta(days=1)
                if fecha_inicio >= datetime.now().date():
                    print(f"⏩ {empresa.Ticket} ya está actualizado.")
                    continue
                print(f"🔄 Actualizando {empresa.Ticket} desde {fecha_inicio}...")
                # Usamos auto_adjust=True para evitar el Warning de yfinance
                ticker_data = yf.download(empresa.Ticket, start=fecha_inicio, interval="1d", auto_adjust=True)
            else:
                print(f"📥 Descargando histórico (max) para {empresa.Ticket}...")
                ticker_data = yf.download(empresa.Ticket, period="max", interval="1d", auto_adjust=True)

            # 3. Procesar datos (Aquí está la corrección del error)
            if not ticker_data.empty:
                nuevos_registros = 0
                for fecha, fila in ticker_data.iterrows():
                    try:
                        # CORRECCIÓN: Usamos .item() o el acceso directo para asegurar un valor escalar
                        # En versiones nuevas de yfinance, 'Close' puede ser un MultiIndex
                        precio_val = fila['Close']
                        volumen_val = fila['Volume']

                        # Si es una Serie (debido al MultiIndex), extraemos el primer valor
                        if hasattr(precio_val, 'iloc'):
                            precio_val = precio_val.iloc[0]
                        if hasattr(volumen_val, 'iloc'):
                            volumen_val = volumen_val.iloc[0]

                        nuevo_precio = PrecioHistorico(
                            IdEmpresa=empresa.IdEmpresa,
                            Fecha=fecha.date(),
                            PrecioCierre=float(precio_val),
                            Volumen=int(volumen_val)
                        )
                        db.add(nuevo_precio)
                        nuevos_registros += 1
                    except Exception as e:
                        print(f"⚠️ Error en fila {fecha} para {empresa.Ticket}: {e}")
                        continue
                
                db.commit()
                print(f"✅ {empresa.Ticket}: {nuevos_registros} registros nuevos.")
            else:
                print(f"ℹ️ {empresa.Ticket}: No se encontraron datos.")

    except Exception as e:
        print(f"❌ Error crítico: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    actualizar_precios()