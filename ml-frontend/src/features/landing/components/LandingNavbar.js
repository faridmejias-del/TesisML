// src/components/LandingNavbar.js
import React from 'react';
import { 
    AppBar, Toolbar, Typography, Box, 
    Button, IconButton, Tooltip 
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { APP_NAME } from 'config';

const LandingNavbar = ({ mode, toggleTheme, abrirModalAuth }) => {
    return (
        <AppBar position="static" color="inherit" elevation={1} sx={{ px: { xs: 2, md: '5%' } }}>
            <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                {/* LOGO / NOMBRE */}
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {APP_NAME}
                </Typography>
                
                {/* ACCIONES DERECHA */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                    
                    {/* BOTÓN DE MODO CLARO/OSCURO */}
                    <Tooltip title={mode === 'dark' ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}>
                        <IconButton onClick={toggleTheme} color="inherit">
                            {mode === 'dark' ? <LightModeIcon sx={{ color: '#fbbf24' }} /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>

                    <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={() => abrirModalAuth(false)} 
                        sx={{ fontWeight: 'bold' }}
                    >
                        Ingresar
                    </Button>

                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => abrirModalAuth(true)} 
                        sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'flex' } }}
                    >
                        Registrarse
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default LandingNavbar;