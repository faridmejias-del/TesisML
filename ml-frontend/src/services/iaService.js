// src/services/iaService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1/ia';

export const iaService = {
    analizar: async (empresaId) => {
        try {
            const response = await axios.post(`${API_URL}/analizar/${empresaId}`);
            return response.data;
        } catch (error) {
            console.error("Error ejecutando IA:", error);
            throw error;
        }
    }
};

export default iaService;