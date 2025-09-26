import api from './api.client';

export const adminService = {
  getMetrics: (userId: string) => api.get(`/admin/metrics/${userId}`),
};