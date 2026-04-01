// src/features/ia_analisis/components/EntrenamientoSelector.js
import React, { useState } from 'react';
import { useEntrenamientoIA } from '../hooks/useEntrenamientoIA';
import { 
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, 
    Button, Box, FormControl, Select, MenuItem, InputLabel 
} from '@mui/material';

export default function EntrenamientoSelector() {
    const { modelos, modeloSeleccionado, setModeloSeleccionado, entrenando, ejecutarEntrenamiento } = useEntrenamientoIA();
    const [modalAbierto, setModalAbierto] = useState(false);

    const modeloInfo = modelos.find(m => m.IdModelo === parseInt(modeloSeleccionado));

    const confirmarYEjecutar = () => {
        setModalAbierto(false);
        ejecutarEntrenamiento();
    };

    return (
        <>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, // <-- FIX: En móvil se apilan, en PC se ponen uno al lado del otro
                alignItems: 'center', 
                gap: 2, 
                bgcolor: 'background.default', 
                p: 2, 
                borderRadius: 3, 
                border: '1px solid', 
                borderColor: 'divider',
                width: { xs: '100%', sm: 'auto' } // <-- FIX: Toma todo el ancho disponible en móvil
            }}>
                {/* FIX: minWidth cambia a width 100% en móvil */}
                <FormControl size="small" sx={{ width: { xs: '100%', sm: 200 } }}>
                    <InputLabel id="label-ia-selector">Seleccionar IA</InputLabel>
                    <Select
                        labelId="label-ia-selector"
                        value={modeloSeleccionado}
                        label="Seleccionar IA"
                        onChange={(e) => setModeloSeleccionado(e.target.value)}
                        disabled={entrenando}
                    >
                        {modelos.map((modelo) => (
                            <MenuItem key={modelo.IdModelo} value={modelo.IdModelo}>
                                {modelo.Nombre} (v{modelo.Version})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* FIX: El botón ocupa el 100% del ancho en móvil para ser fácil de tocar */}
                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => setModalAbierto(true)}
                    disabled={entrenando || modelos.length === 0}
                    sx={{ width: { xs: '100%', sm: 'auto' } }} 
                >
                    {entrenando ? '⏳ Entrenando...' : '🧠 Entrenar Seleccionado'}
                </Button>
            </Box>

            <Dialog open={modalAbierto} onClose={() => setModalAbierto(false)}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Confirmar Entrenamiento</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas iniciar el entrenamiento para el modelo: <strong>{modeloInfo?.Nombre}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => setModalAbierto(false)} color="inherit">Cancelar</Button>
                    <Button onClick={confirmarYEjecutar} variant="contained" color="secondary">
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}