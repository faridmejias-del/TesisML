// src/pages/Usuario/ProyeccionesIA/ProyeccionesIA.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext'; 
import { useProyeccionesIA } from '../../../features/portafolio/hooks/useProyeccionesIA';
import iaService from '../../../services/iaService'; 
import TarjetaProyeccion from '../../../features/ia_analisis/components/TarjetaProyeccion';
import GraficoComparativo from '../../../features/ia_analisis/components/GraficoComparativo';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress} from '@mui/material'; 
import PageHeader from '../../../components/PageHeader';
import AreaChartIcon from '@mui/icons-material/AreaChart';

const VistaProyecciones = () => {
    const { usuario } = useAuth(); 
    const idUsuarioFiltro = usuario?.id;

    // Estados
    const [modelosActivos, setModelosActivos] = useState([]);
    const [modeloSeleccionado, setModeloSeleccionado] = useState('');
    const [cargandoModelos, setCargandoModelos] = useState(true); // <-- NUEVO ESTADO
    
    const [sectorSeleccionado, setSectorSeleccionado] = useState('');
    const [empresasComparar, setEmpresasComparar] = useState([]);

    // Cargar modelos de IA disponibles (Solo 1 vez al montar el componente)
    useEffect(() => {
        let montado = true;
        const fetchModelos = async () => {
            if (!usuario?.id) return; // Validación de seguridad

            try {
                // CAMBIO AQUÍ: Llamamos a obtenerModelosPorUsuario
                const data = await iaService.obtenerModelosPorUsuario(usuario.id);
                if (montado) {
                    setModelosActivos(data);
                    if (data.length > 0) {
                        setModeloSeleccionado(data[0].IdModelo);
                    } else {
                        // Si no tiene modelos, limpiamos el seleccionado
                        setModeloSeleccionado('');
                    }
                }
            } catch (error) {
                console.error("Error cargando modelos", error);
            } finally {
                if (montado) setCargandoModelos(false); 
            }
        };
        fetchModelos();
        return () => { montado = false; };
    }, [usuario?.id]);

    // Extraemos las proyecciones pasándole el modelo seleccionado
    const { proyecciones, sectores, cargando: cargandoProyecciones, error } = useProyeccionesIA(idUsuarioFiltro, modeloSeleccionado);
  
    // CORRECCIÓN: El spinner se mantiene si CUALQUIERA de los dos está cargando
    if (cargandoModelos || cargandoProyecciones) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" p={6} gap={2} sx={{ width: '100%', minHeight: '60vh' }}>
                <CircularProgress size={40} color="primary" />
                <Typography color="text.secondary" fontWeight="500">
                    Sincronizando IA y Proyecciones...
                </Typography>
            </Box>
        );
    }  

    if (error) return <div style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>{error}</div>;

    const proyeccionesFiltradas = proyecciones.filter(p => 
        sectorSeleccionado === '' || p.sector === sectorSeleccionado
    );

    const handleToggleComparar = (simbolo) => {
        setEmpresasComparar(prev => 
            prev.includes(simbolo) ? prev.filter(s => s !== simbolo) : [...prev, simbolo]
        );
    };

    const datosAComparar = proyecciones.filter(p => empresasComparar.includes(p.simbolo));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: '1400px', margin: '0 auto', pb: 4 }}>
            <PageHeader 
                titulo="Análisis Predictivo de tu Portafolio"
                subtitulo="Explora el directorio global, analiza el historial de precios y revisa las predicciones de la Inteligencia Artificial."
                icono={AreaChartIcon} 
            />

            {/* CONTROLES: Filtro Modelo IA y Sector */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', sm: 'flex-end' }, flexWrap: 'wrap', width: '100%' }}>
                
                {/* SELECTOR MODELO IA */}
                {modelosActivos.length > 0 && (
                    <FormControl sx={{ width: { xs: '100%', sm: 250 } }} size="small">
                        <InputLabel id="filtro-modelo-label">Modelo Predictivo</InputLabel>
                        <Select
                            labelId="filtro-modelo-label"
                            value={modeloSeleccionado}
                            label="Modelo Predictivo"
                            onChange={(e) => setModeloSeleccionado(e.target.value)}
                        >
                            {modelosActivos.map(modelo => (
                                <MenuItem key={modelo.IdModelo} value={modelo.IdModelo}>
                                    {modelo.Nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {/* SELECTOR SECTOR */}
                <FormControl sx={{ width: { xs: '100%', sm: 250 } }} size="small">
                    <InputLabel id="filtro-sector-label">Filtrar por Sector</InputLabel>
                    <Select
                        labelId="filtro-sector-label"
                        value={sectorSeleccionado}
                        label="Filtrar por Sector"
                        onChange={(e) => setSectorSeleccionado(e.target.value)}
                    >
                        <MenuItem value=""><em>Todos los sectores</em></MenuItem>
                        {sectores.map(sector => (
                            <MenuItem key={sector} value={sector}>{sector}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Gráfico Comparativo */}
            {empresasComparar.length >= 2 && (
                <Paper sx={{ p: { xs: 2, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                        Comparativa de Proyecciones ({empresasComparar.join(' vs ')})
                    </Typography>
                    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
                        <GraficoComparativo datos={datosAComparar} />
                    </Box>
                </Paper>
            )}
          
            {proyecciones.length === 0 && (
                <Box sx={{ textAlign: 'center', p: { xs: 3, sm: 5 }, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        No se encontraron empresas activas en tu portafolio.
                    </Typography>
                </Box>
            )}

            {/* Listado Tarjetas */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: 3 }}>
                {proyeccionesFiltradas.map((empresaData, index) => (
                    <TarjetaProyeccion 
                        key={index} 
                        datos={empresaData} 
                        seleccionado={empresasComparar.includes(empresaData.simbolo)}
                        onToggle={() => handleToggleComparar(empresaData.simbolo)}
                    />
                ))}
            </Box>

            {!cargandoModelos && modelosActivos.length === 0 && (
                <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2, border: '1px solid #ef4444' }}>
                    <Typography color="error" fontWeight="bold">
                        Actualmente no tienes modelos de IA habilitados en tu cuenta.
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        Contacta a un administrador para solicitar acceso a las proyecciones.
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default VistaProyecciones;