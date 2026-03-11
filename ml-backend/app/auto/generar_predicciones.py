from app.db.sessions import SessionLocal
from app.models.empresa import Empresa
from app.models.precio_historico import PrecioHistorico
from app.ml.engine import MLEngine
from app.services.resultado_service import ResultadoService
import pandas as pd

def ejecutar_analisis_diario():
    db = SessionLocal()
    ml = MLEngine()

    empresas = db.query(Empresa).filter(Empresa.Activo == True).all()

    for empresa in empresas: 
        # Últimos precios para calcular
        precios = db.query(PrecioHistorico).filter(
            PrecioHistorico.IdEmpresa == empresa.IdEmpresa
        ).order_by(PrecioHistorico.Fecha.desc()).limit(100).all()

        if len(precios) < 50: continue

        df = pd.DataFrame([{
            'Close': float(p.PrecioCierre),
            'Volume': p.Volumen,
            'High' : float(p.PrecioCierre),
            'Low': float(p.PrecioCierre)
        } for p in reversed(precios)])

        # Procesado y predicción (todo en un solo paso)
        prediccion_data = ml.predecir(df)
        
        if prediccion_data is None:
            print(f"⚠️ Datos insuficientes en DataFrame procesado para {empresa.NombreEmpresa}")
            continue

        # Extraemos los features del resultado
        features = prediccion_data['features']

        # Guardar resultados
        try:
            ResultadoService.guardar_prediccion(db, empresa.IdEmpresa, prediccion_data, features)
            print(f"✅ Análisis completado para {empresa.NombreEmpresa}")
        except Exception as e:
            print(f"❌ Error al guardar en BD para {empresa.NombreEmpresa}: {e}")

if __name__ == "__main__":
    ejecutar_analisis_diario()