// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from 'pages'; // Importación absoluta y limpia

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Definimos la ruta para el login */}
        <Route path="/login" element={<Login />} />
        
        {/* Redirección por defecto: cualquier otra ruta manda al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;