import pandas as pd
from datetime import datetime
from app.db.sessions import SessionLocal
from app.models.models import Empresa, Sector

def poblar_desde_drive_file(csv_path):
    db = SessionLocal()
    try:
        # Cargamos el archivo descargado de Drive
        print(f"Procesando archivo: {csv_path}")
        df = pd.read_csv(csv_path)

        for _, row in df.iterrows():
            # 1. Gestión del Sector
            nombre_s = row['Sector']
            if pd.isna(nombre_s): continue
            
            sector = db.query(Sector).filter(Sector.NombreSector == nombre_s).first()
            if not sector:
                print(f"Creando nuevo sector: {nombre_s}")
                sector = Sector(NombreSector=nombre_s)
                db.add(sector)
                db.commit()
                db.refresh(sector)

            # 2. Gestión de la Empresa
            ticket_val = row['Ticker Yahoo Finance']
            nombre_e = row['Nombre Empresa']
            
            # Verificamos si la empresa ya existe para evitar duplicados
            empresa_existente = db.query(Empresa).filter(Empresa.Ticket == ticket_val).first()
            if not empresa_existente:
                print(f"Insertando: {nombre_e} ({ticket_val})")
                nueva_empresa = Empresa(
                    Ticket=ticket_val,
                    NombreEmpresa=nombre_e,
                    IdSector=sector.IdSector,
                    FechaAgregado=datetime.now()
                )
                db.add(nueva_empresa)
            else:
                print(f"Saltando {ticket_val}: ya existe en la base de datos.")

        db.commit()
        print("Carga de datos finalizada con éxito.")

    except Exception as e:
        db.rollback()
        print(f"Error durante la importación: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    poblar_desde_drive_file("Tickers.csv")
