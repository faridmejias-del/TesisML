import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing, Home, Panel } from 'pages'; 
import { UserLayout, AdminLayout } from 'layouts'; 
import { AuthProvider, useAuth } from 'context';

// Componente Guardián: Evalúa si puedes entrar o te expulsa
const RutaProtegida = ({ children, rolPermitido }) => {
  const { usuario } = useAuth();
  
  if (!usuario) {
    return <Navigate to="/login" replace />; // Si no hay sesión, al login
  }
  
  if (rolPermitido && usuario.rol !== rolPermitido) {
    // Si intenta entrar a una ruta de otro rol, lo mandamos a su lugar
    return <Navigate to={usuario.rol === 'admin' ? '/panel' : '/home'} replace />;
  }

  return children; // Si todo está bien, lo deja pasar
};

// Separamos las rutas para que el AuthProvider pueda usar 'useNavigate'
function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* NUEVA RUTA RAIZ */}
        <Route path="/" element={<Landing />} />
        
        {/* Rutas exclusivas de USUARIO NORMAL */}
        <Route element={<RutaProtegida rolPermitido="usuario"><UserLayout /></RutaProtegida>}>
          <Route path="/home" element={<Home />} />
        </Route>

        {/* Rutas exclusivas de ADMINISTRADOR */}
        <Route element={<RutaProtegida rolPermitido="admin"><AdminLayout /></RutaProtegida>}>
          <Route path="/panel" element={<Panel />} />
        </Route>

        {/* CUALQUIER OTRA RUTA REDIRIGE AL INICIO */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;