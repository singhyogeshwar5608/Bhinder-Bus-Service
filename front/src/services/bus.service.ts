import api from './api';

export const busService = {
  getAll: (params: any = {}) =>
    api.get('/admin/buses', { params }),

  getStats: () =>
    api.get('/admin/buses/stats'),

  getById: (id: number) =>
    api.get(`/admin/buses/${id}`),

  create: (data: any) =>
    api.post('/admin/buses', data),

  update: (id: number, data: any) =>
    api.post(`/admin/buses/${id}`, data),

  delete: (id: number) =>
    api.delete(`/admin/buses/${id}`),
};