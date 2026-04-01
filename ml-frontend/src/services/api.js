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
  (error) => {
    if (error.response && error.response.status === 401) {
      // 1. Usamos la abstracción en lugar de localStorage directo
      storage.eliminarItem('usuario');
      
      // 2. ELIMINAMOS el window.location.href. 
      // En su lugar, podemos disparar un evento global que el Layout o Router escuche
      // o simplemente dejar que el error se propague para que el Contexto cambie el estado.
      window.dispatchEvent(new CustomEvent('sesion-expirada'));
    }
    
    return Promise.reject(error);
  }
);

export default api;