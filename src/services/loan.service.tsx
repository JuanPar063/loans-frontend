import api from './api.client';

export const loanService = {
  requestLoan: (data: { userId: string; amount: number }) =>
    api.post('/loans/request', data),
  getBalance: (userId: string) => api.get(`/loans/balance/${userId}`),
};