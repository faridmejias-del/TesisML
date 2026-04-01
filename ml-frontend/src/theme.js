// src/theme.js
import { createTheme } from '@mui/material/styles';
import { tokens } from './constants/colors';

const getTheme = (mode) => {
  const t = tokens[mode]; // Obtiene el objeto de colores limpio

  return createTheme({
    palette: {
      mode,
      primary: t.primary,
      secondary: t.secondary,
      background: t.background,
      text: t.text, // <-- Mapeo directo del texto
      layout: t.layout,
      chip: t.chip,
      market: t.market,
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
            boxShadow: t.effects.cardShadow, // <-- Mapeo directo de la sombra
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: '24px',
            boxShadow: t.effects.cardShadow, // <-- Mapeo directo de la sombra
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};

export default getTheme;