// src/components/EmpresaForm.js
import React, { useState, useEffect } from 'react';
import { sectorService } from 'services';

export default function EmpresaForm({ empresaInicial, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    Ticket: '',
    NombreEmpresa: '',
    IdSector: '',
    Activo: true
  });
  const [sectores, setSectores] = useState([]);

  useEffect(() => {
    // Cargar sectores para el dropdown
    const cargarSectores = async () => {
      const data = await sectorService.getAll();
      setSectores(data);
    };
    cargarSectores();

    // Si recibimos una empresa para editar, llenamos el form
    if (empresaInicial) setFormData(empresaInicial);
  }, [empresaInicial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={estilos.form}>
      <h4 style={{marginTop: 0}}>{empresaInicial ? 'Editar' : 'Nueva'} Empresa</h4>
      
      <input 
        placeholder="Ticker (ej: AAPL)" 
        value={formData.Ticket} 
        onChange={e => setFormData({...formData, Ticket: e.target.value.toUpperCase()})}
        style={estilos.input} required
      />

      <input 
        placeholder="Nombre de la Empresa" 
        value={formData.NombreEmpresa} 
        onChange={e => setFormData({...formData, NombreEmpresa: e.target.value})}
        style={estilos.input} required
      />

      <select 
        value={formData.IdSector} 
        onChange={e => setFormData({...formData, IdSector: e.target.value})}
        style={estilos.input} required
      >
        <option value="">Seleccione Sector</option>
        {sectores.map(s => <option key={s.IdSector} value={s.IdSector}>{s.NombreSector}</option>)}
      </select>

      <label style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <input 
          type="checkbox" 
          checked={formData.Activo} 
          onChange={e => setFormData({...formData, Activo: e.target.checked})}
        />
        ¿Empresa Activa?
      </label>

      <div style={estilos.botones}>
        <button type="button" onClick={onCancel} style={estilos.btnSecundario}>Cancelar</button>
        <button type="submit" style={estilos.btnPrimario}>Guardar Cambios</button>
      </div>
    </form>
  );
}

const estilos = {
  form: { display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' },
  botones: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' },
  btnPrimario: { backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' },
  btnSecundario: { backgroundColor: '#94a3b8', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }
};