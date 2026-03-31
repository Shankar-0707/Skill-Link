export interface UserMetrics {
  total: number;
  customers: number;
  workers: number;
  organisations: number;
}

export interface RecentJob {
  id: string;
  title: string;
  status: string;
  workerName: string;
  customerName: string;
  date: string;
  price?: number;
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
