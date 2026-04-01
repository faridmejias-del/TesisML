// src/constants/colors.js

export const tokens = {
  light: {
    primary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4f46e5',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F4F1EA', // Beige suave para el fondo principal
      paper: '#FCFBF8',   // Blanco crema cálido para tarjetas
    },
    // NUEVO: Colores de texto centralizados
    text: {
      primary: '#2C2A29', // Gris oscuro cálido
      secondary: '#5C5750', // Gris medio cálido
    },
    // NUEVO: Efectos visuales centralizados (sombras, etc.)
    effects: {
      cardShadow: '0 4px 12px -2px rgba(140, 130, 115, 0.15)', // Sombra cálida
    },///*
    layout: {
      sidebar: '#134E4A',       // Verde azulado muy oscuro (Deep Teal)
      sidebarActive: '#115E59', // Teal ligeramente más claro
      sidebarText: '#F4F1EA',   // Texto en beige
      sidebarBorder: '#115E59', // Borde a juego
    }, /*
    layout: {
      sidebar: '#E8E4DB',       // Tono avena/arena sutil
      sidebarActive: '#DCD6CC', // Un poco más oscuro para resaltar
      sidebarText: '#4A4641',   // Texto en gris cálido oscuro
      sidebarBorder: '#DCD6CC', // Borde a juego
    },*/
    chip: {
      defaultBg: '#EAE6DF',
      defaultText: '#5C5750',
      defaultBorder: '#DCD6CC',
      hoverBg: '#E0DBCE',
      sectorBg: '#d1fae5', 
      sectorText: '#047857',
    },
    market: {
      cardDefault: { bg: '#FCFBF8', border: '#DCD6CC', text: '#2C2A29' },
      nullState: { bg: '#F4F1EA', border: '#DCD6CC', text: '#4A4641', icon: '#9E978E', badgeBg: '#EAE6DF', badgeText: '#5C5750' },
      strongPositive: { bg: '#dcfce7', text: '#14532d', border: '#bbf7d0', icon: '#166534', badgeBg: '#bbf7d0', badgeText: '#166534' },
      positive: { bg: '#f0fdf4', text: '#166534', border: '#dcfce7', icon: '#22c55e', badgeBg: '#bbf7d0', badgeText: '#166534' },
      neutral: { bg: '#F4F1EA', text: '#4A4641', border: '#DCD6CC', icon: '#9E978E', badgeBg: '#EAE6DF', badgeText: '#5C5750' },
      negative: { bg: '#fef2f2', text: '#991b1b', border: '#fee2e2', icon: '#ef4444', badgeBg: '#fecaca', badgeText: '#991b1b' },
      strongNegative: { bg: '#fee2e2', text: '#7f1d1d', border: '#fecaca', icon: '#b91c1c', badgeBg: '#fecaca', badgeText: '#991b1b' },
    },
  },
  dark: {
    primary: {
      main: '#6ee7b7',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#0b1121',
    },
    secondary: {
      main: '#818cf8',
      contrastText: '#0b1121',
    },
    background: {
      default: '#0b1121',
      paper: '#111827',
    },
    // NUEVO: Colores de texto centralizados para modo oscuro
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
    // NUEVO: Efectos visuales centralizados para modo oscuro
    effects: {
      cardShadow: '0 4px 20px -5px rgb(0 0 0 / 0.7)',
    },
    layout: {
      sidebar: '#111827',
      sidebarActive: '#1f2937',
      sidebarText: '#ecf0f1',
      sidebarBorder: '#1f2937',
    },
    chip: {
      defaultBg: '#1f2937',
      defaultText: '#cbd5e1',
      defaultBorder: '#374151',
      hoverBg: '#374151',
      sectorBg: 'rgba(110, 231, 183, 0.08)',
      sectorText: '#6ee7b7',
    },
    market: {
      cardDefault: { bg: '#111827', border: '#374151', text: '#f1f5f9' },
      nullState: { bg: '#0b1121', border: '#1f2937', text: '#cbd5e1', icon: '#475569', badgeBg: '#1f2937', badgeText: '#94a3b8' },
      strongPositive: { bg: 'rgba(110, 231, 183, 0.05)', text: '#86efac', border: 'rgba(134, 239, 172, 0.15)', icon: '#86efac', badgeBg: 'rgba(134, 239, 172, 0.1)', badgeText: '#86efac' },
      positive: { bg: 'rgba(110, 231, 183, 0.03)', text: '#86efac', border: 'rgba(110, 231, 183, 0.1)', icon: '#86efac', badgeBg: 'rgba(110, 231, 183, 0.1)', badgeText: '#86efac' },
      neutral: { bg: 'rgba(148, 163, 184, 0.05)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.1)', icon: '#94a3b8', badgeBg: 'rgba(148, 163, 184, 0.1)', badgeText: '#cbd5e1' },
      negative: { bg: 'rgba(248, 113, 113, 0.05)', text: '#fca5a5', border: 'rgba(248, 113, 113, 0.1)', icon: '#fca5a5', badgeBg: 'rgba(248, 113, 113, 0.1)', badgeText: '#fca5a5' },
      strongNegative: { bg: 'rgba(239, 68, 68, 0.08)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.2)', icon: '#fca5a5', badgeBg: 'rgba(239, 68, 68, 0.2)', badgeText: '#fca5a5' },
    },
  },
};