export interface MetricSummary {
  count: number;
  trend: number;
}

export interface UserMetrics {
  total: MetricSummary;
  customers: MetricSummary;
  workers: MetricSummary;
  organisations: MetricSummary;
}

export interface RecentJob {
  id: string;
  title: string;
  status: string;
  workerName: string | null;
  customerName: string | null;
  date: string;
  price?: number;
  category?: string;
  scheduledAt?: string | null;
}

export interface RecentReservation {
  id: string;
  productName: string;
  organisationName: string;
  customerName: string;
  status: string;
  date: string;
  quantity: number;
  expiresAt?: string | null;
}

export interface AdminDashboardData {
  metrics: UserMetrics;
  recentJobs: RecentJob[];
  recentReservations: RecentReservation[];
}

export interface AdminUserSummary {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  organisationName: string | null;
}
