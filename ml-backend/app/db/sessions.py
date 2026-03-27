from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base # <- Importación recuperada
from app.core.config import settings

# Forzamos la desactivación de prepared statements para evitar errores de duplicidad
engine = create_engine(
    settings.DATABASE_URL,
    execution_options={
        "prepared_statement_cache_size": 0
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ESTA ES LA LÍNEA CLAVE QUE FALTABA
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()