import axios, { AxiosError, AxiosResponse } from 'axios';

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos de timeout
});

// Interceptor para requests - agregar JWT automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log de la petición en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔵 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejo de errores
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de la respuesta exitosa en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Manejo de errores específicos
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
      // Log del error en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ ${status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, data);
      }
      
      // Token expirado o inválido
      if (status === 401) {
        console.warn('⚠️ Token expirado o inválido. Redirigiendo a login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Solo redirigir si no estamos ya en login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      // Acceso prohibido
      if (status === 403) {
        console.warn('⚠️ Acceso prohibido');
        window.location.href = '/unauthorized';
      }
      
      // Servidor no disponible
      if (status >= 500) {
        console.error('❌ Error del servidor. Por favor, intenta más tarde.');
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('❌ No se recibió respuesta del servidor:', error.message);
    } else {
      // Algo pasó al configurar la petición
      console.error('❌ Error al configurar la petición:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Métodos helper para facilitar el uso
export const apiClient = {
  get: <T = any>(url: string, config?: any) => 
    api.get<T>(url, config),
  
  post: <T = any>(url: string, data?: any, config?: any) => 
    api.post<T>(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: any) => 
    api.put<T>(url, data, config),
  
  patch: <T = any>(url: string, data?: any, config?: any) => 
    api.patch<T>(url, data, config),
  
  delete: <T = any>(url: string, config?: any) => 
    api.delete<T>(url, config),
};

export default api;