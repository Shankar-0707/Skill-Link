import { api } from '../../../services/api/api';

export type DocumentType = 
  | 'AADHAAR'
  | 'PAN'
  | 'DRIVING_LICENSE'
  | 'PASSPORT'
  | 'PROFILE_PHOTO'
  | 'SKILL_CERTIFICATE';

export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface KycDraftDocument {
  id: string;
  documentType: DocumentType;
  documentUrl: string;
  status: string;
  updatedAt: string;
}

export interface KycStatusResponse {
  kycStatus: KycStatus;
  pendingRequest: {
    id: string;
    status: string;
    submittedAt: string;
    verifiedAt?: string;
    rejectionReason?: string;
    reviewedAt?: string;
  } | null;
  lastRequest: {
    id: string;
    status: string;
    submittedAt: string;
    verifiedAt?: string;
    rejectionReason?: string;
    reviewedAt?: string;
  } | null;
  draftDocuments: KycDraftDocument[];
  draftCount: number;
  requiredDocumentTypes: DocumentType[];
  canSubmit: boolean;
}

export const kycService = {
  /**
   * Get the worker's current KYC status, draft documents, and submission eligibility.
   */
  getStatus: async (): Promise<KycStatusResponse> => {
    const response = await api.get('/kyc/status');
    return response.data.data ?? response.data;
  },

  /**
   * Upload a KYC document draft (multipart/form-data).
   * documentType: e.g. 'AADHAAR', 'PAN', 'PROFILE_PHOTO'
   */
  uploadDocument: async (file: File, documentType: DocumentType): Promise<KycDraftDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    const response = await api.post('/kyc/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data ?? response.data;
  },

  /**
   * Submit all draft documents for admin review.
   */
  submitKyc: async (): Promise<{ id: string; status: string; submittedAt: string }> => {
    const response = await api.post('/kyc/submit');
    return response.data.data ?? response.data;
  },
};
