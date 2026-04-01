// src/utils/storage.js
export const storage = {
  guardarItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  obtenerItem: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  eliminarItem: (key) => {
    localStorage.removeItem(key);
  }
};