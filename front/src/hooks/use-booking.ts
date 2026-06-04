import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { travelerService } from '@/services/traveler.service';

export const useBookings = (page = 1) => {
  return useQuery({
    queryKey: ['bookings', page],
    queryFn: async () => {
      const response = await bookingService.getAll(page);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
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
    },
  });
};

export const useLockSeats = () => {
  return useMutation({
    mutationFn: (data: { schedule_id: number; seat_numbers: string[]; session_id: string }) =>
      bookingService.lockSeats(data),
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
export const useTravelers = (page = 1) => {
  return useQuery({
    queryKey: ['travelers', page],
    queryFn: async () => {
      const response = await travelerService.getAll(page);
      return response.data;
    },
  });
};
