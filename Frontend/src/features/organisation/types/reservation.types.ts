// import type { Organisation } from './index';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PICKED_UP = 'PICKED_UP',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  stockQuantity: number;
  organisationId: string;
  images?: { id: string; imageUrl: string }[];
  category: string;
  organisation?: {
    id: string;
    businessName: string;
  };
}

export interface Customer {
  id: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface Reservation {
  id: string;
  productId: string;
  customerId: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: Product;
  customer: Customer;
  pickupOtp?: string; // added back from BE
  pickupOtpExpiresAt?: string;
  checkoutUrl?: string; // returning from BE creation
  providerPaymentId?: string;
  totalAmount?: number;
  payment?: {
    id: string;
    amount: number;
    status: string;
    checkoutUrl?: string;
    providerPaymentId?: string;
  };
  escrow?: {
    id: string;
    amount: number;
    status: string;
  };
  cancelReason?: string; // If added in backend
}

export interface ListIncomingReservationsParams {
  status?: ReservationStatus;
  productId?: string;
  page?: number;
  limit?: number;
}

export interface CancelReservationPayload {
  reason?: string;
}

export interface PaginatedReservations {
  items: Reservation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateReservationPayload {
  productId: string;
  quantity: number;
}

export interface ListReservationsParams {
  status?: ReservationStatus;
  page?: number;
  limit?: number;
}
