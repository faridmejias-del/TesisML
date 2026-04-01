// src/App.js
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, CustomThemeProvider } from './context';
import { WebRouter } from './navigation/WebRouter'; // <-- IMPORTA EL ROUTER WEB

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <AuthProvider>
          <Toaster position="top-center" reverseOrder={false} />
          {/* Aislamos la navegación específica de la web */}
          <WebRouter /> 
        </AuthProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}

export default App;