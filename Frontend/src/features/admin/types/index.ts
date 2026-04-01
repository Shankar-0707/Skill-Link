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
}

export interface AdminDashboardData {
  metrics: UserMetrics;
  recentJobs: RecentJob[];
  recentReservations: RecentReservation[];
}
