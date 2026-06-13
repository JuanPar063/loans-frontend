import { createTheme, alpha } from '@mui/material/styles';

// ============================================================
// Sistema de diseño — tono fintech / corporativo moderno
// Paleta: navy profundo (confianza) + azul eléctrico (acento),
// neutros fríos, tipografía Inter, esquinas suaves y sombras sutiles.
// Cambiar la marca = ajustar `navy` y `accent` aquí.
// ============================================================

const navy = '#0F2A43';      // primario (marca, headers, CTAs)
const navyDark = '#081A2C';
const navyLight = '#33506F';
const accent = '#2E7DF6';    // secundario (enlaces, acentos)

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: navy,
      dark: navyDark,
      light: navyLight,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: accent,
      dark: '#1E63CC',
      light: '#5C9CF8',
      contrastText: '#FFFFFF',
    },
    success: { main: '#15803D', light: '#22C55E' },
    error: { main: '#DC2626' },
    warning: { main: '#D97706' },
    info: { main: '#0284C7' },
    background: {
      default: '#F4F6FB',   // gris azulado muy claro
      paper: '#FFFFFF',
    },
    text: {
      primary: '#10243B',
      secondary: '#5A6B81',
    },
    divider: alpha(navy, 0.1),
  },

  shape: { borderRadius: 12 },

  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontWeight: 700, letterSpacing: '-0.015em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: 0 },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F4F6FB',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          paddingInline: 20,
          paddingBlock: 9,
        },
        containedPrimary: {
          boxShadow: `0 6px 16px ${alpha(navy, 0.22)}`,
          '&:hover': { boxShadow: `0 8px 22px ${alpha(navy, 0.3)}` },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
        elevation1: {
          border: `1px solid ${alpha(navy, 0.07)}`,
          boxShadow: `0 1px 2px ${alpha(navy, 0.04)}, 0 8px 24px ${alpha(navy, 0.06)}`,
        },
        elevation3: {
          border: `1px solid ${alpha(navy, 0.07)}`,
          boxShadow: `0 2px 4px ${alpha(navy, 0.05)}, 0 16px 40px ${alpha(navy, 0.1)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${alpha(navy, 0.08)}`,
          boxShadow: `0 1px 2px ${alpha(navy, 0.04)}, 0 10px 30px ${alpha(navy, 0.06)}`,
        },
      },
    },
    MuiAppBar: {
      defaultProps: { color: 'inherit', elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#10243B',
          borderBottom: `1px solid ${alpha(navy, 0.09)}`,
          backdropFilter: 'saturate(180%) blur(6px)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(navy, 0.35),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: alpha(navy, 0.03),
            color: '#5A6B81',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            letterSpacing: '0.04em',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: navyDark, fontSize: '0.75rem', borderRadius: 8 },
      },
    },
  },
});

export default theme;
