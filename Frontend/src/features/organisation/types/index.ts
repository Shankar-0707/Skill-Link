// import { BasicApiResponse } from '../../auth/types';

export interface Organisation {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  description?: string | null;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganisationPayload {
  businessName?: string;
  businessType?: string;
  description?: string;
}

export interface ListOrganisationsParams {
  businessType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedOrganisations {
  items: Organisation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
