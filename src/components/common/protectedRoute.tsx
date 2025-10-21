import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  allowedRoles 
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
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
          Verificando autenticación...
        </Typography>
      </Box>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated || !user) {
    console.warn('⚠️ Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Verificar rol específico requerido
  if (requiredRole && user.role !== requiredRole) {
    console.warn(`⚠️ Usuario no tiene el rol requerido: ${requiredRole}. Rol actual: ${user.role}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar lista de roles permitidos
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn(`⚠️ Usuario no tiene uno de los roles permitidos: ${allowedRoles.join(', ')}. Rol actual: ${user.role}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // Usuario autenticado y con los permisos necesarios
  return <>{children}</>;
};