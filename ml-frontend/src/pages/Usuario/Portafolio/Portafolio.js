// src/pages/Usuario/Portafolio/Portafolio.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Paper, Grid, List, ListItem, ListItemText, 
  IconButton, Chip, Divider, Checkbox, Button, FormControl, 
  InputLabel, Select, MenuItem, CircularProgress, Pagination 
} from '@mui/material';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

import { useAuth } from '../../../context';
import { empresaService, portafolioService } from '../../../services';
import toast from 'react-hot-toast';

export default function Portafolio() {
  const { usuario } = useAuth();
  
  // Estados de datos
  const [empresasDisponibles, setEmpresasDisponibles] = useState([]);
  const [misEmpresas, setMisEmpresas] = useState([]);
  const [sectoresDisponibles, setSectoresDisponibles] = useState([]);
  
  // Estados de la interfaz
  const [cargando, setCargando] = useState(true);
  const [procesandoMasivo, setProcesandoMasivo] = useState(false);
  const [sectorFiltro, setSectorFiltro] = useState('todos');
  const [seleccionadas, setSeleccionadas] = useState([]);

  // Estados para la Paginación
  const [paginaMis, setPaginaMis] = useState(1);
  const [paginaDisponibles, setPaginaDisponibles] = useState(1);
  const ITEMS_POR_PAGINA = 5; 

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      const dataEmpresas = await empresaService.obtenerEmpresasConSectores();
      const todasLasEmpresas = dataEmpresas.empresas;

      const todosLosPortafolios = await portafolioService.obtenerTodos();
      const misConexiones = todosLosPortafolios.filter(
        (p) => p.IdUsuario === usuario.id && p.Activo !== false
      );

      const empresasEnPortafolio = [];
      const empresasFueraDePortafolio = [];
      const sectoresSet = new Set(); 

      todasLasEmpresas.forEach((empresa) => {
        const conexion = misConexiones.find((p) => p.IdEmpresa === empresa.IdEmpresa);
        if (conexion) {
          empresasEnPortafolio.push({
            ...empresa,
            IdPortafolio: conexion.IdPortafolio
          });
        } else {
          empresasFueraDePortafolio.push(empresa);
          sectoresSet.add(empresa.NombreSector); 
        }
      });

      setMisEmpresas(empresasEnPortafolio);
      setEmpresasDisponibles(empresasFueraDePortafolio);
      setSectoresDisponibles(Array.from(sectoresSet).sort()); 
      
      setSeleccionadas([]); 
    } catch (error) {
      console.error("Error al cargar datos del portafolio", error);
      toast.error("Error al cargar tu portafolio");
    } finally {
      setCargando(false);
    }
  }, [usuario]); 

  useEffect(() => {
    if (usuario?.id) {
      cargarDatos();
    }
  }, [usuario, cargarDatos]); 

  useEffect(() => {
    setPaginaDisponibles(1);
  }, [sectorFiltro]);

  // --- FUNCIONES DE AGREGAR / ELIMINAR ---

  const manejarAgregarUna = async (idEmpresa) => {
    try {
      await portafolioService.crear(usuario.id, idEmpresa);
      toast.success("Empresa agregada a tu portafolio");
      cargarDatos(); 
    } catch (error) {
      toast.error("No se pudo agregar la empresa");
    }
  };

  const manejarEliminar = async (idPortafolio) => {
    try {
      await portafolioService.eliminar(idPortafolio);
      toast.success("Empresa removida de tu portafolio");
      cargarDatos();
      
      if (misEmpresas.length % ITEMS_POR_PAGINA === 1 && paginaMis > 1) {
          setPaginaMis(paginaMis - 1);
      }
    } catch (error) {
      toast.error("No se pudo remover la empresa");
    }
  };

  // --- LÓGICA: SELECCIÓN MÚLTIPLE ---

  const alternarSeleccion = (idEmpresa) => {
    setSeleccionadas(prev => 
      prev.includes(idEmpresa) 
        ? prev.filter(id => id !== idEmpresa) 
        : [...prev, idEmpresa] 
    );
  };

  const manejarAgregarMultiples = async () => {
    if (seleccionadas.length === 0) return;
    
    setProcesandoMasivo(true);
    const promesaNotificacion = toast.loading(`Agregando ${seleccionadas.length} empresas...`);

    try {
      await Promise.all(
        seleccionadas.map(idEmpresa => portafolioService.crear(usuario.id, idEmpresa))
      );
      
      toast.success(`${seleccionadas.length} empresas agregadas correctamente`, { id: promesaNotificacion });
      cargarDatos();
      setPaginaDisponibles(1); 
    } catch (error) {
      toast.error("Hubo un error al agregar algunas empresas", { id: promesaNotificacion });
      setProcesandoMasivo(false);
    }
  };

  // --- LÓGICA DE PAGINACIÓN ---
  
  const empresasDisponiblesFiltradas = sectorFiltro === 'todos' 
    ? empresasDisponibles 
    : empresasDisponibles.filter(emp => emp.NombreSector === sectorFiltro);

  const misEmpresasPaginadas = misEmpresas.slice(
    (paginaMis - 1) * ITEMS_POR_PAGINA, 
    paginaMis * ITEMS_POR_PAGINA
  );

  const disponiblesPaginadas = empresasDisponiblesFiltradas.slice(
    (paginaDisponibles - 1) * ITEMS_POR_PAGINA, 
    paginaDisponibles * ITEMS_POR_PAGINA
  );

  const totalPaginasMis = Math.ceil(misEmpresas.length / ITEMS_POR_PAGINA);
  const totalPaginasDisponibles = Math.ceil(empresasDisponiblesFiltradas.length / ITEMS_POR_PAGINA);


  if (cargando) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
    </Box>
  );

  return (
    // RESPONSIVIDAD: Ancho fluido basado en porcentajes
    <Box sx={{ width: '100%', pb: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 4, pt: {xs: 2, lg: 0} }}>
        Gestionar Mi Portafolio
      </Typography>

      <Grid container spacing={{ xs: 2, md: 3, lg: 4 }} alignItems="stretch">
        
        {/* LISTA 1: MIS EMPRESAS */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
              Empresas en Seguimiento ({misEmpresas.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
                {misEmpresas.length === 0 ? (
                <Typography color="text.secondary">No tienes empresas en tu portafolio aún.</Typography>
                ) : (
                <List disablePadding sx={{ flexGrow: 1 }}>
                    {misEmpresasPaginadas.map((emp) => (
                    <ListItem 
                        key={emp.IdPortafolio}
                        sx={{ bgcolor: 'background.default', mb: 1, borderRadius: 2, p: {xs: 1, md: 2} }}
                        secondaryAction={
                        <IconButton edge="end" color="error" size="small" onClick={() => manejarEliminar(emp.IdPortafolio)}>
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                        }
                    >
                        <ListItemText 
                        primary={`${emp.Ticket} - ${emp.NombreEmpresa}`} 
                        secondary={<Chip label={emp.NombreSector} size="small" sx={{ mt: 0.5 }} />}
                        primaryTypographyProps={{ variant: { xs: 'body2', md: 'body1' } }}
                        />
                    </ListItem>
                    ))}
                </List>
                )}
            </Box>

            {/* CONTROLES DE PAGINACIÓN */}
            {totalPaginasMis > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                    <Pagination 
                        count={totalPaginasMis} 
                        page={paginaMis} 
                        onChange={(e, value) => setPaginaMis(value)} 
                        color="primary" 
                        size="small"
                    />
                </Box>
            )}
          </Paper>
        </Grid>

        {/* LISTA 2: EMPRESAS DISPONIBLES */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            {/* CABECERA RESPONSIVA */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: {xs: 'flex-start', lg: 'space-between'}, alignItems: { xs: 'stretch', lg: 'center' }, gap: 2, mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.secondary' }}>
                Mercado Disponible
                </Typography>
                
                <FormControl size="small" sx={{ minWidth: {xs: '100%', lg: 180} }}>
                    <InputLabel>Filtrar por Sector</InputLabel>
                    <Select
                        value={sectorFiltro}
                        label="Filtrar por Sector"
                        onChange={(e) => setSectorFiltro(e.target.value)}
                    >
                        <MenuItem value="todos">Todos los sectores</MenuItem>
                        {sectoresDisponibles.map(sector => (
                            <MenuItem key={sector} value={sector}>{sector}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* BOTÓN DE AGREGAR SELECCIONADAS RESPONSIVO */}
            <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<PlaylistAddIcon fontSize="small" />}
                disabled={seleccionadas.length === 0 || procesandoMasivo}
                onClick={manejarAgregarMultiples}
                size="small"
                sx={{ mb: 2, borderRadius: 2, fontWeight: 'bold', width: '100%', display: 'flex' }}
            >
                Agregar Seleccionadas ({seleccionadas.length})
            </Button>

            <Divider sx={{ mb: 2 }} />

            {/* LISTADO DE DISPONIBLES */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
                {empresasDisponiblesFiltradas.length === 0 ? (
                <Typography color="text.secondary">
                    {empresasDisponibles.length === 0 ? "Ya sigues a todas las empresas disponibles." : "No hay empresas disponibles en este sector."}
                </Typography>
                ) : (
                <List disablePadding sx={{ flexGrow: 1 }}>
                    {disponiblesPaginadas.map((emp) => {
                    const estaSeleccionada = seleccionadas.includes(emp.IdEmpresa);
                    return (
                        <ListItem 
                            key={emp.IdEmpresa}
                            sx={{ 
                                bgcolor: estaSeleccionada ? 'action.selected' : 'background.default', 
                                mb: 1, 
                                borderRadius: 2,
                                transition: 'background-color 0.2s',
                                p: {xs: 1, md: 2}
                            }}
                            secondaryAction={
                            <IconButton edge="end" color="primary" size="small" onClick={() => manejarAgregarUna(emp.IdEmpresa)}>
                                <AddCircleOutlineIcon fontSize="small" />
                            </IconButton>
                            }
                        >
                            <Checkbox
                                edge="start"
                                checked={estaSeleccionada}
                                onChange={() => alternarSeleccion(emp.IdEmpresa)}
                                size="small"
                                sx={{ p: {xs: 0.5, md: 1} }}
                            />
                            <ListItemText 
                                primary={`${emp.Ticket} - ${emp.NombreEmpresa}`} 
                                secondary={emp.NombreSector}
                                primaryTypographyProps={{ variant: { xs: 'body2', md: 'body1' } }}
                            />
                        </ListItem>
                    );
                    })}
                </List>
                )}
            </Box>

            {/* CONTROLES DE PAGINACIÓN */}
            {totalPaginasDisponibles > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                    <Pagination 
                        count={totalPaginasDisponibles} 
                        page={paginaDisponibles} 
                        onChange={(e, value) => setPaginaDisponibles(value)} 
                        color="primary" 
                        size="small"
                    />
                </Box>
            )}

          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}