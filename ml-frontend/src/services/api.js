// ml-frontend/src/services/api.js
import axios from 'axios';
// Importamos nuestra nueva utilidad de storage
import { storage } from '../utils/storage'; 

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, 
    withCredentials: true 
});

api.interceptors.response.use(
  (response) => response,
  async (error) => { // Agregar async aquí
    if (error.response && error.response.status === 401) {
      await storage.eliminarItem('usuario'); 
      window.dispatchEvent(new CustomEvent('sesion-expirada'));
    }
    return Promise.reject(error);
  }
);

export default api;