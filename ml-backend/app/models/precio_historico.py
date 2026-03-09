from sqlalchemy import Column, Integer, DECIMAL, ForeignKey, Date, BigInteger, Boolean
from sqlalchemy.orm import relationship
from app.db.sessions import Base

class PrecioHistorico(Base):
    __tablename__ = "PrecioHistorico"
    
    IdPrecioHistorico = Column(Integer, primary_key=True, index=True)
    IdEmpresa = Column(Integer, ForeignKey("Empresa.IdEmpresa"), nullable=False)
    Fecha = Column(Date, nullable=False)
    PrecioCierre = Column(DECIMAL(18, 4), nullable=False)
    Volumen = Column(BigInteger, nullable=False)

    # Relación inversa con Empresa
    empresa = relationship("Empresa", back_populates="precios_historicos")
