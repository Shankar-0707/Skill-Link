import { api } from '../../../services/api/api';
import type { AuthResponse, BasicApiResponse, RegisterResponse, User } from '../types';

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

export const authApi = {
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return unwrapResponse<AuthResponse>(response.data);
  },

  register: async (data: RegisterPayload): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', data);
    return unwrapResponse<RegisterResponse>(response.data);
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return unwrapResponse<User>(response.data);
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return unwrapResponse<AuthResponse>(response.data);
  },

  logout: async (refreshToken: string): Promise<BasicApiResponse> => {
    const response = await api.post('/auth/logout', { refreshToken });
    return unwrapResponse<BasicApiResponse>(response.data);
  },

  forgotPassword: async (email: string): Promise<BasicApiResponse> => {
    const response = await api.post('/auth/forgot-password', { email });
    return unwrapResponse<BasicApiResponse>(response.data);
  },

  resetPassword: async (token: string, newPassword: string): Promise<BasicApiResponse> => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return unwrapResponse<BasicApiResponse>(response.data);
  },

  verifyEmail: async (token: string): Promise<BasicApiResponse> => {
    const response = await api.post('/auth/verify-email/confirm', { token });
    return unwrapResponse<BasicApiResponse>(response.data);
  },

  requestEmailVerification: async (email: string): Promise<BasicApiResponse> => {
    const response = await api.post('/auth/verify-email/request', { email });
    return unwrapResponse<BasicApiResponse>(response.data);
  },

  deleteAccount: async (): Promise<BasicApiResponse> => {
    const response = await api.delete('/auth/profile');
    return unwrapResponse<BasicApiResponse>(response.data);
  },
};
