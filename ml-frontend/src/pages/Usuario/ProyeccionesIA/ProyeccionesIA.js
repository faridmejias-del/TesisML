// src/pages/Usuario/ProyeccionesIA/ProyeccionesIA.js
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext'; 
import { useProyeccionesIA } from '../../../features/portafolio/hooks/useProyeccionesIA';
import TarjetaProyeccion from '../../../features/ia_analisis/components/TarjetaProyeccion';
import GraficoComparativo from '../../../features/ia_analisis/components/GraficoComparativo';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress} from '@mui/material'; 
import PageHeader from '../../../components/PageHeader';
import AreaChartIcon from '@mui/icons-material/AreaChart';

const VistaProyecciones = () => {
  const { usuario } = useAuth(); 
  const idUsuarioFiltro = usuario?.id;

  // Extraemos la nueva propiedad 'sectores'
  const { proyecciones, sectores, cargando, error } = useProyeccionesIA(idUsuarioFiltro);
  
  // Estados para las nuevas funcionalidades
  const [sectorSeleccionado, setSectorSeleccionado] = useState('');
  const [empresasComparar, setEmpresasComparar] = useState([]);

    if (cargando) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={6} gap={2} sx={{ width: '100%' }}>
                <CircularProgress size={30} color="primary" />
            </Box>
        );
}  if (error) return <div style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>{error}</div>;

  // Filtrado de las proyecciones a mostrar
  const proyeccionesFiltradas = proyecciones.filter(p => 
    sectorSeleccionado === '' || p.sector === sectorSeleccionado
  );

  // Lógica para seleccionar/deseleccionar empresas
  const handleToggleComparar = (simbolo) => {
    setEmpresasComparar(prev => 
        prev.includes(simbolo) 
            ? prev.filter(s => s !== simbolo) 
            : [...prev, simbolo]
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

        {/* CONTROLES: Filtro por Sector */}
        <Box sx={{ 
            display: 'flex', 
            // En móvil se centra (o se estira), en PC se va a la derecha
            justifyContent: { xs: 'center', sm: 'flex-end' }, 
            width: '100%' 
        }}>
            <FormControl 
                sx={{ 
                    // En móvil ocupa el 100% del ancho, en PC un mínimo de 250px
                    width: { xs: '100%', sm: 250 } 
                }} 
                size="small"
            >
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

        {/* GRÁFICO COMPARATIVO: Se muestra solo si hay 2 o más empresas seleccionadas */}
        {empresasComparar.length >= 2 && (
            <Paper sx={{ 
                p: { xs: 2, sm: 4 }, // FIX: Padding reducido en móvil para dar espacio al gráfico
                border: '1px solid', 
                borderColor: 'divider' // FIX: Se adapta automáticamente al modo claro/oscuro
            }}>
                <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    gutterBottom 
                    color="primary.main"
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} // FIX: Texto un poco más pequeño en móvil
                >
                    Comparativa de Proyecciones ({empresasComparar.join(' vs ')})
                </Typography>
                
                {/* Contenedor extra por seguridad, ayuda a que el gráfico no desborde si falla el ResponsiveContainer */}
                <Box sx={{ width: '100%', overflowX: 'hidden' }}>
                    <GraficoComparativo datos={datosAComparar} />
                </Box>
            </Paper>
        )}
      
        {proyecciones.length === 0 && !cargando && (
            <Box sx={{ 
                textAlign: 'center', 
                p: { xs: 3, sm: 5 }, // FIX: Padding adaptativo
                bgcolor: 'background.default', 
                borderRadius: 2 
            }}>
                <Typography 
                    variant="h6" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} // FIX: Evita que el texto gigante rompa la pantalla en celular
                >
                    No se encontraron empresas activas en tu portafolio.
                </Typography>
            </Box>
        )}

        {/* LISTADO DE TARJETAS */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: 3 }}>
            {proyeccionesFiltradas.map((empresaData, index) => (
                <TarjetaProyeccion 
                    key={index} 
                    datos={empresaData} 
                    // Nuevas propiedades:
                    seleccionado={empresasComparar.includes(empresaData.simbolo)}
                    onToggle={() => handleToggleComparar(empresaData.simbolo)}
                />
            ))}
        </Box>
    </Box>
  );
};

export default VistaProyecciones;