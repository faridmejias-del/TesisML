// src/theme.js
import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: {
        // En modo oscuro, usamos un verde más claro y desaturado (#6ee7b7) 
        // para que no brille tanto como el esmeralda puro
        main: isLight ? '#10b981' : '#6ee7b7', 
        light: '#34d399',
        dark: '#059669',
        contrastText: isLight ? '#ffffff' : '#0b1121',
      },
      secondary: {
        main: isLight ? '#4f46e5' : '#818cf8', // Azul más suave en modo oscuro
        contrastText: isLight ? '#ffffff' : '#0b1121',
      },
      background: {
        default: isLight ? '#f8fafc' : '#0b1121',
        paper: isLight ? '#ffffff' : '#111827',
      },
      layout: {
        sidebar: isLight ? '#2c3e50' : '#111827',       
        sidebarActive: isLight ? '#34495e' : '#1f2937', 
        sidebarText: '#ecf0f1',   
        sidebarBorder: isLight ? '#34495e' : '#1f2937', 
      },
      chip: {
        defaultBg: isLight ? '#f8fafc' : '#1f2937',
        defaultText: isLight ? '#475569' : '#cbd5e1',
        defaultBorder: isLight ? '#e2e8f0' : '#374151',
        hoverBg: isLight ? '#f1f5f9' : '#374151',
        sectorBg: isLight ? '#d1fae5' : 'rgba(110, 231, 183, 0.08)',    
        sectorText: isLight ? '#047857' : '#6ee7b7',  
      },
      market: {
        cardDefault: {
          bg: isLight ? '#ffffff' : '#111827',
          border: isLight ? '#cbd5e1' : '#374151',
          text: isLight ? '#1e293b' : '#f1f5f9',
        },
        nullState: {
          bg: isLight ? '#f8fafc' : '#0b1121',
          border: isLight ? '#e2e8f0' : '#1f2937',
          text: isLight ? '#0f172a' : '#cbd5e1',
          icon: isLight ? '#94a3b8' : '#475569',
          badgeBg: isLight ? '#f1f5f9' : '#1f2937',
          badgeText: isLight ? '#64748b' : '#94a3b8',
        },
        // Ajuste de Saturación en indicadores financieros
        strongPositive: { 
            bg: isLight ? '#dcfce7' : 'rgba(110, 231, 183, 0.05)', 
            text: isLight ? '#14532d' : '#86efac', // Verde menta suave
            border: isLight ? '#bbf7d0' : 'rgba(134, 239, 172, 0.15)', 
            icon: isLight ? '#166534' : '#86efac', 
            badgeBg: isLight ? '#bbf7d0' : 'rgba(134, 239, 172, 0.1)', 
            badgeText: isLight ? '#166534' : '#86efac' 
        },
        positive: { 
            bg: isLight ? '#f0fdf4' : 'rgba(110, 231, 183, 0.03)', 
            text: isLight ? '#166534' : '#86efac', 
            border: isLight ? '#dcfce7' : 'rgba(110, 231, 183, 0.1)', 
            icon: isLight ? '#22c55e' : '#86efac', 
            badgeBg: isLight ? '#bbf7d0' : 'rgba(110, 231, 183, 0.1)', 
            badgeText: isLight ? '#166534' : '#86efac' 
        },
        neutral: { 
            bg: isLight ? '#f8fafc' : 'rgba(148, 163, 184, 0.05)', 
            text: isLight ? '#334155' : '#cbd5e1', 
            border: isLight ? '#e2e8f0' : 'rgba(148, 163, 184, 0.1)', 
            icon: isLight ? '#64748b' : '#94a3b8', 
            badgeBg: isLight ? '#e2e8f0' : 'rgba(148, 163, 184, 0.1)', 
            badgeText: isLight ? '#475569' : '#cbd5e1' 
        },
        negative: { 
            bg: isLight ? '#fef2f2' : 'rgba(248, 113, 113, 0.05)', 
            text: isLight ? '#991b1b' : '#fca5a5', // Rojo rosado desaturado
            border: isLight ? '#fee2e2' : 'rgba(248, 113, 113, 0.1)', 
            icon: isLight ? '#ef4444' : '#fca5a5', 
            badgeBg: isLight ? '#fecaca' : 'rgba(248, 113, 113, 0.1)', 
            badgeText: isLight ? '#991b1b' : '#fca5a5' 
        },
        strongNegative: { 
            bg: isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.08)', 
            text: isLight ? '#7f1d1d' : '#fca5a5', 
            border: isLight ? '#fecaca' : 'rgba(239, 68, 68, 0.2)', 
            icon: isLight ? '#b91c1c' : '#fca5a5', 
            badgeBg: isLight ? '#fecaca' : 'rgba(239, 68, 68, 0.2)', 
            badgeText: isLight ? '#991b1b' : '#fca5a5' 
        },
      },
    },
    typography: {
      fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'].join(','),
      h3: { fontWeight: 900, lineHeight: 1.2 },
      h6: { lineHeight: 1.6 }
    },
    shape: {
      borderRadius: 8, 
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { fontWeight: 'bold', textTransform: 'none', borderRadius: '12px' },
          sizeLarge: { padding: '12px 32px', fontSize: '1.1rem' },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: '24px', padding: '8px', backgroundImage: 'none' },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { borderRadius: 0, boxShadow: 'none', backgroundImage: 'none' },
        },
      },
      MuiAppBar: {
        defaultProps: { color: 'inherit', elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 0,
            backgroundColor: theme.palette.background.paper, 
            borderBottom: `1px solid ${theme.palette.divider}`, 
            boxShadow: 'none', 
            backgroundImage: 'none',
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: { root: { borderRadius: '12px' } },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: '8px',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
            '&.Mui-selected': {
              backgroundColor: theme.palette.layout.sidebarActive,
              '&:hover': { backgroundColor: theme.palette.layout.sidebarActive },
            },
          }),
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: '24px', 
            boxShadow: isLight ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : '0 4px 20px -5px rgb(0 0 0 / 0.7)', 
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: '24px',
            boxShadow: isLight ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : '0 4px 20px -5px rgb(0 0 0 / 0.7)',
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};

export default getTheme;