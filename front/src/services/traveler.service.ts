import api from './api';

export const travelerService = {
  getAll: (page = 1, search = '') =>
    api.get(`/admin/travelers?page=${page}&search=${search}`),

  getByName: (name: string) =>
    api.get(`/admin/travelers/${name}`),
};
