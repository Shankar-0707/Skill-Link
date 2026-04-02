import { api } from '../../../services/api/api';

export type AdminKycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface KycRequestWorker {
  id: string;
  kycStatus: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
  };
}

export interface KycRequestDocument {
  id: string;
  documentType: string;
  documentUrl: string;
  status: string;
  createdAt: string;
}

export interface KycRequest {
  id: string;
  status: AdminKycStatus;
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  worker: KycRequestWorker;
  documents: KycRequestDocument[];
  _count?: { documents: number };
}

export interface PaginatedKycRequests {
  items: KycRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adminKycService = {
  /**
   * List KYC requests. Defaults to PENDING only unless `all=true`.
   */
  listRequests: async (params?: {
    status?: AdminKycStatus;
    all?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedKycRequests> => {
    const response = await api.get('/admin/kyc-requests', { params });
    return response.data.data ?? response.data;
  },

  /**
   * Approve a KYC request.
   */
  approve: async (id: string): Promise<KycRequest> => {
    const response = await api.post(`/admin/kyc/${id}/approve`);
    return response.data.data ?? response.data;
  },

  /**
   * Reject a KYC request with a reason.
   */
  reject: async (id: string, rejectionReason: string): Promise<KycRequest> => {
    const response = await api.post(`/admin/kyc/${id}/reject`, { rejectionReason });
    return response.data.data ?? response.data;
  },
};
