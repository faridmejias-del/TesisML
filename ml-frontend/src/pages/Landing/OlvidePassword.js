// src/pages/Landing/OlvidePassword.js
import React from 'react';
import { Box } from '@mui/material';
import OlvidePasswordForm from '../../features/auth/components/OlvidePasswordForm';

const OlvidePassword = () => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'background.default' }}>
            <OlvidePasswordForm />
        </Box>
    );
};

export default OlvidePassword;