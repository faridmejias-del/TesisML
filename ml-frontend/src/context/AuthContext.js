// ml-frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, api } from 'services';
import { storage } from '../utils/storage'; // <-- IMPORTAR STORAGE

const AuthContext = createContext();

const ROLES = {
  USUARIO_NORMAL: 1, 
  ADMIN: 2
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const inicializarSesion = async () => {
      // 1. Usar abstracción
      const sessionHint = storage.obtenerItem('usuario');
      
      if (!sessionHint) {
        setCargando(false);
        return;
      }

      try {
        const userData = await authService.verificarSesion();
        setUsuario(userData);
      } catch (error) {
        console.log("La sesión expiró.");
        // 2. Usar abstracción
        storage.eliminarItem('usuario');
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    inicializarSesion();

    // NUEVO: Escuchar el evento de sesión expirada que emite api.js
    const handleSesionExpirada = () => {
      setUsuario(null);
      storage.eliminarItem('usuario');
    };
    window.addEventListener('sesion-expirada', handleSesionExpirada);
    return () => window.removeEventListener('sesion-expirada', handleSesionExpirada);

  }, []);

  const actualizarDatos = (nuevosDatos) => {
    const usuarioActualizado = { ...usuario, ...nuevosDatos };
    setUsuario(usuarioActualizado);
    // 3. Usar abstracción
    storage.guardarItem('usuario', usuarioActualizado);
  };

  const login = async (email, password) => {
    try {
      await authService.login(email, password);
      const userInfo = await authService.verificarSesion();

      // 4. Usar abstracción
      storage.guardarItem('usuario', userInfo);
      setUsuario(userInfo);

      return { success: true, usuario: userInfo };
      
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || "Error de credenciales" 
      };
    }
  };

  const registro = async (nombre, apellido, email, password) => {
    try {
      const nuevoUsuario = {
        Nombre: nombre,
        Apellido: apellido,
        Email: email,
        PasswordU: password,
        IdRol: ROLES.USUARIO_NORMAL 
      };

      await api.post('/usuarios', nuevoUsuario);
      return await login(email, password);
      
    } catch (error) {
      const mensajeError = error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail || "Error al crear la cuenta. Verifica los datos.";
      return { success: false, message: mensajeError };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      // 5. Usar abstracción
      storage.eliminarItem('usuario');
      setUsuario(null);
    }
  };

  // 6. ELIMINAR el div de HTML. 
  // La lógica pura no debe dictar cómo se ve la interfaz de carga.
  // Es mejor exponer el estado 'cargando' y que el componente <App /> o tu Router decida qué mostrar.
  // (Si prefieres mantenerlo aquí por ahora, puedes dejarlo, pero en móvil tendrás que cambiar 'div' por 'View' y 'Text')
  
  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando, actualizarDatos, registro }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);