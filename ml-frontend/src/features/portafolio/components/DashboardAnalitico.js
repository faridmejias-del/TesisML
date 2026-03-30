import React from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useAnalisisPortafolio } from '../hooks/useAnalisisPortafolio';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3'];

const DashboardAnalitico = () => {
    const { data, isLoading, error } = useAnalisisPortafolio();

    if (isLoading) return <CircularProgress />;
    if (error) return <Typography color="error">Error al cargar el análisis.</Typography>;
    if (!data || data.distribucion_sectores.length === 0) return <Typography>No hay suficientes datos. Añade empresas a tu portafolio.</Typography>;

    return (
        <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom>Dashboard Analítico de tu Portafolio</Typography>
            
            <Grid container spacing={3}>
                {/* Métricas Resumen */}
                <Grid size={{ xs:12, md:6 }}>
                    <Card elevation={3} sx={{ height: '100%', bgcolor: 'primary.light', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6">Volatilidad (Anualizada)</Typography>
                            {/* CAMBIO 1: Agregado de coalescencia nula (?? 0) */}
                            <Typography variant="h3">{data.metricas?.volatilidad ?? 0}%</Typography>
                            <Typography variant="body2">Riesgo estimado en base a fluctuación de precios de los últimos 30 días.</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs:12, md:6 }}>
                    <Card elevation={3} sx={{ height: '100%', bgcolor: 'secondary.light', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6">Ratio de Sharpe</Typography>
                            {/* CAMBIO 2: Agregado de coalescencia nula (?? 0) */}
                            <Typography variant="h3">{data.metricas?.sharpe_ratio ?? 0}</Typography>
                            <Typography variant="body2">
                                {(data.metricas?.sharpe_ratio ?? 0) > 1 ? "Excelente rendimiento frente al riesgo." : "Rendimiento promedio frente al riesgo asumido."}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Gráfico de Sectores (Se mantiene igual, funciona perfecto) */}
                <Grid size={{ xs:12, md:4 }}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="subtitle1" align="center">Distribución por Sector</Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={data.distribucion_sectores}
                                        dataKey="porcentaje"
                                        nameKey="sector"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {data.distribucion_sectores.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Gráfico Histórico Blindado */}
                <Grid size={{ xs:12, md:8 }}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="subtitle1" align="center">Rendimiento Histórico Consolidado (30 días)</Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={data.rendimiento_historico}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="fecha" tick={{fontSize: 12}} />
                                    
                                    {/* CAMBIO 3: Escala dinámica inteligente */}
                                    <YAxis domain={['dataMin', 'dataMax']} tickFormatter={(value) => `$${value}`} />
                                    
                                    <RechartsTooltip formatter={(value) => [`$${value.toFixed(2)}`, "Valor Total"]} />
                                    
                                    {/* CAMBIO 4: dot=true y connectNulls=true */}
                                    <Line 
                                        type="monotone" 
                                        dataKey="valor_total" 
                                        stroke="#8884d8" 
                                        strokeWidth={3} 
                                        dot={true} 
                                        activeDot={{ r: 8 }}
                                        connectNulls={true} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardAnalitico;