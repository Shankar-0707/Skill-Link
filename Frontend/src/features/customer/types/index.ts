import type { Product, ListProductsParams, PaginatedProducts } from "../../products/types";
import type { Reservation, ReservationStatus, PaginatedReservations, CreateReservationPayload, ListReservationsParams, CancelReservationPayload } from "../../organisation/types/reservation.types";

// ── Job Types ─────────────────────────────────────────────────────────────────

export type JobStatus =
  | 'POSTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  status: JobStatus;
  scheduledAt?: string;
  createdAt: string;
  worker?: WorkerSummary;
  offers?: JobOffer[];
  contracts?: JobContract[];
  checkoutUrl?: string;
  providerPaymentId?: string;
  escrow?: {
    amount: number;
    status: 'HELD' | 'RELEASED' | 'REFUNDED';
  };
}

export type JobOfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export type JobContractStatus = 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface JobOffer {
  id: string;
  status: JobOfferStatus;
  workerId?: string;
  respondedAt?: string | null;
  createdAt?: string;
  chatRoom?: { id: string } | null;
  worker?: Worker;
  job?: Job & {
    customer?: {
      user: {
        id: string;
        name?: string;
        profileImage?: string;
      };
    };
  };
}

export interface JobContract {
  id: string;
  workerId: string;
  cost: number;
  timing: string;
  scheduledAt: string;
  scope: string;
  notes?: string | null;
  template: string;
  status: JobContractStatus;
  sentAt?: string;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
}

export interface ChatRoom {
  id: string;
  jobId: string;
  workerId: string;
  worker?: {
    user: {
      id: string;
      name?: string;
      profileImage?: string;
    };
  };
  customer?: {
    user: {
      id: string;
      name?: string;
      profileImage?: string;
    };
  };
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderUserId: string;
  message: string;
  createdAt: string;
  sender?: {
    id: string;
    name?: string;
    role?: string;
  };
}

// ── Worker Types ──────────────────────────────────────────────────────────────

export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface WorkerSummary {
  id: string;
  user: {
    id: string;
    phone: string;
    profileImage?: string;
    name?: string;
  };
}

export interface Worker {
  id: string;
  skills: string[];
  experience?: number;
  bio?: string;
  isAvailable: boolean;
  ratingAvg: number;
  ratingCount: number;
  serviceRadius?: number;
  kycStatus: KycStatus;
  user: {
    id: string;
    phone: string;
    profileImage?: string;
    name?: string;
  };
}

// ── User / Auth Types ─────────────────────────────────────────────────────────

export type UserRole = 'CUSTOMER' | 'WORKER' | 'ADMIN' | 'ORGANISATION';

export interface CurrentUser {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

// ── UI Utility Types ──────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
}

// ── Re-exported Types ────────────────────────────────────────────────────────

export type {
  Product,
  ListProductsParams,
  PaginatedProducts,
  Reservation,
  ReservationStatus,
  PaginatedReservations,
  CreateReservationPayload,
  ListReservationsParams,
  CancelReservationPayload
};
