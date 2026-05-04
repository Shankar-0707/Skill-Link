import { api } from "../../../services/api/api";
import type { 
  Reservation, 
  PaginatedReservations, 
  CreateReservationPayload, 
  ListReservationsParams,
  CancelReservationPayload
} from "../../organisation/types/reservation.types";

/**
 * Service for customers to manage their reservations.
 */
export const customerReservationService = {
  /**
   * Create a reservation for a product.
   */
  createReservation: async (payload: CreateReservationPayload): Promise<Reservation> => {
    const response = await api.post("/reservations", payload);
    return response.data.data || response.data;
  },

  /**
   * List the authenticated customer's own reservations.
   */
  getMyReservations: async (params?: ListReservationsParams): Promise<PaginatedReservations> => {
    const response = await api.get("/reservations/my", { params });
    return response.data.data || response.data;
  },


  /**
   * Cancel a reservation with a reason.
   */
  cancelReservation: async (id: string, payload: CancelReservationPayload): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}/cancel`, payload);
    return response.data.data || response.data;
  }
};
