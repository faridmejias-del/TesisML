// src/components/HeroSection.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import landing1 from 'assets/landing1.png';

const HeroSection = ({ abrirModalAuth }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%', maxWidth: '1200px', flexWrap: 'wrap', gap: 4, mt: 4 }}>
            <Box sx={{ 
                maxWidth: '500px',
                textAlign: { xs: 'center', sm: 'left' }
            }}>
                <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{ 
                        fontWeight: '900', 
                        color: 'text.primary', 
                        mb: 2, 
                        lineHeight: 1.2,
                        fontSize: { xs: '2.2rem', sm: '3rem' }
                    }}
                >
                    Predicción Inteligente del Mercado
                </Typography>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        color: 'text.secondary', 
                        mb: { xs: 3, sm: 4 }, 
                        lineHeight: 1.6,
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}
                >
                    Plataforma avanzada de análisis financiero impulsada por Machine Learning. 
                    Visualiza tendencias y toma decisiones informadas con modelos predictivos de vanguardia.
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    onClick={() => abrirModalAuth(true)} 
                    sx={{ 
                        boxShadow: 3,
                        width: { xs: '100%', sm: 'auto' }, 
                        py: { xs: 1.5, sm: 1.2 },          
                        px: { sm: 4 },                     
                        fontSize: { xs: '1.1rem', sm: '1rem' },
                        fontWeight: 'bold',
                        borderRadius: 2
                    }}
                >
                    Comenzar ahora
                </Button>
            </Box>
            
            <Box sx={{ width: '400px', height: '300px', borderRadius: 4, display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>  
                <img src={landing1} alt="Análisis financiero" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '16px' }} />            
            </Box>
        </Box>
    );
};

export default HeroSection;