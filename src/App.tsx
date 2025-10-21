import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/common/protectedRoute';
import Register from './pages/Auth/register';
import Login from './pages/Auth/login';
import Dashboard from './pages/Dashboard/dashboard';
import { Metrics } from './pages/Admin/metrics';
import { useAuth } from './hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

// Página de no autorizado
const UnauthorizedPage = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}
  >
    <Typography variant="h4" color="error" gutterBottom>
      Acceso No Autorizado
    </Typography>
    <Typography variant="body1" color="text.secondary">
      No tienes permisos para acceder a esta página
    </Typography>
    <Box sx={{ mt: 2 }}>
      <a href="/dashboard" style={{ textDecoration: 'none' }}>
        Volver al inicio
      </a>
    </Box>
  </Box>
);

function App() {
  const { user, loading, isAuthenticated } = useAuth();

  // Mostrar loading mientras se verifica la autenticación inicial
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando aplicación...
        </Typography>
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Rutas Protegidas - Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['client', 'admin', 'teller']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Rutas Protegidas - Cliente */}
        {/* 
        <Route
          path="/client/request-loan"
          element={
            <ProtectedRoute requiredRole="client">
              <RequestLoan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/balance"
          element={
            <ProtectedRoute requiredRole="client">
              <Balance />
            </ProtectedRoute>
          }
        />
        */}

        {/* Rutas Protegidas - Admin */}
        <Route
          path="/admin/metrics"
          element={
            <ProtectedRoute requiredRole="admin">
              <Metrics />
            </ProtectedRoute>
          }
        />

        {/* Rutas Protegidas - Teller */}
        {/*
        <Route
          path="/teller/dashboard"
          element={
            <ProtectedRoute requiredRole="teller">
              <TellerDashboard />
            </ProtectedRoute>
          }
        />
        */}

        {/* Ruta raíz - Redirige según autenticación */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Ruta 404 - Cualquier otra ruta */}
        <Route
          path="*"
          element={
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
              }}
            >
              <Typography variant="h4" color="error" gutterBottom>
                404 - Página No Encontrada
              </Typography>
              <Typography variant="body1" color="text.secondary">
                La página que buscas no existe
              </Typography>
              <Box sx={{ mt: 2 }}>
                <a href="/dashboard" style={{ textDecoration: 'none' }}>
                  Volver al inicio
                </a>
              </Box>
            </Box>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;