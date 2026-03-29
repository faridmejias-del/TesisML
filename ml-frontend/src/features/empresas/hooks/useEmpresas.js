// src/features/empresas/hooks/useEmpresas.js
import { useState, useEffect } from 'react';
import { empresaService } from '../../../services'; // Ajustar ruta

export const useEmpresas = () => {
    const [empresas, setEmpresas] = useState([]);
    const [sectores, setSectores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true);
                const data = await empresaService.obtenerEmpresasConSectores();
                setEmpresas(data.empresas);
                setSectores(data.sectores);
            } catch (err) {
                console.error("Error cargando tabla de empresas:", err);
                setError(err);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    return { empresas, sectores, cargando, error };
};