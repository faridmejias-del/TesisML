from datetime import datetime
from sqlalchemy.orm import Session
from app.models import PrecioHistorico, Empresa
from app.schemas.schemas import PrecioHistoricoCreate, PrecioHistoricoOut
from app.exceptions import ResourceNotFoundError, DuplicateResourceError, InvalidDataError

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