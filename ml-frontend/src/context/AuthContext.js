// ml-frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, api } from 'services';
import { storage } from '../utils/storage'; 

const AuthContext = createContext();

const ROLES = { USUARIO_NORMAL: 1, ADMIN: 2 };

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const inicializarSesion = async () => {
      try {
        const sessionHint = await storage.obtenerItem('usuario');
        
        if (!sessionHint) {
          setCargando(false);
          return;
        }

        const userData = await authService.verificarSesion();
        setUsuario(userData);
      } catch (error) {
        console.log("La sesión expiró.");
        await storage.eliminarItem('usuario'); // Asegurar await aquí también
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    inicializarSesion();

    const handleSesionExpirada = async () => {
      setUsuario(null);
      await storage.eliminarItem('usuario');
    };

    // ⚠️ NOTA DE MIGRACIÓN: 'window' no existe en React Native. 
    // Para la web esto funciona, pero en móvil cambiarás esto por un EventEmitter (ej. DeviceEventEmitter)
    window.addEventListener('sesion-expirada', handleSesionExpirada);
    return () => window.removeEventListener('sesion-expirada', handleSesionExpirada);

  }, []);

  const actualizarDatos = async (nuevosDatos) => {
    const usuarioActualizado = { ...usuario, ...nuevosDatos };
    setUsuario(usuarioActualizado);
    await storage.guardarItem('usuario', usuarioActualizado);
  };

  const login = async (email, password) => {
    try {
      await authService.login(email, password);
      const userInfo = await authService.verificarSesion();

      await storage.guardarItem('usuario', userInfo);
      setUsuario(userInfo);

      return { success: true, usuario: userInfo };
    } catch (error) {
      return { success: false, message: error.response?.data?.detail || "Error de credenciales" };
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
      await storage.eliminarItem('usuario');
      setUsuario(null);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando, actualizarDatos, registro }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);