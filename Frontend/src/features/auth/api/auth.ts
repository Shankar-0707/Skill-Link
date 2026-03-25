import { api } from '../../../services/api/api';
import type { AuthResponse } from '../types';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  role: string;
  name?: string;
  phone?: string;
  profileImage?: string;
  businessName?: string;
  businessType?: string;
  skills?: string[];
  bio?: string;
  experience?: number;
  serviceRadius?: number;
};

export const authApi = {
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getProfile: async (token: string): Promise<unknown> => {
    const response = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message?: string }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message?: string }> => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  verifyEmail: async (token: string): Promise<{ message?: string }> => {
    const response = await api.post('/auth/verify-email/confirm', { token });
    return response.data;
  },

  requestEmailVerification: async (email: string): Promise<{ message?: string }> => {
    const response = await api.post('/auth/verify-email/request', { email });
    return response.data;
  },
};
