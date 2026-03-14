// ml-frontend/src/components/AnalisisIAButton.js
import React, { useState } from 'react';
import iaService from '../services/iaService';

function AnalisisIAButton({ onComplete }) {
    const [ejecutando, setEjecutando] = useState(false);

    const manejarEjecucionMasiva = async () => {
        const confirmar = window.confirm("¿Deseas ejecutar el análisis de IA para todas las empresas? Esto puede tardar unos minutos.");
        if (!confirmar) return;

        setEjecutando(true);
        try {
            // Llamamos al nuevo método masivo
            const response = await iaService.analizarTodo(); 
            alert(response.message || "¡Proceso masivo iniciado con éxito!");
            
            if (onComplete) onComplete(); 
        } catch (error) {
            console.error(error);
            alert("Error al iniciar el análisis masivo");
        } finally {
            setEjecutando(false);
        }
    };

    return (
        <button 
            onClick={manejarEjecucionMasiva}
            disabled={ejecutando}
            style={{
                backgroundColor: ejecutando ? '#94a3b8' : '#4f46e5', // Un morado más profesional
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: ejecutando ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.3s ease'
            }}
        >
            {ejecutando ? '🤖 Analizando Mercado...' : '🚀 Ejecutar IA Masiva'}
        </button>
    );
}

export default AnalisisIAButton;