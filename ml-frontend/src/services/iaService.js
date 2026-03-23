// ml-frontend/src/services/iaService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1/ia';
const MODELOS_URL = 'http://localhost:8000/api/v1/modelos-ia';

const iaService = {
    analizarTodo: async () => {
        const response = await axios.post(`${API_URL}/analizar-todo`);
        return response.data;
    },
    entrenarModelo: async (modeloId) => {
        const response = await axios.post(`${API_URL}/entrenar-modelo/${modeloId}`);
        return response.data;
    },
    obtenerModelosActivos: async () => {
        const response = await axios.get(`${MODELOS_URL}/activos`);
        return response.data;
    }
};

export default iaService;