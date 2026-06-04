import api from './api';

export const paymentService = {
  initiate: (bookingId: number) =>
    api.post('/payments/initiate', { booking_id: bookingId }),

  verify: (paymentId: string, bookingId: number, signature: string) =>
    api.post('/payments/verify', {
      payment_id: paymentId,
      booking_id: bookingId,
      signature,
    }),

  getAll: (page = 1) =>
    api.get(`/admin/payments?page=${page}`),

  getById: (id: number) =>
    api.get(`/admin/payments/${id}`),
};