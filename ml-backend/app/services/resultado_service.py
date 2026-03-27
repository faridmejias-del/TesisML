from sqlalchemy.orm import Session
from app.models.resultado import Resultado
from datetime import datetime

class ResultadoService:
    @staticmethod
    def guardar_prediccion(db: Session, empresa_id: int, data_ml, features):
        try:
            nuevo_resultado = Resultado(
                IdEmpresa = empresa_id,
                PrecioActual = float(features['Close']),
                PrediccionIA = float(data_ml['prediccion']),
                VariacionPCT = float(data_ml['variacion']),
                RSI = float(features['RSI']),
                MACD = float(features['MACD']),
                ATR = float(features['ATR']),
                EMA20 = float(features['EMA20']),
                EMA50 = float(features['EMA50']),
                Score = float(data_ml['score']),
                Recomendacion = data_ml['recomendacion'],
                IdModelo = int(data_ml['id_modelo']),
                FechaAnalisis = datetime.utcnow()
            )
            db.add(nuevo_resultado)
            db.commit()
        except Exception as e:
            db.rollback() # Vital para no bloquear la base de datos
            print(f"⚠️ Error guardando empresa {empresa_id}: {e}")
            raise e

    @staticmethod
    def obtener_resultado_por_modeloia(db: Session, id_modelo_ia: int):
        # Corregido: La columna se llama IdModelo en el modelo SQLAlchemy
        return db.query(Resultado).filter(
            Resultado.IdModelo == id_modelo_ia
        ).order_by(Resultado.FechaAnalisis.desc()).all()