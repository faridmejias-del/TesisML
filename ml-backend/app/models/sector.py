from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.db.sessions import Base


class Sector(Base):
    __tablename__ = "Sector"
    IdSector = Column(Integer, primary_key=True, index=True)
    NombreSector = Column(String(50), nullable=False)
    Activo = Column(Boolean, default=True)
    FechaCreacion = Column(DateTime)

    empresas = relationship("Empresa", back_populates="sector")
