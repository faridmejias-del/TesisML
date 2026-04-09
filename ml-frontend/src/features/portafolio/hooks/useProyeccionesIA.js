// src/features/portafolio/hooks/useProyeccionesIA.js
import { useState, useEffect, useCallback } from 'react';
import iaService from '../../../services/iaService';
import portafolioService from '../../../services/portafolioService';
import empresaService from '../../../services/empresaService';

export const useProyeccionesIA = (usuarioId, modeloId = null) => {
    const [proyecciones, setProyecciones] = useState([]);
    const [sectores, setSectores] = useState([]); 
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const cargarDatos = useCallback(async () => {
        if (!usuarioId) {
            setCargando(false);
            return;
        }

        try {
            setCargando(true);
            const [todosLosPortafolios, dataEmpresas] = await Promise.all([
                portafolioService.obtenerTodos(),
                empresaService.obtenerEmpresasConSectores() 
            ]);
    
            const misConexiones = todosLosPortafolios.filter(
                p => p.IdUsuario === usuarioId && p.Activo !== false
            );
            
            const datosCompletos = await Promise.all(
                misConexiones.map(async (item) => {
                    const infoEmpresa = dataEmpresas.empresas.find(e => e.IdEmpresa === item.IdEmpresa);
                    const analisis = await iaService.obtenerPrediccionEmpresa(item.IdEmpresa, modeloId);
                            
                    return {
                        idEmpresa: item.IdEmpresa,
                        empresa: infoEmpresa ? infoEmpresa.NombreEmpresa : `Empresa #${item.IdEmpresa}`,
                        simbolo: infoEmpresa ? infoEmpresa.Ticket : 'N/A',
                        sector: infoEmpresa ? infoEmpresa.NombreSector : 'Sin Sector',
                        historial: analisis.historial,
                        prediccion: analisis.prediccion,
                        confianza: analisis.confianza || 0,
                        tendencia: analisis.tendencia
                    };
                })
            );

            setProyecciones(datosCompletos);
            const sectoresUnicos = [...new Set(datosCompletos.map(d => d.sector))].filter(Boolean).sort();
            setSectores(sectoresUnicos);

        } catch (err) {
            setError('Hubo un problema al cargar las proyecciones.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    }, [usuarioId, modeloId]); 

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    return { proyecciones, sectores, cargando, error }; 
};