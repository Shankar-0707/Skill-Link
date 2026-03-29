import { api } from '../../../services/api/api';
import type { 
  Reservation, 
  ListIncomingReservationsParams, 
  CancelReservationPayload,
  PaginatedReservations 
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
};
