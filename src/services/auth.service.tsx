import api from './api.client';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id_user: string;
    username: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
  };
}

export const authService = {
  /**
   * Registra un nuevo usuario en el sistema
   * Solo maneja los datos de autenticación (username, email, password, role)
   */
  register: async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data);
      console.log('✅ Registro exitoso en auth service:', response.data);
      return response;
    } catch (error: any) {
      console.error('❌ Error en registro:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Inicia sesión de un usuario
   * Valida credenciales y retorna token JWT
   */
  login: async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/login', data);
      console.log('✅ Login exitoso:', response.data);
      
      // Guardar token en localStorage
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      
      // Guardar información del usuario
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en login:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Cierra sesión del usuario
   * Limpia el localStorage y hace logout en el backend
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✅ Logout exitoso');
    } catch (error: any) {
      console.error('❌ Error en logout:', error.response?.data || error.message);
      // Aún así limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  /**
   * Obtiene el usuario actual del localStorage
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Valida el token actual
   */
  validateToken: async () => {
    try {
      const response = await api.post('/auth/validate-token');
      return response.data;
    } catch (error) {
      console.error('Token inválido');
      return null;
    }
  },
};