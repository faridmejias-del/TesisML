// src/pages/Usuario/AnalisisPortafolio/AnalisisPortafolio.js
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import DashboardAnalitico from '../../../features/portafolio/components/DashboardAnalitico'; // Ajusta la ruta si es necesario
import ShowChartIcon from '@mui/icons-material/ShowChart';

const AnalisisPortafolio = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: '1400px', margin: '0 auto', pb: 4 }}>
       
       <Paper elevation={2} sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ backgroundColor: 'primary.main', p: 1.5, borderRadius: 2, display: 'flex', color: 'white', boxShadow: 2 }}>
            <ShowChartIcon fontSize="large" />
            </Box>
            <Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                Análisis de Portafolio:
                </Typography>
                <Typography variant="body1" color="text.secondary">
                Revisa el rendimiento histórico, métricas de riesgo y la distribución sectorial de tus activos.
                </Typography>
            </Box>
        </Paper>

      {/* Aquí renderizamos el dashboard que creamos en el paso anterior */}
      <DashboardAnalitico />
    </Box>
  );
};

export default AnalisisPortafolio;