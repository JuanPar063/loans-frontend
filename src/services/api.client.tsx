import axios, { AxiosError, AxiosResponse, AxiosInstance } from 'axios';

// URLs de los microservicios
const AUTH_SERVICE_URL = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3001';
const PROFILE_SERVICE_URL = process.env.REACT_APP_PROFILE_SERVICE_URL || 'http://localhost:3000';

// Función para crear instancia de axios
const createApiInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  // Interceptor para requests - agregar JWT
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔵 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
      }
      
      return config;
    },
    (error) => {
      console.error('❌ Error en request interceptor:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor para responses
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.baseURL}${response.config.url}`, response.data);
      }
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data as any;
        const url = error.config?.url || '';
        
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ ${status} ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url}`, data);
        }
        
        // ✅ CORRECCIÓN: Solo redirigir en 401 si NO es la ruta de login/register
        if (status === 401) {
          // Rutas públicas que NO deben redirigir
          const publicRoutes = ['/auth/login', '/auth/register'];
          const isPublicRoute = publicRoutes.some(route => url.includes(route));
          
          if (!isPublicRoute) {
            // Token expirado en ruta protegida
            console.warn('⚠️ Token expirado o inválido. Redirigiendo a login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          } else {
            // Es login/register, dejar que el componente maneje el error
            console.warn('⚠️ Credenciales inválidas (login/register)');
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
        console.error('❌ No se recibió respuesta del servidor:', error.message);
      } else {
        console.error('❌ Error al configurar la petición:', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Instancias separadas para cada microservicio
export const authApi = createApiInstance(AUTH_SERVICE_URL);
export const profileApi = createApiInstance(PROFILE_SERVICE_URL);

// Para compatibilidad con código existente
const api = authApi;
export default api;

// Clientes tipados para cada servicio
export const authClient = {
  get: <T = any>(url: string, config?: any) => 
    authApi.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => 
    authApi.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => 
    authApi.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: any) => 
    authApi.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => 
    authApi.delete<T>(url, config),
};

export const profileClient = {
  get: <T = any>(url: string, config?: any) => 
    profileApi.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => 
    profileApi.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => 
    profileApi.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: any) => 
    profileApi.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => 
    profileApi.delete<T>(url, config),
};