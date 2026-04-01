// src/utils/storage.js
export const storage = {
  guardarItem: async (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
    return Promise.resolve(); // Simulamos asincronía
  },
  obtenerItem: async (key) => {
    const item = localStorage.getItem(key);
    return Promise.resolve(item ? JSON.parse(item) : null);
  },
  eliminarItem: async (key) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  }
};