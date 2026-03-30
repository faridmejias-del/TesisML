// src/pages/Usuario/AnalisisPortafolio/AnalisisPortafolio.js
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import DashboardAnalitico from '../../../features/portafolio/components/DashboardAnalitico'; // Ajusta la ruta si es necesario

const AnalisisPortafolio = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Análisis de Portafolio
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Revisa el rendimiento histórico, métricas de riesgo y la distribución sectorial de tus activos.
        </Typography>
      </Box>

      {/* Aquí renderizamos el dashboard que creamos en el paso anterior */}
      <DashboardAnalitico />
    </Container>
  );
};

export default AnalisisPortafolio;