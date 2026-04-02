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
  emailVerified: boolean;
  authProvider?: 'LOCAL' | 'GOOGLE';
  isActive?: boolean;
  businessName?: string;
  businessType?: string;
  customer?: unknown;
  worker?: {
    skills?: string[];
    bio?: string | null;
    experience?: number | null;
    serviceRadius?: number | null;
    isAvailable?: boolean;
  } | null;
  organisation?: {
    businessName?: string;
    businessType?: string;
    description?: string | null;
  } | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface BasicApiResponse {
  success?: boolean;
  message?: string;
}

export interface ApiError {
  message: string | string[];
  error: string;
  statusCode: number;
}
