// src/features/portafolio/hooks/usePrediccionesIA.js
import { useState, useEffect } from 'react';
import resultadoService from '../../../services/resultadoService';

// Le quitamos el parámetro 'habilitado', ahora siempre consulta a la IA
export const usePrediccionesIA = () => {
    const [predicciones, setPredicciones] = useState({});
    const [cargandoIA, setCargandoIA] = useState(false);

    useEffect(() => {
        const cargarIA = async () => {
            try {
                setCargandoIA(true);
                const data = await resultadoService.obtenerUltimosResultados();
                
                // Diccionario para búsqueda instantánea
                const diccionario = {};
                data.forEach(resultado => { 
                    diccionario[resultado.IdEmpresa] = resultado; 
                });
                
                setPredicciones(diccionario);
            } catch (error) {
                console.error("Error al cargar predicciones de IA:", error);
            } finally {
                setCargandoIA(false);
            }
        };

        cargarIA();
    }, []); // Se ejecuta 1 sola vez al montar

    return { predicciones, cargandoIA };
};