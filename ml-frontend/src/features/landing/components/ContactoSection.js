import React from 'react';
import { Box, Typography, TextField, Button, Grid, Paper } from '@mui/material';

export default function ContactoSection() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para enviar el formulario a futuro
  };

  return (
    <Box id="contacto" sx={{ width: '100%', maxWidth: '1200px' }}>
      <Typography variant="h3" component="h2" align="center" alignItems={"center"} sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
        Ponte en Contacto
      </Typography>
      <Typography variant="body1" align="center" sx={{ mb: 6, color: 'text.secondary' }}>
        ¿Tienes dudas o sugerencias? Escríbenos y te responderemos a la brevedad.
      </Typography>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Información</Typography>
            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
              <strong style={{ color: 'inherit' }}>Email:</strong> correo@consulta.com
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              <strong style={{ color: 'inherit' }}>Ubicación:</strong> Santiago Metropolitan Region, Chile
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 7 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Nombre" variant="outlined" required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Correo Electrónico" type="email" variant="outlined" required />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Mensaje" multiline rows={4} variant="outlined" required />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 2, px: 4, py: 1.5, borderRadius: 2 }}>
                    Enviar Mensaje
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}