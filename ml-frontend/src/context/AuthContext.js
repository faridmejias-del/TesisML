import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, api } from 'services'; // Añadimos 'api' aquí

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userGuardado = localStorage.getItem('usuario');
    
    if (token && userGuardado) {
      setUsuario(JSON.parse(userGuardado));
    }
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    try {
      // 1. Llamamos a FastAPI para obtener el Token
      const data = await authService.login(email, password);

      // 2. Guardamos el token INMEDIATAMENTE en el navegador.
      // Esto es clave para que 'api.js' lo inyecte en la siguiente petición.
      localStorage.setItem('token', data.access_token);

      // 3. Ahora que tenemos el token, pedimos los datos reales del usuario
      const userResponse = await api.get(`/usuarios/email/${email}`);
      const datosUsuario = userResponse.data;

      // 4. Normalizamos el rol para las rutas protegidas
      const nombreRolDb = datosUsuario.rol?.NombreRol?.toLowerCase() || 'usuario';
      const rolEstandarizado = nombreRolDb.includes('admin') ? 'admin' : 'usuario';

      const userInfo = {
        id: datosUsuario.IdUsuario,
        nombre: `${datosUsuario.Nombre} ${datosUsuario.Apellido || ''}`.trim(),
        email: datosUsuario.Email,
        rol: rolEstandarizado
      };

      // 5. Guardamos el perfil en estado y localStorage
      localStorage.setItem('usuario', JSON.stringify(userInfo));
      setUsuario(userInfo);

      // 6. Redirigimos según rol
      if (userInfo.rol === 'admin') {
        navigate('/panel');
      } else {
        navigate('/home');
      }

      return { success: true };
      
    } catch (error) {
      console.error("Error de autenticación:", error);
      
      // Si falla, borramos cualquier rastro de token a medias
      localStorage.removeItem('token'); 
      
      return { 
        success: false, 
        message: error.response?.data?.detail || "Error al verificar las credenciales" 
      };
    }
  };

  // NUEVA FUNCIÓN: REGISTRO
  const registro = async (nombre, apellido, email, password) => {
    try {
      // Por defecto, asignamos IdRol: 2 (que según tu base de datos es Usuario Normal)
      const nuevoUsuario = {
        Nombre: nombre,
        Apellido: apellido,
        Email: email,
        PasswordU: password,
        IdRol: 1 
      };

      // 1. Llamamos a la API para crear el usuario
      await api.post('/usuarios', nuevoUsuario);

      // 2. Si se crea con éxito, iniciamos sesión automáticamente
      return await login(email, password);
      
    } catch (error) {
      console.error("Error al registrar:", error);
      // FastAPI manda los errores de validación en format detail[0].msg o detail (string)
      const mensajeError = error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail || "Error al crear la cuenta. Verifica los datos.";
      return { success: false, message: mensajeError };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/login');
  };

  if (cargando) return <div style={{display: 'flex', justifyContent:'center', marginTop:'20vh'}}>Cargando sesión...</div>;

  return (
    <AuthContext.Provider value={{ usuario, login, logout, registro}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);