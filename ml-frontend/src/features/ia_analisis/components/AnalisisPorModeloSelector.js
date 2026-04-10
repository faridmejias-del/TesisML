// src/features/ia_analisis/components/AnalisisPorModeloSelector.js
import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import api from '../../../services/api';
import iaService from '../../../services/iaService';

export default function AnalisisPorModeloSelector() {
    const [modelos, setModelos] = useState([]);
    const [modeloSeleccionado, setModeloSeleccionado] = useState('');
    const [ejecutando, setEjecutando] = useState(false);

    useEffect(() => {
        cargarModelos();
    }, []);

    const cargarModelos = async () => {
        try {
            const res = await api.get('/modelos-ia');
            setModelos(res.data);
        } catch (error) {
            console.error("Error al cargar modelos", error);
        }
    };

    const handleEjecutar = async () => {
        if (!modeloSeleccionado) return;
        try {
            setEjecutando(true);
            const res = await iaService.analizarPorModelo(modeloSeleccionado);
            alert(res.mensaje || `Análisis de predicciones iniciado para el modelo ID: ${modeloSeleccionado}`);
        } catch (error) {
            console.error("Error al ejecutar análisis por modelo", error);
            alert("Error al iniciar las predicciones");
        } finally {
            setEjecutando(false);
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, 
            p: 3, mt: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 2, 
            bgcolor: 'background.paper', width: '100%', maxWidth: '500px' 
        }}>
            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                Ejecutar Predicciones por Modelo
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                <FormControl sx={{ minWidth: 200, flexGrow: 1 }}>
                    <InputLabel id="select-modelo-label">Seleccionar IA</InputLabel>
                    <Select
                        labelId="select-modelo-label"
                        value={modeloSeleccionado}
                        label="Seleccionar IA"
                        onChange={(e) => setModeloSeleccionado(e.target.value)}
                        disabled={ejecutando}
                    >
                        {modelos.map((m) => (
                            <MenuItem key={m.IdModelo} value={m.IdModelo}>
                                {m.Nombre} (v{m.Version})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={ejecutando ? <CircularProgress size={20} color="inherit" /> : <PlayCircleOutlineIcon />}
                    onClick={handleEjecutar}
                    disabled={!modeloSeleccionado || ejecutando}
                    sx={{ height: '56px' }} // Para que coincida con la altura del Select
                >
                    Ejecutar
                </Button>
            </Box>
        </Box>
    );
}