import api from './api';

export const driverService = {
  getAll: (params: any = {}) =>
    api.get('/admin/drivers', { params }),

  getById: (id: number) =>
    api.get(`/admin/drivers/${id}`),

  create: (data: any) =>
    api.post('/admin/drivers', data),

  update: (id: number, data: any) =>
    api.post(`/admin/drivers/${id}`, data),

  delete: (id: number) =>
    api.delete(`/admin/drivers/${id}`),
};