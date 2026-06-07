import axios, { AxiosError, AxiosResponse, AxiosInstance } from 'axios';

// ✅ Base ÚNICA: todo el tráfico pasa por el API gateway, versionado en /api/v1.
// El gateway (loans-software/nginx.conf) enruta /api/v1/{auth,profiles,loans,admin}/...
// a cada microservicio. Antes el SPA hablaba directo con cada puerto (3000-3003).
const API_BASE =
  (process.env.REACT_APP_API_URL || 'http://localhost:3005').replace(/\/$/, '') + '/api/v1';

// Tipado de errores de la API (en vez de `any`).
export interface ApiErrorData {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export type ApiError = AxiosError<ApiErrorData>;

const createApiInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  // Request: adjunta el JWT si existe.
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔵 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response: manejo centralizado de 401/403/5xx con error tipado.
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: ApiError) => {
      if (error.response) {
        const status = error.response.status;
        const url = error.config?.url || '';

        if (status === 401) {
          const publicRoutes = ['/auth/login', '/auth/register'];
          const isPublicRoute = publicRoutes.some((route) => url.includes(route));
          if (!isPublicRoute) {
            console.warn('⚠️ Token expirado o inválido. Redirigiendo a login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        }

        if (status === 403) {
          window.location.href = '/unauthorized';
        }

        if (status >= 500) {
          console.error('❌ Error del servidor. Por favor, intenta más tarde.');
        }
      } else if (error.request) {
        console.error('❌ No se recibió respuesta del servidor:', error.message);
      } else {
        console.error('❌ Error al configurar la petición:', error.message);
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

// Una sola instancia compartida (todo va por el gateway).
const api = createApiInstance(API_BASE);
export default api;

// Aliases para compatibilidad con el código existente (ahora apuntan al gateway).
export const authApi = api;
export const profileApi = api;

const buildClient = (instance: AxiosInstance) => ({
  get: <T = any>(url: string, config?: any) => instance.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => instance.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => instance.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: any) => instance.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => instance.delete<T>(url, config),
});

export const authClient = buildClient(api);
export const profileClient = buildClient(api);
