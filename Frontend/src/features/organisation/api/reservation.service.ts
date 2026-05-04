import { api } from '../../../services/api/api';
import type { 
  Reservation, 
  ListIncomingReservationsParams, 
  CancelReservationPayload,
  PaginatedReservations,
  CreateReservationPayload,
  ListReservationsParams
} from '../types/reservation.types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  data: T;
};

function unwrapResponse<T>(response: ApiEnvelope<T> | T): T {
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    'success' in response
  ) {
    return (response as ApiEnvelope<T>).data;
  }

  return response as T;
}

export const reservationApi = {
  /**
   * List incoming reservations for the organisation's products
   */
  getIncoming: async (params?: ListIncomingReservationsParams): Promise<PaginatedReservations> => {
    const response = await api.get('/reservations/incoming', { params });
    return unwrapResponse<PaginatedReservations>(response.data);
  },

  /**
   * Confirm a pending reservation
   */
  confirm: async (id: string): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}/confirm`);
    return unwrapResponse<Reservation>(response.data);
  },

  /**
   * Cancel a reservation with a reason
   */
  cancel: async (id: string, payload: CancelReservationPayload): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}/cancel`, payload);
    return unwrapResponse<Reservation>(response.data);
  },

  /**
   * Get a single reservation by ID
   */
  getOne: async (id: string): Promise<Reservation> => {
    const response = await api.get(`/reservations/${id}`);
    return unwrapResponse<Reservation>(response.data);
  },

  /**
   * Create a reservation for a product
   */
  create: async (payload: CreateReservationPayload): Promise<Reservation> => {
    const response = await api.post('/reservations', payload);
    return unwrapResponse<Reservation>(response.data);
  },

  /**
   * List the authenticated customer's own reservations
   */
  findMy: async (params?: ListReservationsParams): Promise<PaginatedReservations> => {
    const response = await api.get('/reservations/my', { params });
    return unwrapResponse<PaginatedReservations>(response.data);
  },

  /**
   * org: Verify OTP marking it PICKED_UP
   */
  verifyPickup: async (id: string, payload: { otp: string }): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}/verify-pickup`, payload);
    return unwrapResponse<Reservation>(response.data);
  },

  /**
   * org: Reject a pending reservation
   */
  reject: async (id: string, payload: { reason?: string }): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}/reject`, payload);
    return unwrapResponse<Reservation>(response.data);
  },
};
