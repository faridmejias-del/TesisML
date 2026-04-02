// src/pages/Landing/Landing.js
import React, { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, useThemeContext } from '../../context'; 

import { Box, Dialog, DialogContent, IconButton, Grid, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import AuthForm from '../../features/auth/components/AuthForm';
import EmpresaTable from '../../features/empresas/components/EmpresaTable';
import { useEmpresas } from '../../features/empresas/hooks/useEmpresas';

// Importamos los componentes del landing
import LandingNavbar from '../../features/landing/components/LandingNavbar'; 
import HeroSection from '../../features/landing/components/HeroSection';
import MisionVisionSection from '../../features/landing/components/MisionVisionSection';
import FaqSection from '../../features/landing/components/FaqSection';
import ContactoSection from '../../features/landing/components/ContactoSection';

export default function Landing() {
    const [modalAuth, setModalAuth] = useState({ open: false, esRegistro: false });
    const [activeTab, setActiveTab] = useState(0); // 0: Inicio, 1: Nosotros, 2: FAQ, 3: Contacto
    
    const { usuario } = useAuth();
    const { mode, toggleTheme } = useThemeContext();
    const { empresas, sectores, cargando } = useEmpresas();

    const manejarSeleccionEmpresa = useCallback((id, nombre) => {
        abrirModalAuth(true); 
    }, []);

    const abrirModalAuth = (modoRegistro) => {
        setModalAuth({ open: true, esRegistro: modoRegistro });
    };

    const cerrarModalAuth = () => {
        setModalAuth((prev) => ({ ...prev, open: false }));
    };

    if (usuario) {
        return <Navigate to={usuario.rol === 'admin' ? '/panel' : '/home'} replace />;
    }

    return (
        <Box sx={{ minHeight: '100vh', height: '100vh', overflowY: 'auto', backgroundColor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            
            <LandingNavbar 
                mode={mode} 
                toggleTheme={toggleTheme} 
                abrirModalAuth={abrirModalAuth} 
                activeTab={activeTab}         
                setActiveTab={setActiveTab}   
            />

            <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2, md: 4 }, pb: 8 }}>
                
                {/* PESTAÑA 0: INICIO (Hero Izquierda | Tabla Derecha) */}
                {activeTab === 0 && (
                    <Grid 
                        container 
                        spacing={4} 
                        sx={{ 
                            width: '100%', 
                            maxWidth: '1400px', 
                            mx: 'auto', 
                            alignItems: 'center', // <-- CAMBIO CLAVE: Centrado vertical
                            minHeight: { md: '80vh' } // Asegura que el contenedor tenga altura suficiente
                        }}
                    >
                        
                        {/* Lado Izquierdo: Hero Section */}
                        <Grid size={{ xs: 12, md: 5, lg: 5 }}>
                            <Box sx={{ pr: { md: 4 } }}>
                                <HeroSection abrirModalAuth={abrirModalAuth} />
                            </Box>
                        </Grid>

                        {/* Lado Derecho: Tabla de Empresas con Scroll */}
                        <Grid size={{ xs: 12, md: 7, lg: 7 }}>
                            <Paper elevation={0} sx={{ 
                                p: { xs: 2, md: 4 }, 
                                borderRadius: 4, 
                                backgroundColor: 'background.paper', 
                                border: '1px solid', 
                                borderColor: 'divider',
                                display: 'flex',
                                flexDirection: 'column',
                                height: { xs: 'auto', md: '80vh' } 
                            }}>
                                
                                {/* Contenedor con Scroll para la tabla */}
                                <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                                    <EmpresaTable 
                                        empresas={empresas}
                                        sectores={sectores}
                                        cargando={cargando}
                                        onSelect={manejarSeleccionEmpresa} 
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                    </Grid>
                )}

                {/* PESTAÑA 1: NOSOTROS (Misión y Visión) */}
                {activeTab === 1 && (
                    <Box sx={{ width: '100%', mt: { xs: 4, md: 8 }, display: 'flex', justifyContent: 'center' }}>
                        <MisionVisionSection />
                    </Box>
                )}

                {/* PESTAÑA 2: FAQ */}
                {activeTab === 2 && (
                    <Box sx={{ width: '100%', mt: { xs: 4, md: 8 }, display: 'flex', justifyContent: 'center' }}>
                        <FaqSection />
                    </Box>
                )}

                {/* PESTAÑA 3: CONTACTO */}
                {activeTab === 3 && (
                    <Box sx={{ width: '100%', mt: { xs: 4, md: 8 }, display: 'flex', justifyContent: 'center' }}>
                        <ContactoSection />
                    </Box>
                )}

            </Box>

            {/* Modal de Autenticación */}
            <Dialog 
                open={modalAuth.open} 
                onClose={cerrarModalAuth} 
                maxWidth="xs" 
                fullWidth
                disableRestoreFocus
            >
                <DialogContent sx={{ position: 'relative', p: 4 }}>
                    <IconButton onClick={cerrarModalAuth} sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                    <AuthForm modoInicialRegistro={modalAuth.esRegistro} />
                </DialogContent>
            </Dialog>

        </Box>
    );
}