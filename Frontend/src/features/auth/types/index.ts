export const Role = {
  CUSTOMER: 'CUSTOMER',
  WORKER: 'WORKER',
  ORGANISATION: 'ORGANISATION',
  ADMIN: 'ADMIN',
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
  phone?: string;
  profileImage?: string;
  isEmailVerified: boolean;
  businessName?: string;
  businessType?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiError {
  message: string | string[];
  error: string;
  statusCode: number;
}
