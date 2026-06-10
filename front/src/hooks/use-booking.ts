import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { travelerService } from '@/services/traveler.service';

export const useBookings = (params?: { page?: number; search?: string; status?: string; date_from?: string; date_to?: string }) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const response = await bookingService.getAll(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useBookingStats = () => {
  return useQuery({
    queryKey: ['booking-stats'],
    queryFn: async () => {
      const response = await bookingService.getStats();
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};

export const useBookingByNumber = (bookingNumber: string) => {
  return useQuery({
    queryKey: ['booking', bookingNumber],
    queryFn: async () => {
      const response = await bookingService.getByNumber(bookingNumber);
      return response.data;
    },
    enabled: !!bookingNumber,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => bookingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-seats'] });
    },
  });
};

export const useLockSeats = () => {
  return useMutation({
    mutationFn: (data: { schedule_id: number; seat_numbers: string[]; session_id: string }) =>
      bookingService.lockSeats(data),
  });
};

export const useUnlockSeats = () => {
  return useMutation({
    mutationFn: (data: { schedule_id: number; seat_numbers: string[]; session_id: string }) =>
      bookingService.unlockSeats(data),
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingNumber: string) => bookingService.cancel(bookingNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

// Travelers
export const useTravelers = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['travelers', page, search],
    queryFn: async () => {
      const response = await travelerService.getAll(page, search);
      return response.data;
    },
  });
};
