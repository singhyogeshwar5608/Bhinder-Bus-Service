import api from './api';

export const routeService = {
  getAll: (page = 1, filters: any = {}) => {
    const params = new URLSearchParams({ page: page.toString(), ...filters });
    return api.get(`/admin/routes?${params.toString()}`);
  },

  getById: (id: number) =>
    api.get(`/admin/routes/${id}`),

  create: (data: any) =>
    api.post('/admin/routes', data),

  update: (id: number, data: any) =>
    api.put(`/admin/routes/${id}`, data),

  delete: (id: number) =>
    api.delete(`/admin/routes/${id}`),
};