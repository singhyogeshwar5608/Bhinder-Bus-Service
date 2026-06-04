import api from './api';

export const settingsService = {
  getAll: () =>
    api.get(`/admin/settings`),

  update: (data: any) =>
    api.put(`/admin/settings`, data),
};