// src/pages/Admin/Tareas/Tareas.js
import React from 'react';
import AdminPanelTareas from '../../../features/admin/components/AdminPanelTareas';
import AnalisisIAButton from '../../../features/ia_analisis/components/AnalisisIAButton';
import EntrenamientoSelector from '../../../features/ia_analisis/components/EntrenamientoSelector';
import { useEmpresas } from '../../../features/empresas/hooks/useEmpresas';

import { Box, Typography, Paper, Divider } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import PageHeader from '../../../components/PageHeader';

const AdminTareas = () => {
  const { cargarDatos } = useEmpresas();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 4 }, width: '100%', maxWidth: '1400px', margin: '0 auto', pb: 4 }}>

        <PageHeader 
            titulo="Tareas y Mantenimiento ML"
            subtitulo="Ejecución de scripts de base de datos y operaciones de Inteligencia Artificial."
            icono={BuildIcon} 
        />

        {/* FIX: Redujimos el padding en pantallas xs (móviles) */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">
                Ejecutar Inteligencia Artificial Predictiva
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {/* FIX: Redujimos el padding vertical (py) en móviles */}
            <Box sx={{ textAlign: 'center', py: { xs: 2, sm: 4 } }}>
                <AnalisisIAButton onComplete={cargarDatos} />
                
                {/* FIX: Redujimos el margen superior (mt) para que no haya un espacio gigante en móvil */}
                <Box sx={{ mt: { xs: 3, sm: 6 }, display: 'flex', justifyContent: 'center' }}>
                    <EntrenamientoSelector />
                </Box>
            </Box>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">
                Extracción de Datos (Yahoo Finance)
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <AdminPanelTareas />
        </Paper>

    </Box>
  );
};

export default AdminTareas;