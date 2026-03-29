// src/features/ia_analisis/hooks/useResultadoIA.js
import { useState, useEffect } from 'react';
import { resultadoService } from '../../../services';

export const useResultadoIA = (empresaId) => {
    const [resultado, setResultado] = useState(null);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const cargarResultado = async () => {
            if (!empresaId) return;
            
            setCargando(true);
            try {
                const data = await resultadoService.getByEmpresa(empresaId);
                if (data && data.length > 0) {
                    setResultado(data[data.length - 1]);
                } else {
                    setResultado(null);
                }
            } catch (error) {
                console.error("Error cargando resultados:", error);
                setResultado(null);
            } finally {
                setCargando(false);
            }
        };

        cargarResultado();
    }, [empresaId]);

    // Lógica visual abstraída para que la vista solo pregunte "¿Es compra?"
    const recomendacionTexto = resultado?.Recomendacion || "Sin datos";
    const esCompra = recomendacionTexto.toLowerCase().includes('alcista') || 
                     recomendacionTexto.toLowerCase().includes('compra');

    return { resultado, cargando, recomendacionTexto, esCompra };
};