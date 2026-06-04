// Auth Zustand Store
// Place this in: src/stores/authStore.ts

import { create } from 'zustand';
import api from '@/services/api';

export interface Admin {
  id: number;
  name: string;
  email: string;
}

export interface AuthStore {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  admin: null,
  token: localStorage.getItem('admin_token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/admin/login', { email, password });
      const { token, admin } = response.data;
      
      localStorage.setItem('admin_token', token);
      set({ token, admin, isLoading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    set({ token: null, admin: null, error: null });
  },

  checkAuth: () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      set({ token });
    } else {
      set({ token: null, admin: null });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
