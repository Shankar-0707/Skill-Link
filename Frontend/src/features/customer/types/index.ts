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
  escrow?: {
    amount: number;
    status: 'HELD' | 'RELEASED' | 'REFUNDED';
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