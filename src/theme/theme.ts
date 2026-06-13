import { createTheme, alpha, Theme } from '@mui/material/styles';

// ============================================================
// Sistema de diseño fintech — soporta modo claro y oscuro.
// La marca (navy + azul) es la misma del login; el modo oscuro
// usa superficies navy muy oscuras y acentos más brillantes.
// ============================================================

const navy = '#0F2A43';
const navyDark = '#081A2C';
const navyLight = '#33506F';
const accent = '#2E7DF6';

export type AppColorMode = 'light' | 'dark';

export const createAppTheme = (mode: AppColorMode): Theme => {
  const isDark = mode === 'dark';
  // Color base para bordes/sombras (claro en dark, navy en light).
  const lineBase = isDark ? '#FFFFFF' : navy;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#4F93F2' : navy,
        dark: isDark ? '#2E7DF6' : navyDark,
        light: isDark ? '#7FB2F7' : navyLight,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: accent,
        dark: '#1E63CC',
        light: '#5C9CF8',
        contrastText: '#FFFFFF',
      },
      success: { main: isDark ? '#34D399' : '#15803D' },
      error: { main: isDark ? '#F87171' : '#DC2626' },
      warning: { main: isDark ? '#FBBF24' : '#D97706' },
      info: { main: isDark ? '#38BDF8' : '#0284C7' },
      background: {
        default: isDark ? '#0B1220' : '#F4F6FB',
        paper: isDark ? '#111C2E' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#E6EDF6' : '#10243B',
        secondary: isDark ? '#9FB0C3' : '#5A6B81',
      },
      divider: alpha(lineBase, isDark ? 0.16 : 0.1),
    },

    shape: { borderRadius: 12 },

    typography: {
      fontFamily: [
        'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto',
        'Helvetica', 'Arial', 'sans-serif',
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
            backgroundColor: isDark ? '#0B1220' : '#F4F6FB',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: 'none', borderRadius: 10, paddingInline: 20, paddingBlock: 9 },
          containedPrimary: {
            boxShadow: `0 6px 16px ${alpha(accent, 0.28)}`,
            '&:hover': { boxShadow: `0 8px 22px ${alpha(accent, 0.36)}` },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: { borderRadius: 16 },
          elevation1: {
            border: `1px solid ${alpha(lineBase, isDark ? 0.12 : 0.07)}`,
            boxShadow: `0 1px 2px ${alpha('#000', isDark ? 0.4 : 0.04)}, 0 8px 24px ${alpha('#000', isDark ? 0.35 : 0.06)}`,
          },
          elevation3: {
            border: `1px solid ${alpha(lineBase, isDark ? 0.12 : 0.07)}`,
            boxShadow: `0 2px 4px ${alpha('#000', isDark ? 0.45 : 0.05)}, 0 16px 40px ${alpha('#000', isDark ? 0.5 : 0.1)}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${alpha(lineBase, isDark ? 0.12 : 0.08)}`,
            boxShadow: `0 1px 2px ${alpha('#000', isDark ? 0.4 : 0.04)}, 0 10px 30px ${alpha('#000', isDark ? 0.4 : 0.06)}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        defaultProps: { color: 'inherit', elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#0E1929' : '#FFFFFF',
            color: isDark ? '#E6EDF6' : '#10243B',
            borderBottom: `1px solid ${alpha(lineBase, isDark ? 0.14 : 0.09)}`,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(lineBase, 0.35) },
          },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } } },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: alpha(lineBase, isDark ? 0.06 : 0.03),
              color: isDark ? '#9FB0C3' : '#5A6B81',
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.72rem',
              letterSpacing: '0.04em',
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: { tooltip: { backgroundColor: navyDark, fontSize: '0.75rem', borderRadius: 8 } },
      },
    },
  });
};

// Gradiente de marca (navy → azul), reutilizable en cabeceras/paneles.
export const brandGradient =
  `linear-gradient(135deg, ${navyDark} 0%, ${navy} 55%, ${navyLight} 130%)`;

// Compatibilidad: export por defecto en modo claro.
const theme = createAppTheme('light');
export default theme;
