import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, CircularProgress, Typography, Box, Chip
} from '@mui/material';

const MetricasTable = ({ metricas, loading }) => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!metricas || metricas.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography color="text.secondary">No se encontraron métricas con los filtros actuales.</Typography>
            </Paper>
        );
    }

    return (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
            <Table size="small">
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                    <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha Entrenamiento</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Modelo</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Días Futuro</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Accuracy</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>F1 Score</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Loss / Val Loss</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Matriz (TP/TN/FP/FN)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {metricas.map((metrica) => (
                        <TableRow key={metrica.IdMetrica} hover>
                            <TableCell>{new Date(metrica.FechaEntrenamiento).toLocaleString()}</TableCell>
                            <TableCell>
                                <Chip 
                                    label={metrica.NombreModelo || `Mod-${metrica.IdModelo}`} 
                                    color="primary" 
                                    variant="outlined" 
                                    size="small" 
                                />
                            </TableCell>
                            <TableCell align="center">{metrica.DiasFuturo}</TableCell>
                            <TableCell align="right" sx={{ color: metrica.Accuracy > 0.52 ? 'success.main' : 'inherit', fontWeight: metrica.Accuracy > 0.52 ? 'bold' : 'normal' }}>
                                {Number(metrica.Accuracy).toFixed(4)}
                            </TableCell>
                            <TableCell align="right">{Number(metrica.F1_Score).toFixed(4)}</TableCell>
                            <TableCell align="right">
                                {Number(metrica.Loss).toFixed(4)} / {Number(metrica.ValLoss).toFixed(4)}
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="body2" component="span" color="success.main" fontWeight="bold" title="Verdaderos Positivos">{metrica.TP}</Typography> / {' '}
                                <Typography variant="body2" component="span" color="success.light" title="Verdaderos Negativos">{metrica.TN}</Typography> / {' '}
                                <Typography variant="body2" component="span" color="error.light" title="Falsos Positivos">{metrica.FP}</Typography> / {' '}
                                <Typography variant="body2" component="span" color="error.main" fontWeight="bold" title="Falsos Negativos">{metrica.FN}</Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default MetricasTable;