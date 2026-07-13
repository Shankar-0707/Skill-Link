import { api } from '../../../services/api/api';
import type { KycStatus } from './kycService';

export interface PlatformContractStatus {
  kycStatus: KycStatus;
  isSigned: boolean;
  platformFeePercent: number;
  signedAt?: string | null;
  canSign: boolean;
}

export const platformContractService = {
  getStatus: async (): Promise<PlatformContractStatus> => {
    const response = await api.get('/workers/platform-contract/status');
    return response.data.data ?? response.data;
  },

  sign: async (): Promise<{
    isSigned: boolean;
    platformFeePercent: number;
    signedAt?: string | null;
  }> => {
    const response = await api.post('/workers/platform-contract/sign');
    return response.data.data ?? response.data;
  },
};
