import { api } from 'services';

const login = async (email, password) => {
  // FastAPI exige 'username' en formato x-www-form-urlencoded para el Login
  const formData = new URLSearchParams();
  formData.append('username', email); 
  formData.append('password', password);

  const response = await api.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  return response.data; // Retorna { access_token, token_type, usuario: {...} }
};

const authService = {
  login
};

export default authService;