import { api } from '../../../services/api/api';
import type { 
  Organisation, 
  UpdateOrganisationPayload, 
  ListOrganisationsParams, 
  PaginatedOrganisations 
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

export const organisationApi = {
  /**
   * List all active organisations (public)
   */
  findAll: async (params?: ListOrganisationsParams): Promise<PaginatedOrganisations> => {
    const response = await api.get('/organisations', { params });
    return unwrapResponse<PaginatedOrganisations>(response.data);
  },

  /**
   * Get a single organisation with its products (public)
   */
  findOne: async (id: string): Promise<Organisation> => {
    const response = await api.get(`/organisations/${id}`);
    return unwrapResponse<Organisation>(response.data);
  },

  /**
   * Get the authenticated organisation's own profile
   */
  getMyProfile: async (): Promise<Organisation> => {
    const response = await api.get('/organisations/me/profile');
    return unwrapResponse<Organisation>(response.data);
  },

  /**
   * Update the authenticated organisation's profile
   */
  updateMyProfile: async (data: UpdateOrganisationPayload): Promise<Organisation> => {
    const response = await api.patch('/organisations/me/profile', data);
    return unwrapResponse<Organisation>(response.data);
  },
};
