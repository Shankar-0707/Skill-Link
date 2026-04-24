import { api } from './api';

export interface CheckoutDetails {
  id: string;
  amount: number;
  type: string;
  status: string;
  reservation?: {
    product: {
      name: string;
      price: number;
      organisation: {
        businessName: string;
      };
    };
  };
  job?: {
    title: string;
    budget: number;
  };
}

function unwrapResponse<T>(response: any): T {
  if (response && response.success && 'data' in response) {
    return response.data;
  }
  return response;
}

export const paymentsApi = {
  getCheckoutDetails: async (providerPaymentId: string): Promise<CheckoutDetails> => {
    const response = await api.get(`/payments/checkout/${providerPaymentId}`);
    return unwrapResponse<CheckoutDetails>(response.data);
  },

  confirmPayment: async (providerPaymentId: string): Promise<{ success: boolean; redirectUrl: string }> => {
    const response = await api.post(`/payments/confirm/${providerPaymentId}`);
    return unwrapResponse<{ success: boolean; redirectUrl: string }>(response.data);
  },

  reportFailure: async (providerPaymentId: string): Promise<{ success: boolean; redirectUrl: string }> => {
    const response = await api.post(`/payments/fail/${providerPaymentId}`);
    return unwrapResponse<{ success: boolean; redirectUrl: string }>(response.data);
  },

  getMyWallet: async () => {
    const response = await api.get('/payments/wallet');
    return unwrapResponse<any>(response.data);
  },
};
