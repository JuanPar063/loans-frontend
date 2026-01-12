// loans-frontend/src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/common/protectedRoute';
import Register from './pages/Auth/register';
import ProfilePage from './pages/Client/profile';
import Login from './pages/Auth/login';
import Dashboard from './pages/Dashboard/dashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import Balance from './pages/Client/balance';
import Metrics from './pages/Admin/metrics'; 
import RegisterPayment from './pages/Admin/RegisterPayment';
import AdminProfile from './pages/Admin/AdminProfile';
import AdminPendingLoans from './pages/Admin/PendingLoans';
import { useAuth } from './hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

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

        {/* ✅ Rutas Protegidas - Dashboard de CLIENTE */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="client">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ Nueva Ruta: Perfil del usuario */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRole="client">
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* ✅ Ruta: Balance de Préstamos */}
        <Route
          path="/balance"
          element={
            <ProtectedRoute requiredRole="client">
              <Balance />
            </ProtectedRoute>
          }
        />

        {/* ✅ Rutas Protegidas - Dashboard de ADMINISTRADOR */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ Rutas Protegidas - Métricas admin */}
        <Route
          path="/admin/metrics"
          element={
            <ProtectedRoute requiredRole="admin">
              <Metrics />
            </ProtectedRoute>
          }
        />

        {/* ✅ NUEVO: Rutas Protegidas - Registrar Pago */}
        <Route
          path="/admin/register-payment"
          element={
            <ProtectedRoute requiredRole="admin">
              <RegisterPayment />
            </ProtectedRoute>
          }
        />

        {/* ✅ NUEVO: Rutas Protegidas - Perfil del Admin */}
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        {/* ✅ NUEVO: Rutas Protegidas - Perfil del Admin */}
        <Route
          path="/admin/pending-loans"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPendingLoans />
            </ProtectedRoute>
          }
        />
        {/* ✅ Ruta raíz - Redirige según autenticación y rol */}
        <Route
          path="/"
          element={
            isAuthenticated && user ? (
              user.role === 'admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : user.role === 'teller' ? (
                <Navigate to="/teller/dashboard" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Ruta 404 */}
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
                <a href="/" style={{ textDecoration: 'none' }}>
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