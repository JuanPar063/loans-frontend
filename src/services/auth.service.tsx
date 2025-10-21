import api from './api.client';

export const authService = {
  // Registro: solo username, email, password y role (para user-login)
  register: (data: { username: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),

  // Login: username y password (para user-login)
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data).then((res) => {
      localStorage.setItem('token', res.data.access_token);
      return res.data;
    }),
};