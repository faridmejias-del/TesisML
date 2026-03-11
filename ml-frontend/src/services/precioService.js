// src/services/precioService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1/precio_historico';

export const precioService = {
    // Obtener historial por ID de empresa
    getByEmpresa: async (empresaId) => {
        try {
            const response = await axios.get(`${API_URL}/empresa/${empresaId}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener precios históricos:", error);
            throw error;
        }
    }
};

export default precioService; 