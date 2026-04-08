import { api } from '@/services/api/api';
import type {
  AdminHelpTicketListParams,
  CreateHelpTicketPayload,
  HelpTicket,
  PaginatedHelpTickets,
} from '../types';

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

export const helpService = {
  async createTicket(payload: CreateHelpTicketPayload): Promise<HelpTicket> {
    const response = await api.post('/help/tickets', payload);
    return unwrapResponse<HelpTicket>(response.data);
  },

  async getMyTickets(): Promise<HelpTicket[]> {
    const response = await api.get('/help/tickets/my');
    return unwrapResponse<HelpTicket[]>(response.data);
  },

  async listAdminTickets(
    params?: AdminHelpTicketListParams,
  ): Promise<PaginatedHelpTickets> {
    const response = await api.get('/admin/help-tickets', { params });
    return unwrapResponse<PaginatedHelpTickets>(response.data);
  },

  async resolveTicket(
    ticketId: string,
    resolutionNote?: string,
  ): Promise<HelpTicket> {
    const response = await api.post(`/admin/help-tickets/${ticketId}/resolve`, {
      resolutionNote,
    });
    return unwrapResponse<HelpTicket>(response.data);
  },

  async rejectTicket(
    ticketId: string,
    rejectionReason: string,
  ): Promise<HelpTicket> {
    const response = await api.post(`/admin/help-tickets/${ticketId}/reject`, {
      rejectionReason,
    });
    return unwrapResponse<HelpTicket>(response.data);
  },
};
