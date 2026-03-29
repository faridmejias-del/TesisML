// src/features/ia_analisis/hooks/useEntrenamientoIA.js
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query'; // Aprovechando que ya tienes React Query
import { iaService } from '../../../services';
import toast from 'react-hot-toast';

export const useEntrenamientoIA = () => {
    const [modeloSeleccionado, setModeloSeleccionado] = useState('');
    const [entrenando, setEntrenando] = useState(false);

    const { data: modelos = [] } = useQuery({
        queryKey: ['modelos_activos'],
        queryFn: async () => {
            const data = await iaService.obtenerModelosActivos();
            if (data.length > 0) setModeloSeleccionado(data[0].IdModelo);
            return data;
        },
        staleTime: 1000 * 60 * 60,
    });

    // Eliminamos window.confirm de aquí. La función solo recibe la orden de entrenar.
    const ejecutarEntrenamiento = async () => {
        if (!modeloSeleccionado) return;
        setEntrenando(true);
        const idNoti = toast.loading("Entrenando modelo en segundo plano...");
        
        try {
            const response = await iaService.entrenarModelo(modeloSeleccionado);
            toast.success(response.message || "Entrenamiento iniciado", { id: idNoti });
        } catch (error) {
            toast.error("Error al intentar entrenar el modelo.", { id: idNoti });
        } finally {
            setEntrenando(false);
        }
    };

    return { modelos, modeloSeleccionado, setModeloSeleccionado, entrenando, ejecutarEntrenamiento };
};