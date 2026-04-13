// src/features/mercado/components/PrecioChart.js
import React, { memo, useState } from 'react';
// Cambiamos AreaChart por ComposedChart e incluimos Line
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    ComposedChart, Area, Line, Legend 
} from 'recharts';
import { 
    Box, Typography, ToggleButton, ToggleButtonGroup, 
    CircularProgress, Switch, FormControlLabel 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePrecioHistorico } from '../hooks/usePrecioHistorico';

function PrecioChart({ empresaId, nombreEmpresa }) {
    const theme = useTheme();
    const { datosFiltrados, rango, cargando, handleCambioRango } = usePrecioHistorico(empresaId);
    
    // Estado local para mostrar u ocultar los indicadores técnicos
    const [verBollinger, setVerBollinger] = useState(false);

    const botonesRango = [
        { label: '1 día', v: '1D' }, { label: '5 días', v: '5D' },
        { label: '1 mes', v: '1M' }, { label: '6 meses', v: '6M' },
        { label: '1 año', v: '1Y' }, { label: '5 años', v: '5Y' },
        { label: 'Todo', v: 'TODO' }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            
            {/* CABECERA CON CONTROLES */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: { xs: 'wrap', md: 'nowrap' }, 
                gap: 2, mb: 3 
            }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                        {nombreEmpresa || 'Cargando...'}
                    </Typography>
                    {/* Switch para activar Bollinger */}
                    <FormControlLabel
                        control={
                            <Switch 
                                size="small"
                                checked={verBollinger} 
                                onChange={(e) => setVerBollinger(e.target.checked)}
                                color="warning"
                            />
                        }
                        label={<Typography variant="caption" color="text.secondary">Bandas de Bollinger</Typography>}
                    />
                </Box>

                <ToggleButtonGroup
                    value={rango}
                    exclusive
                    onChange={handleCambioRango}
                    size="small"
                    color="primary"
                >
                    {botonesRango.map((b) => (
                        <ToggleButton key={b.v} value={b.v} sx={{ px: { xs: 1, sm: 2 }, fontSize: '0.75rem' }}>
                            {b.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>

            {/* CONTENEDOR DEL GRÁFICO */}
            <Box sx={{ width: '100%', flexGrow: 1, minHeight: 300, position: 'relative' }}>
                
                {!empresaId && (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography color="text.secondary">Selecciona una empresa para ver su historial</Typography>
                    </Box>
                )}
                
                {empresaId && cargando && (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2">Procesando datos...</Typography>
                    </Box>
                )}
                
                {empresaId && !cargando && datosFiltrados?.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                        {/* USAMOS COMPOSED CHART PARA MEZCLAR AREA Y LINEAS */}
                        <ComposedChart data={datosFiltrados} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPrecio" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                            
                            <XAxis 
                                dataKey="tiempoMs" 
                                type="number" 
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={(unixTime) => {
                                    const date = new Date(unixTime);
                                    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                                }}
                                fontSize={10} 
                                tick={{fill: theme.palette.text.secondary}} 
                                minTickGap={30}
                            />
                            
                            <YAxis 
                                domain={['auto', 'auto']} 
                                fontSize={10} 
                                orientation="right" 
                                tick={{fill: theme.palette.text.secondary}} 
                            />
                            
                            <Tooltip 
                                labelFormatter={(val) => new Date(val).toLocaleDateString('es-ES', { dateStyle: 'long' })}
                                contentStyle={{
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    boxShadow: theme.shadows[3],
                                    backgroundColor: theme.palette.background.paper
                                }} 
                            />
                            
                            {verBollinger && <Legend verticalAlign="top" height={36}/>}

                            {/* 1. AREA PRINCIPAL DEL PRECIO */}
                            <Area 
                                name="Precio"
                                type="monotone" 
                                dataKey="PrecioCierre" 
                                stroke={theme.palette.primary.main} 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#colorPrecio)" 
                            />

                            {/* 2. INDICADORES TÉCNICOS (Solo si el switch está ON) */}
                            {verBollinger && (
                                <>
                                    <Line 
                                        name="Media Móvil 20d"
                                        type="monotone" 
                                        dataKey="SMA_20" 
                                        stroke="#4caf50" 
                                        strokeDasharray="5 5" 
                                        dot={false} 
                                        strokeWidth={1.5}
                                    />
                                    <Line 
                                        name="Banda Sup"
                                        type="monotone" 
                                        dataKey="Banda_Superior" 
                                        stroke="#ff9800" 
                                        dot={false} 
                                        opacity={0.5}
                                        strokeWidth={1}
                                    />
                                    <Line 
                                        name="Banda Inf"
                                        type="monotone" 
                                        dataKey="Banda_Inferior" 
                                        stroke="#ff9800" 
                                        dot={false} 
                                        opacity={0.5}
                                        strokeWidth={1}
                                    />
                                </>
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </Box>
        </Box>
    );
} 

export default memo(PrecioChart);