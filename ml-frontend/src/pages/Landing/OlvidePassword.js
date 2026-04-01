import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const OlvidePassword = () => {
    const [email, setEmail] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const res = await authService.solicitarRecuperacion(email);
            toast.success(res.message || "Correo enviado exitosamente");
            setEmail('');
        } catch (error) {
            toast.error(error.response?.data?.detail || "Error al solicitar recuperación");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
                    Recuperar Contraseña
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center" mb={3}>
                    Ingresa tu correo registrado y te enviaremos un enlace para crear una nueva contraseña.
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Correo Electrónico"
                        type="email"
                        variant="outlined"
                        margin="normal"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2, mb: 2 }}
                        disabled={cargando}
                    >
                        {cargando ? 'Enviando...' : 'Enviar Enlace'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default OlvidePassword;