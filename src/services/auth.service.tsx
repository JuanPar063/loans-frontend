import api from './api.client';

export const authService = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/users/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((res) => {
      localStorage.setItem('token', res.data.token);
      return res.data;
    }),
};