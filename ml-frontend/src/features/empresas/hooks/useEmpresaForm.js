// src/features/empresas/hooks/useEmpresaForm.js
import { useState, useEffect } from 'react';
import { sectorService } from '../../../services';

export const useEmpresaForm = (empresaInicial, onSave) => {
  const [formData, setFormData] = useState({
    Ticket: '',
    NombreEmpresa: '',
    IdSector: '',
    Activo: true
  });
  const [sectores, setSectores] = useState([]);

  // Cargar sectores
  useEffect(() => {
    const cargarSectores = async () => {
      try {
        const data = await sectorService.getAll();
        setSectores(data);
      } catch (error) {
        console.error("Error al cargar sectores", error);
      }
    };
    cargarSectores();

    if (empresaInicial) setFormData(empresaInicial);
  }, [empresaInicial]);

  // Manejador centralizado
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'Ticket' ? value.toUpperCase() : value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return { formData, sectores, handleChange, handleSubmit };
};