import api from './api';

export const reportService = {
  getAll: () =>
    api.get(`/admin/reports`),
};