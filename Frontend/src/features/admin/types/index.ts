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
  isBlacklisted: boolean;
  blacklistedReason: string | null;
  blacklistedAt: string | null;
  helpTicketCount: number;
  createdAt: string;
  organisationName: string | null;
}

export interface AdminAnalyticsBreakdownItem {
  label: string;
  value: number;
}

export interface AdminAnalyticsMonthlyActivity {
  label: string;
  key: string;
  users: number;
  jobs: number;
  reservations: number;
  completedJobs: number;
  pickedUpReservations: number;
}

export interface AdminAnalyticsHighlight {
  label: string;
  value: string;
  detail: string;
}

export interface TopWorkerAnalytics {
  id: string;
  name: string;
  email: string;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  helpTicketCount: number;
  isBlacklisted: boolean;
}

export interface TopCustomerAnalytics {
  id: string;
  name: string;
  email: string;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  reservations: number;
  helpTicketCount: number;
  isBlacklisted: boolean;
}

export interface TopOrganisationAnalytics {
  id: string;
  name: string;
  email: string;
  reservations: number;
  pickedUpReservations: number;
  quantity: number;
  helpTicketCount: number;
  isBlacklisted: boolean;
}

export interface TicketHeavyUserAnalytics {
  id: string;
  name: string;
  email: string;
  role: string;
  helpTicketCount: number;
  isBlacklisted: boolean;
  blacklistedAt: string | null;
  blacklistedReason?: string | null;
}

export interface TopProductAnalytics {
  name: string;
  organisationName: string;
  reservations: number;
  quantity: number;
}

export interface AdminAnalyticsData {
  monthlyActivity: AdminAnalyticsMonthlyActivity[];
  jobsByStatus: AdminAnalyticsBreakdownItem[];
  reservationsByStatus: AdminAnalyticsBreakdownItem[];
  jobsByCategory: AdminAnalyticsBreakdownItem[];
  jobsByBudgetRange: AdminAnalyticsBreakdownItem[];
  reservationsByQuantityRange: AdminAnalyticsBreakdownItem[];
  usersByRole: AdminAnalyticsBreakdownItem[];
  userHealth: AdminAnalyticsBreakdownItem[];
  jobCoverage: AdminAnalyticsBreakdownItem[];
  reservationFlow: AdminAnalyticsBreakdownItem[];
  topWorkers: TopWorkerAnalytics[];
  topCustomers: TopCustomerAnalytics[];
  topOrganisations: TopOrganisationAnalytics[];
  topProducts: TopProductAnalytics[];
  ticketHeavyCustomers: TicketHeavyUserAnalytics[];
  ticketHeavyWorkers: TicketHeavyUserAnalytics[];
  ticketHeavyOrganisations: TicketHeavyUserAnalytics[];
  blacklistedUsers: TicketHeavyUserAnalytics[];
  highlights: AdminAnalyticsHighlight[];
}
