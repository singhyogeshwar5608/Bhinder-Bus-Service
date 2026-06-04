import api from './api';

export const scheduleService = {
  getAll: (page = 1, filters: any = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/admin/schedules?${params.toString()}`);
  },

  getById: (id: number) =>
    api.get(`/admin/schedules/${id}`),

  create: (data: any) =>
    api.post('/admin/schedules', data),

  update: (id: number, data: any) =>
    api.put(`/admin/schedules/${id}`, data),

  delete: (id: number) =>
    api.delete(`/admin/schedules/${id}`),

  getStats: () =>
    api.get('/admin/schedules/stats'),
};
