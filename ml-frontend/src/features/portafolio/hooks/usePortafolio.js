// src/features/portafolio/hooks/usePortafolio.js
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { empresaService, portafolioService } from '../../../services'; // Ajusta la ruta a tu config global de API si es necesario

export const usePortafolio = (usuarioId) => {
  const [empresasDisponibles, setEmpresasDisponibles] = useState([]);
  const [misEmpresas, setMisEmpresas] = useState([]);
  const [sectoresDisponibles, setSectoresDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoMasivo, setProcesandoMasivo] = useState(false);

  const cargarDatos = useCallback(async () => {
    if (!usuarioId) return;
    try {
      setCargando(true);
      const dataEmpresas = await empresaService.obtenerEmpresasConSectores();
      const todosLosPortafolios = await portafolioService.obtenerTodos();
      
      const misConexiones = todosLosPortafolios.filter(p => p.IdUsuario === usuarioId && p.Activo !== false);

      const enPortafolio = [];
      const fueraDePortafolio = [];
      const sectoresSet = new Set(); 

      dataEmpresas.empresas.forEach((empresa) => {
        const conexion = misConexiones.find((p) => p.IdEmpresa === empresa.IdEmpresa);
        if (conexion) {
          enPortafolio.push({ ...empresa, IdPortafolio: conexion.IdPortafolio });
        } else {
          fueraDePortafolio.push(empresa);
          sectoresSet.add(empresa.NombreSector); 
        }
      });

      setMisEmpresas(enPortafolio);
      setEmpresasDisponibles(fueraDePortafolio);
      setSectoresDisponibles(Array.from(sectoresSet).sort()); 
    } catch (error) {
      console.error("Error al cargar datos", error);
      toast.error("Error al cargar tu portafolio");
    } finally {
      setCargando(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const agregarUna = async (idEmpresa) => {
    try {
      await portafolioService.crear(usuarioId, idEmpresa);
      toast.success("Empresa agregada");
      cargarDatos(); 
    } catch (error) {
      toast.error("Error al agregar");
    }
  };

  const eliminarUna = async (idPortafolio) => {
    try {
      await portafolioService.eliminar(idPortafolio);
      toast.success("Empresa removida");
      cargarDatos();
    } catch (error) {
      toast.error("Error al remover");
    }
  };

  const agregarMultiples = async (idsAgregar) => {
    setProcesandoMasivo(true);
    const idNoti = toast.loading(`Agregando ${idsAgregar.length} empresas...`);
    try {
      await Promise.all(idsAgregar.map(id => portafolioService.crear(usuarioId, id)));
      toast.success(`Agregadas correctamente`, { id: idNoti });
      cargarDatos();
    } catch (error) {
      toast.error("Error al agregar masivamente", { id: idNoti });
    } finally {
      setProcesandoMasivo(false);
    }
  };

  const eliminarMultiples = async (idsEliminar) => {
    setProcesandoMasivo(true);
    const idNoti = toast.loading(`Removiendo ${idsEliminar.length} empresas...`);
    try {
      await Promise.all(idsEliminar.map(id => portafolioService.eliminar(id)));
      toast.success(`Removidas correctamente`, { id: idNoti });
      cargarDatos();
    } catch (error) {
      toast.error("Error al remover masivamente", { id: idNoti });
    } finally {
      setProcesandoMasivo(false);
    }
  };

  return {
    misEmpresas,
    empresasDisponibles,
    sectoresDisponibles,
    cargando,
    procesandoMasivo,
    agregarUna,
    eliminarUna,
    agregarMultiples,
    eliminarMultiples
  };
};