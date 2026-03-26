// src/pages/Landing/Landing.js
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
// 1. IMPORTAMOS TODOS LOS COMPONENTES QUE USASTE
import { 
    AuthForm, 
    AdminPanel, 
    AnalisisIAButton, 
    PrecioChart, 
    ResultadoPanel, 
    EmpresaTable 
} from 'components'; 
import { useAuth } from 'context';

export default function Landing() {
    const [mostrarLogin, setMostrarLogin] = useState(false);
    const { usuario } = useAuth();

    // 2. AGREGAMOS EL ESTADO Y LA FUNCIÓN PARA LA TABLA Y LOS GRÁFICOS
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState({ id: null, nombre: '' });

    const manejarSeleccionEmpresa = (id, nombre) => {
        setEmpresaSeleccionada({ id, nombre });
    };

    // Si el usuario ya tiene sesión, lo enviamos directo a su panel
    if (usuario) {
        return <Navigate to={usuario.rol === 'admin' ? '/panel' : '/home'} replace />;
    }

    return (
        <div style={estilos.container}>
            {/* BARRA DE NAVEGACIÓN SUPERIOR */}
            <nav style={estilos.navbar}>
                <div style={estilos.logo}>
                    <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>📈</span>
                    TesisML
                </div>
                <button onClick={() => setMostrarLogin(true)} style={estilos.btnLogin}>
                    Iniciar Sesión
                </button>
            </nav>

            {/* CONTENIDO PRINCIPAL */}
            <main style={estilos.main}>
                
                {/* HERO SECTION (Agrupado en heroContainer para mantener el orden) */}
                <div style={estilos.heroContainer}>
                    <div style={estilos.heroText}>
                        <h1 style={estilos.titulo}>Predicción Inteligente del Mercado</h1>
                        <p style={estilos.descripcion}>
                            Plataforma avanzada de análisis financiero impulsada por Machine Learning. 
                            Gestiona tu portafolio, visualiza tendencias y toma decisiones informadas 
                            con nuestros modelos predictivos de vanguardia.
                        </p>
                        <button onClick={() => setMostrarLogin(true)} style={estilos.btnCallToAction}>
                            Comenzar ahora
                        </button>
                    </div>
                    
                    <div style={estilos.heroImagePlaceholder}>
                        PONER ALGUNA IMAGEN RELACIONADA 
                    </div>
                </div>

                {/* CONTENEDOR DE DATOS (Tradicional) */}
                <div style={estilos.contenedorSeccion}>
                    <h3 style={estilos.subtitulo}>Gestión de Datos</h3>
                    <AdminPanel /> 
                </div>

                {/* CONTENEDOR EXTERNO DE IA (Separado) */}
                <div style={{...estilos.contenedorSeccion, backgroundColor: '#f8f9ff', border: '1px solid #e0e7ff'}}>
                    <h3 style={{...estilos.subtitulo, color: '#4f46e5'}}>Inteligencia Artificial</h3>
                    <p style={estilos.descripcion}>
                        Calcula predicciones, RSI y Scores para todas las empresas activas en la base de datos.
                    </p>
                    <AnalisisIAButton onComplete={() => console.log("IA Masiva iniciada")} />
                </div>

                {/* Sección de Info Selección actual (Solo texto) */}
                {empresaSeleccionada.id && (
                    <div style={estilos.barraInfo}>
                        <span>Visualizando datos de: <strong>{empresaSeleccionada.nombre}</strong></span>
                    </div>
                )}

                <div style={estilos.seccionAnalisis}>
                    <div style={{ flex: 3, minWidth: '300px' }}>
                        <PrecioChart empresaId={empresaSeleccionada.id} nombreEmpresa={empresaSeleccionada.nombre} />
                    </div>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <ResultadoPanel empresaId={empresaSeleccionada.id} />
                    </div>
                </div>

                <div style={estilos.seccionDatos}>
                    <EmpresaTable onSelect={manejarSeleccionEmpresa} />
                </div>

            </main>

            {/* MODAL FLOTANTE DE LOGIN */}
            {mostrarLogin && (
                <div style={estilos.modalOverlay} onClick={() => setMostrarLogin(false)}>
                    {/* Detenemos la propagación para que al hacer clic dentro del modal no se cierre */}
                    <div style={estilos.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button style={estilos.btnCerrar} onClick={() => setMostrarLogin(false)}>
                            ✖
                        </button>
                        
                        <AuthForm />
                        
                    </div>
                </div>
            )}
        </div>
    );
}

// 3. ESTILOS COMPLETOS (Incluyendo los que faltaban para los paneles)
const estilos = {
    container: { height: '100vh', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' },    navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5%', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    logo: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center' },
    btnLogin: { backgroundColor: 'white', color: '#4f46e5', border: '2px solid #4f46e5', padding: '8px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
    
    // Ajustado para organizar los elementos en forma de columna descendente
    main: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 5%', gap: '2rem' },
    
    // Hero Section
    heroContainer: { display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' },
    heroText: { maxWidth: '500px' },
    titulo: { fontSize: '3rem', color: '#0f172a', lineHeight: '1.2', marginBottom: '1rem' },
    descripcion: { fontSize: '1.1rem', color: '#475569', lineHeight: '1.6', marginBottom: '2rem' },
    btnCallToAction: { backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.3)' },
    heroImagePlaceholder: { width: '400px', height: '300px', backgroundColor: '#e2e8f0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.2rem', fontWeight: 'bold', border: '2px dashed #cbd5e1' },
    
    // Estilos del Modal Flotante
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '16px', position: 'relative', width: '90%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s ease-out' },
    btnCerrar: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' },

    // Nuevos estilos para los contenedores de datos que agregaste
    contenedorSeccion: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: '1200px' },
    subtitulo: { fontSize: '1.5rem', color: '#1e293b', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' },
    barraInfo: { backgroundColor: '#e0e7ff', color: '#4338ca', padding: '10px 20px', borderRadius: '8px', width: '100%', maxWidth: '1200px', textAlign: 'center' },
    seccionAnalisis: { display: 'flex', gap: '20px', width: '100%', maxWidth: '1200px', flexWrap: 'wrap' },
    seccionDatos: { width: '100%', maxWidth: '1200px' }
};