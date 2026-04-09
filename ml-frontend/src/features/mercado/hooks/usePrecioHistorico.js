// src/features/mercado/hooks/usePrecioHistorico.js
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { precioService } from '../../../services';

export const usePrecioHistorico = (empresaId) => {
    const [rango, setRango] = useState('6M');

    const { data: datosOriginales, isLoading: cargando } = useQuery({
        queryKey: ['precios_historicos', empresaId],
        queryFn: () => precioService.getByEmpresa(empresaId),
        enabled: !!empresaId, 
        staleTime: 1000 * 60 * 10, 
    });

    const handleCambioRango = (event, nuevoRango) => {
        if (nuevoRango !== null) setRango(nuevoRango);
    };

    const datosFiltrados = useMemo(() => {
        if (!datosOriginales || !datosOriginales.length) return [];

        // 1. Limpieza estricta de datos (Remover NaNs que rompen Recharts y parsear Fechas)
        let datosLimpios = datosOriginales.map(item => {
            let fechaObj;
            if (item.Fecha instanceof Date) {
                fechaObj = item.Fecha;
            } else if (typeof item.Fecha === 'string') {
                fechaObj = new Date(item.Fecha.replace(' ', 'T').split('.')[0]);
            } else {
                fechaObj = new Date(item.Fecha);
            }

            const precio = parseFloat(item.PrecioCierre);

            return {
                ...item,
                fechaValida: isNaN(fechaObj.getTime()) ? null : fechaObj,
                PrecioCierre: isNaN(precio) ? null : precio // Si es NaN, guardamos null para que Recharts no colapse
            };
        }).filter(d => d.fechaValida !== null && d.PrecioCierre !== null);

        // 2. Ordenar cronológicamente
        datosLimpios.sort((a, b) => a.fechaValida.getTime() - b.fechaValida.getTime());
        
        if (datosLimpios.length === 0) return [];

        // 3. Aplicar Filtro de Tiempo
        let datosRecortados = datosLimpios;
        if (rango !== 'TODO') {
            const ultimaFecha = datosLimpios[datosLimpios.length - 1].fechaValida;
            const fechaLimite = new Date(ultimaFecha.getTime());

            if (rango === '1D') fechaLimite.setDate(fechaLimite.getDate() - 1);
            else if (rango === '5D') fechaLimite.setDate(fechaLimite.getDate() - 5);
            else if (rango === '1M') fechaLimite.setMonth(fechaLimite.getMonth() - 1);
            else if (rango === '6M') fechaLimite.setMonth(fechaLimite.getMonth() - 6);
            else if (rango === '1Y') fechaLimite.setFullYear(fechaLimite.getFullYear() - 1);
            else if (rango === '5Y') fechaLimite.setFullYear(fechaLimite.getFullYear() - 5);

            datosRecortados = datosLimpios.filter(d => d.fechaValida >= fechaLimite);
            
            // Seguridad: Si el filtro recortó tanto que quedó vacío (ej. 1 día fin de semana), 
            // devolvemos al menos los últimos 5 datos para que la gráfica no quede blanca.
            if (datosRecortados.length === 0) {
                datosRecortados = datosLimpios.slice(-5);
            }
        }

        // 4. Formatear Fechas para la Gráfica (Dependiendo del Rango)
        const tipoCorta = rango !== 'TODO';
        
        return datosRecortados.map(d => ({
            ...d,
            FechaCorta: tipoCorta 
                ? d.fechaValida.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                : d.fechaValida.toLocaleDateString('es-ES'),
            FechaLarga: d.fechaValida.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
        }));

    }, [datosOriginales, rango]);

    return { datosFiltrados, rango, cargando, handleCambioRango };
};