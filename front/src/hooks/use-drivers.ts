import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driverService } from '@/services/driver.service';

export const useDrivers = (paramsOrPage: any = 1) => {
  const params = typeof paramsOrPage === 'number' ? { page: paramsOrPage } : paramsOrPage;
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: async () => {
      const response = await driverService.getAll(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDriverById = (id: number) => {
  return useQuery({
    queryKey: ['driver', id],
    queryFn: async () => {
      const response = await driverService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => driverService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};

export const useUpdateDriver = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => driverService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['driver', id] });
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => driverService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};
