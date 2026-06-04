import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';

export const useLogin = () => {
  const setToken = useAuthStore((state) => state.setToken);
  const setAdmin = useAuthStore((state) => state.setAdmin);

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await authService.login(credentials.email, credentials.password);
      return response.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem('admin_token', data.token);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      logoutStore();
      localStorage.removeItem('admin_token');
      queryClient.clear();
    },
  });
};
