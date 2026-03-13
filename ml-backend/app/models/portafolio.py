from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.sessions import Base
from sqlalchemy.sql import func


class Portafolio(Base):
    __tablename__ = "Portafolio"
    IdPortafolio = Column(Integer, primary_key=True, index=True)
    FechaAgregado = Column(DateTime, server_default=func.now())
    Activo = Column(String, nullable = False) #Activo, Inactivo)
    IdUsuario = Column(Integer, ForeignKey("Usuario.IdUsuario"))
    IdEmpresa = Column(Integer, ForeignKey("Empresa.IdEmpresa"))

    usuario = relationship("Usuario", back_populates="portafolios")
    empresa = relationship("Empresa", back_populates="portafolios")
