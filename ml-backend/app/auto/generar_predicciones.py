import gc # Librería nativa de Python para el Recolector de Basura
import pandas as pd
import tensorflow as tf
from sqlalchemy.orm import Session
from app.models.empresa import Empresa
from app.models.precio_historico import PrecioHistorico
from app.models.modelo_ia import ModeloIA
from app.ml.engine import MLEngine
from app.services.resultado_service import ResultadoService

def ejecutar_analisis_diario(db: Session):
    print("🚀 Iniciando procesamiento secuencial de IA...")
    
    # 1. Consultar modelos y empresas activas
    modelos_activos = db.query(ModeloIA).filter(ModeloIA.Activo == True).all()
    if not modelos_activos:
        print("⚠️ No hay modelos de IA activos en la base de datos.")
        return

    empresas = db.query(Empresa).filter(Empresa.Activo == True).all()

    # 2. PRE-CALCULAR DATOS (Para no ir a la BD 100 veces por cada modelo)
    print("📊 Extrayendo y preparando indicadores financieros...")
    datos_preparados = []
    
    # Instanciamos una versión "fantasma" solo para usar sus fórmulas matemáticas.
    # Lanzará un aviso de "archivo no encontrado", pero es normal y seguro ignorarlo.
    engine_temp = MLEngine(version="dummy") 
    
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

        df_ind = engine_temp.calcular_indicadores(df)
        
        if len(df_ind) >= engine_temp.DIAS_MEMORIA_IA:
            datos_preparados.append({
                "empresa": empresa,
                "df_ind": df_ind
            })

    # 3. PROCESAMIENTO SECUENCIAL (Un modelo a la vez)
    for modelo in modelos_activos:
        print(f"\n⚙️ CARGANDO MOTOR: {modelo.Nombre} (ID: {modelo.IdModelo})")
        # Aquí la RAM sube al cargar los pesos
        engine = MLEngine(version=modelo.Version) 
        
        if engine.model is None:
            print(f"❌ Fallo al cargar el motor {modelo.Version}. Saltando...")
            continue

        print(f"🧠 Prediciendo con {modelo.Nombre}...")
        for data in datos_preparados:
            empresa = data["empresa"]
            df_ind = data["df_ind"]
            
            pred = engine.predecir(df_ind)
            if pred:
                pred['id_modelo'] = modelo.IdModelo
                try:
                    ResultadoService.guardar_prediccion(db, empresa.IdEmpresa, pred, pred['features'])
                except Exception as e:
                    print(f"❌ Error guardando resultado para {empresa.Ticket}: {e}")
                    
        print(f"✅ Predicciones listas para {modelo.Nombre}.")
        
        # 4. LIMPIEZA EXTREMA DE MEMORIA (El truco para no saturar la CPU)
        print("🧹 Destruyendo modelo y liberando memoria RAM...")
        del engine.model
        del engine
        tf.keras.backend.clear_session() # Esto borra el grafo oculto de TensorFlow
        gc.collect() # Esto le exige a Windows que devuelva la RAM inmediatamente

    print("\n🎉 Análisis diario completado exitosamente.")