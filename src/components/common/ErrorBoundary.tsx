import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary global: captura errores de renderizado de React para que un
 * fallo en una vista no deje la app en blanco. Muestra un fallback y permite
 * recargar. (Mejora 6.2 del análisis.)
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Aquí podría enviarse a un servicio de observabilidad (Sentry, etc.).
    console.error('💥 ErrorBoundary capturó un error:', error, info.componentStack);
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: undefined });
    window.location.assign('/');
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={2}
        >
          <Paper elevation={3} sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Algo salió mal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ocurrió un error inesperado. Puedes volver al inicio e intentar de nuevo.
            </Typography>
            <Button variant="contained" onClick={this.handleReload}>
              Volver al inicio
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
