// src/pages/Landing/Landing.js
import React, { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, useThemeContext } from '../../context'; 

import { Box, Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import AuthForm from '../../features/auth/components/AuthForm';
import EmpresaTable from '../../features/empresas/components/EmpresaTable';
import { useEmpresas } from '../../features/empresas/hooks/useEmpresas';

// Importamos los componentes desde la carpeta genérica
import LandingNavbar from '../../features/landing/components/LandingNavbar'; 
import HeroSection from '../../features/landing/components/HeroSection';

export default function Landing() {
    const [modalAuth, setModalAuth] = useState({ open: false, esRegistro: false });
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
            />

            <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2, md: 4 }, gap: 6 }}>
                
                <HeroSection abrirModalAuth={abrirModalAuth} />
                
                <Box sx={{ width: '100%', maxWidth: '1200px', mb: 4 }}>
                    <EmpresaTable 
                        empresas={empresas}
                        sectores={sectores}
                        cargando={cargando}
                        onSelect={manejarSeleccionEmpresa} 
                    />
                </Box>
            </Box>

            <Dialog 
                open={modalAuth.open} 
                onClose={cerrarModalAuth} 
                maxWidth="xs" 
                fullWidth
                disableRestoreFocus
            >
                <DialogContent sx={{ position: 'relative' }}>
                    <IconButton onClick={cerrarModalAuth} sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                    <AuthForm modoInicialRegistro={modalAuth.esRegistro} />
                </DialogContent>
            </Dialog>

        </Box>
    );
}