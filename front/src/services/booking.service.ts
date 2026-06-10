import api from './api';

export const bookingService = {
  // Public
  search: (fromCity: string, toCity: string, journeyDate: string) =>
    api.get('/search-buses', {
      params: { from_city: fromCity, to_city: toCity, journey_date: journeyDate }
    }),

  getSeats: (scheduleId: number, sessionId?: string) =>
    api.get(`/schedules/${scheduleId}/seats`, {
      params: { session_id: sessionId }
    }),

  create: (data: any) =>
    api.post('/bookings/create', data),

  getBooking: (bookingNumber: string) =>
    api.get(`/bookings/${bookingNumber}`),

  getByNumber: (bookingNumber: string) =>
    api.get(`/bookings/${bookingNumber}`),

  lockSeats: (data: { schedule_id: number; seat_numbers: string[]; session_id: string }) =>
    api.post('/seats/lock', data),

  unlockSeats: (data: { schedule_id: number; seat_numbers: string[]; session_id: string }) =>
    api.post('/seats/unlock', data),

  getSeatsStatus: (scheduleId: number, sessionId?: string) =>
    api.get('/seats/status', {
      params: { schedule_id: scheduleId, session_id: sessionId }
    }),

  cancel: (bookingNumber: string) =>
    api.post('/bookings/cancel', { booking_number: bookingNumber }),

  trackByPhone: (phone: string) =>
    api.get(`/bookings/track/${phone}`),

  // Admin
  getAll: (params?: { page?: number; search?: string; status?: string; date_from?: string; date_to?: string }) =>
    api.get('/admin/bookings', { params }),

  getById: (id: number) =>
    api.get(`/admin/bookings/${id}`),

  getStats: () =>
    api.get('/admin/bookings/stats'),
};