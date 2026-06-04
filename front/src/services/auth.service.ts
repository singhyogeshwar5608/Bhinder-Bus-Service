import api from './api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/admin/login', { email, password }),

  logout: () =>
    api.post('/admin/logout'),
};