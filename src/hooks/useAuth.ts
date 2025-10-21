import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  role: string;
  email?: string;
}

interface DecodedToken {
  sub: string;
  username: string;
  role: string;
  email?: string;
  exp: number;
  iat: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para verificar si el token es válido
  const isTokenValid = useCallback((token: string): boolean => {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Verificar si el token ha expirado
      if (decoded.exp < currentTime) {
        console.warn('⚠️ Token expirado');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error al decodificar token:', error);
      return false;
    }
  }, []);

  // Función para cargar el usuario desde localStorage
  const loadUser = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Verificar si el token es válido
      if (!isTokenValid(token)) {
        logout();
        return;
      }

      // Decodificar el token
      const decoded: DecodedToken = jwtDecode(token);
      
      // Parsear el usuario guardado
      const savedUser = JSON.parse(userStr);
      
      // Actualizar el estado del usuario
      const userData: User = {
        id: decoded.sub || savedUser.id_user,
        username: decoded.username || savedUser.username,
        role: decoded.role || savedUser.role,
        email: savedUser.email,
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('✅ Usuario cargado:', userData);
    } catch (error) {
      console.error('❌ Error al cargar usuario:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [isTokenValid]);

  // Cargar usuario al montar el componente
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Función para cerrar sesión
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    console.log('✅ Sesión cerrada');
  }, []);

  // Función para actualizar el usuario
  const updateUser = useCallback((updatedUser: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      
      const newUser = { ...prevUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = useCallback((requiredRole: string): boolean => {
    if (!user) return false;
    return user.role === requiredRole;
  }, [user]);

  // Función para verificar si el usuario tiene uno de varios roles
  const hasAnyRole = useCallback((roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  return {
    user,
    loading,
    isAuthenticated,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    reloadUser: loadUser,
  };
};