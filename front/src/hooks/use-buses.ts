import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { busService } from '@/services/bus.service';

export const useBuses = (params: any = {}) => {
  return useQuery({
    queryKey: ['buses', params],
    queryFn: async () => {
      const response = await busService.getAll(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useBusStats = () => {
  return useQuery({
    queryKey: ['bus-stats'],
    queryFn: async () => {
      const response = await busService.getStats();
      return response.data.data;
    },
  });
};

export const useBusById = (id: number) => {
  return useQuery({
    queryKey: ['bus', id],
    queryFn: async () => {
      const response = await busService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateBus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => busService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
    },
  });
};

export const useUpdateBus = (id?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const targetId = id || data.get('id'); // Fallback to id in FormData if not provided
      return busService.update(targetId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['bus', id] });
      }
    },
  });
};

export const useDeleteBus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => busService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
    },
  });
};
