// src/components/EmpresaTable.js
import React, { useState, useEffect } from 'react';
import empresaService from '../services/empresaService';

// 1. NUEVO: Ahora recibimos 'onSelect' como parámetro (desestructuración)
function EmpresaTable({ onSelect }) { 
    const [empresas, setEmpresas] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const data = await empresaService.getAll();
                setEmpresas(data);
            } catch (error) {
                alert("Error cargando empresas");
            } finally {
                setCargando(false);
            }
        };
        fetchEmpresas();
    }, []);

    if (cargando) return <p>Cargando listado de empresas...</p>;

    return (
        <div style={estilos.contenedor}>
            <h3>Listado de Empresas (Tickers)</h3>
            <p style={{fontSize: '0.8rem', color: '#666'}}>* Haz clic en una fila para ver su gráfica</p>
            <table style={estilos.tabla}>
                <thead>
                    <tr style={estilos.header}>
                        <th>Ticker</th>
                        <th>Nombre de Empresa</th>
                        <th>Sector</th>
                        <th>ID</th>
                    </tr>
                </thead>
                <tbody>
                    {empresas.map((emp) => (
                        // 2. NUEVO: Agregamos onClick y cambiamos el estilo dinámicamente
                        <tr 
                            key={emp.IdEmpresa} 
                            style={estilos.fila}
                            onClick={() => onSelect(emp.IdEmpresa, emp.NombreEmpresa)}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <td style={estilos.ticker}>{emp.Ticket}</td>
                            <td>{emp.NombreEmpresa}</td>
                            <td>
                                <span style={estilos.sectorBadge}>
                                    {emp.NombreSector || 'Sin Sector'}
                                </span>
                            </td>
                            <td style={estilos.idCol}>{emp.IdEmpresa}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const estilos = {
    contenedor: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', width: '100%' },
    tabla: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    header: { textAlign: 'left', borderBottom: '2px solid #f0f0f0', color: '#888', fontSize: '0.9rem' },
    // 3. NUEVO: Agregamos 'cursor: pointer' para que el usuario sepa que es clicable
    fila: { borderBottom: '1px solid #f9f9f9', height: '45px', cursor: 'pointer', transition: '0.2s' }, 
    ticker: { fontWeight: 'bold', color: '#007bff' },
    sectorBadge: { backgroundColor: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' },
    idCol: { color: '#ccc', fontSize: '0.8rem' }
};

export default EmpresaTable;