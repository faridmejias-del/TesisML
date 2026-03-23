import pandas as pd
from sqlalchemy.orm import Session
from app.models.empresa import Empresa
from app.models.precio_historico import PrecioHistorico
from app.models.modelo_ia import ModeloIA
from app.ml.engine import MLEngine
from app.services.resultado_service import ResultadoService

def ejecutar_analisis_diario(db: Session):
    print("🚀 Iniciando procesamiento dinámico de IA...")
    
    # 1. Consultar a la BD qué modelos están activos para el testeo A/B
    modelos_activos = db.query(ModeloIA).filter(ModeloIA.Activo == True).all()
    
    if not modelos_activos:
        print("⚠️ No hay modelos de IA activos en la base de datos.")
        return

    # 2. Cargar en memoria RAM los motores con su ID respectivo
    motores = []
    for modelo in modelos_activos:
        print(f"⚙️ Cargando motor: {modelo.Nombre} (ID: {modelo.IdModelo})")
        # El MLEngine se encargará de buscar el archivo modelo_acciones_v1.keras, etc.
        engine = MLEngine(version=modelo.Version) 
        if engine.model is not None:
            motores.append({
                "id_modelo": modelo.IdModelo, 
                "motor": engine
            })
        else:
            print(f"❌ Fallo al cargar los archivos físicos del motor {modelo.Version}.")

    if not motores:
        print("⚠️ No se pudo inicializar ningún motor en memoria. Saliendo...")
        return

    empresas = db.query(Empresa).filter(Empresa.Activo == True).all()

    for empresa in empresas: 
        precios = db.query(PrecioHistorico).filter(
            PrecioHistorico.IdEmpresa == empresa.IdEmpresa
        ).order_by(PrecioHistorico.Fecha.desc()).limit(100).all()

        if len(precios) < 50: 
            continue

        df = pd.DataFrame([{
            'Close': float(p.PrecioCierre),
            'Volume': p.Volumen,
            'High' : float(p.PrecioCierre),
            'Low': float(p.PrecioCierre)
        } for p in reversed(precios)])

        # Calculamos indicadores usando la lógica del primer motor disponible
        # (Todos los modelos comparten la misma base matemática de Data Science)
        motor_principal = motores[0]["motor"]
        df_ind = motor_principal.calcular_indicadores(df)

        if len(df_ind) < motor_principal.DIAS_MEMORIA_IA: 
            continue

        # 3. Hacemos que CADA modelo activo prediga y le pasamos su ID de Base de Datos
        for item in motores:
            pred = item["motor"].predecir(df_ind)
            if pred:
                pred['id_modelo'] = item["id_modelo"] # Inyectamos el ID para la ForeignKey
                try:
                    ResultadoService.guardar_prediccion(db, empresa.IdEmpresa, pred, pred['features'])
                except Exception as e:
                    print(f"❌ Error guardando resultado (Modelo ID {item['id_modelo']}) para {empresa.Ticket}: {e}")

        print(f"✅ Empresa {empresa.Ticket} evaluada por {len(motores)} modelos.")