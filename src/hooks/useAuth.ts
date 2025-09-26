import { useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';  // npm install jwt-decode @types/jwt-decode

export const useAuth = () => {
  const [user, setUser ] = useState<{ id: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      setUser ({ id: decoded.sub, role: decoded.role });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser (null);
  };

  return { user, logout };
};