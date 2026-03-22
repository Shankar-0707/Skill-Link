import { api } from '../../../services/api/api';
import type { AuthResponse } from '../types';

export const authApi = {
  login: async (data: any): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: any): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getProfile: async (token: string): Promise<any> => {
    const response = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
