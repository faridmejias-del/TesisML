import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importaciones limpias
import { Login, Home, Panel } from 'pages'; 
import { UserLayout, AdminLayout } from 'layouts'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA */}
        <Route path="/login" element={<Login />} />
        
        {/* RUTAS DE USUARIO (Usan el UserLayout) */}
        <Route element={<UserLayout />}>
          <Route path="/home" element={<Home />} />
        </Route>

        {/* RUTAS DE ADMINISTRADOR (Usan el AdminLayout) */}
        <Route element={<AdminLayout />}>
          <Route path="/panel" element={<Panel />} />
        </Route>

        {/* REDIRECCIÓN POR DEFECTO */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;