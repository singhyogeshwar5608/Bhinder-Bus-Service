import api from './api';

export const bookingService = {
  // Public
  search: (fromCity: string, toCity: string, journeyDate: string) =>
    api.get('/search-buses', {
      params: { from_city: fromCity, to_city: toCity, journey_date: journeyDate }
    }),

  getSeats: (scheduleId: number) =>
    api.get(`/seats/${scheduleId}`),

  create: (data: any) =>
    api.post('/bookings/create', data),

  getBooking: (bookingNumber: string) =>
    api.get(`/bookings/${bookingNumber}`),

  getByNumber: (bookingNumber: string) =>
    api.get(`/bookings/${bookingNumber}`),

  lockSeats: (data: any) =>
    api.post('/bookings/lock-seats', data),

  cancel: (bookingNumber: string) =>
    api.post('/bookings/cancel', { booking_number: bookingNumber }),

  // Admin
  getAll: (page = 1) =>
    api.get(`/admin/bookings?page=${page}`),

  getById: (id: number) =>
    api.get(`/admin/bookings/${id}`),
};