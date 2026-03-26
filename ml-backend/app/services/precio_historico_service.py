from datetime import datetime
from sqlalchemy.orm import Session
from app.models import PrecioHistorico, Empresa # Importación directa
from app.schemas.schemas import PrecioHistoricoCreate, PrecioHistoricoOut
from app.exceptions import ResourceNotFoundError, DuplicateResourceError, InvalidDataError
import math

class PrecioHistoricoService:

    @staticmethod
    def obtener_todos_precios_historicos(db: Session) -> list[PrecioHistoricoOut]:
        return db.query(PrecioHistorico).all()
    
    @staticmethod
    def obtener_precio_historico_por_empresa(db: Session, empresa_id: int) -> list[PrecioHistoricoOut]:
        precios = db.query(PrecioHistorico).filter(
            PrecioHistorico.IdEmpresa == empresa_id
        ).order_by(PrecioHistorico.Fecha.asc()).all()
        
        if not precios:
            raise ResourceNotFoundError("PrecioHistorico", "IdEmpresa", empresa_id)
        return precios

    @staticmethod
    def get_by_empresa(db: Session, empresa_id: int):
        # 1. Traemos los datos de la base de datos
        # Nota: Usamos PrecioHistorico directamente ya que está en tus imports
        resultados = db.query(PrecioHistorico).filter(
            PrecioHistorico.IdEmpresa == empresa_id
        ).all()
        
        # 2. LIMPIEZA: Filtramos cualquier registro que tenga NaN en el precio
        datos_limpios = []
        for r in resultados:
            # Verificamos si el precio existe y es un número válido
            if r.PrecioCierre is not None:
                try:
                    valor_float = float(r.PrecioCierre)
                    if math.isfinite(valor_float):
                        datos_limpios.append(r)
                except (ValueError, TypeError):
                    continue # Si no se puede convertir a número, lo ignoramos
                
        return datos_limpios