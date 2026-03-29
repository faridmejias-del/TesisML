// src/features/mercado/hooks/usePrecioHistorico.js
import { useState, useEffect, useMemo } from 'react';
import { precioService } from '../../../services';

export const usePrecioHistorico = (empresaId) => {
    const [datosOriginales, setDatosOriginales] = useState([]);
    const [rango, setRango] = useState('6M');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (!empresaId) return;
        
        const cargarPrecios = async () => {
            setCargando(true);
            try {
                const data = await precioService.getByEmpresa(empresaId); 
                setDatosOriginales(data);
            } catch (error) {
                console.error("Error al cargar gráfica", error);
            } finally {
                setCargando(false);
            }
        };
        cargarPrecios();
    }, [empresaId]);

    const handleCambioRango = (event, nuevoRango) => {
        if (nuevoRango !== null) setRango(nuevoRango);
    };

    const datosFiltrados = useMemo(() => {
        if (!datosOriginales || !datosOriginales.length) return [];

        const formatearParaGrafica = (item, tipoCorta = true) => {
            let fechaObj;
            try {
                if (item.Fecha instanceof Date) {
                    fechaObj = item.Fecha;
                } else if (typeof item.Fecha === 'string') {
                    const isoStr = item.Fecha.replace(' ', 'T').split('.')[0];
                    fechaObj = new Date(isoStr);
                } else if (typeof item.Fecha === 'number') {
                    fechaObj = new Date(item.Fecha);
                }

                if (!fechaObj || isNaN(fechaObj.getTime())) {
                    fechaObj = new Date(item.Fecha);
                }

                if (isNaN(fechaObj.getTime())) return { ...item, fechaValida: null, FechaCorta: 'Err' };

                return {
                    ...item,
                    fechaValida: fechaObj,
                    FechaCorta: tipoCorta 
                        ? fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                        : fechaObj.toLocaleDateString('es-ES')
                };
            } catch (e) {
                return { ...item, fechaValida: null, FechaCorta: 'Err' };
            }
        };

        const datosProcesados = datosOriginales.map(d => formatearParaGrafica(d, rango !== 'TODO'));

        datosProcesados.sort((a, b) => {
            if (!a.fechaValida || !b.fechaValida) return 0;
            return a.fechaValida.getTime() - b.fechaValida.getTime();
        });
        
        if (rango === 'TODO') return datosProcesados;

        const datosConFecha = datosProcesados.filter(d => d.fechaValida);
        if (!datosConFecha.length) return [];

        const ultimaFecha = datosConFecha[datosConFecha.length - 1].fechaValida;
        const fechaLimite = new Date(ultimaFecha.getTime());

        if (rango === '1D') fechaLimite.setDate(fechaLimite.getDate() - 1);
        else if (rango === '5D') fechaLimite.setDate(fechaLimite.getDate() - 5);
        else if (rango === '1M') fechaLimite.setMonth(fechaLimite.getMonth() - 1);
        else if (rango === '6M') fechaLimite.setMonth(fechaLimite.getMonth() - 6);
        else if (rango === '1Y') fechaLimite.setFullYear(fechaLimite.getFullYear() - 1);
        else if (rango === '5Y') fechaLimite.setFullYear(fechaLimite.getFullYear() - 5);

        return datosProcesados.filter(d => d.fechaValida && d.fechaValida >= fechaLimite);
    }, [datosOriginales, rango]);

    return { datosFiltrados, rango, cargando, handleCambioRango };
};