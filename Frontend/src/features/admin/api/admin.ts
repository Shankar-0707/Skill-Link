import { api } from '../../../services/api/api';
import type {
  AdminAnalyticsData,
  AdminUserSummary,
  RecentJob,
  RecentReservation,
  UserMetrics,
} from '../types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  data: T;
};

function unwrapResponse<T>(response: ApiEnvelope<T> | T): T {
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    'success' in response
  ) {
    return (response as ApiEnvelope<T>).data;
  }

  return response as T;
}

export const adminApi = {
  getDashboardMetrics: async (): Promise<UserMetrics> => {
    const response = await api.get('/admin/dashboard/metrics');
    return unwrapResponse<UserMetrics>(response.data);
  },

  getActiveJobs: async (): Promise<RecentJob[]> => {
    const response = await api.get('/admin/dashboard/active-jobs');

    const jobs = unwrapResponse<
      Array<{
        id: string;
        title: string;
        category: string;
        status: string;
        budget: number | null;
        createdAt: string;
        updatedAt: string;
        scheduledAt: string | null;
        workerName: string | null;
        customerName: string | null;
      }>
    >(response.data);

    return jobs.map((job) => ({
      id: job.id,
      title: job.title,
      category: job.category,
      status: job.status,
      workerName: job.workerName,
      customerName: job.customerName,
      date: job.updatedAt,
      price: job.budget ?? undefined,
      scheduledAt: job.scheduledAt,
    }));
  },

  getReservations: async (): Promise<RecentReservation[]> => {
    const response = await api.get('/admin/dashboard/reservations');

    const reservations = unwrapResponse<
      Array<{
        id: string;
        productName: string;
        organisationName: string;
        customerName: string;
        status: string;
        quantity: number;
        createdAt: string;
        updatedAt: string;
        expiresAt: string | null;
      }>
    >(response.data);

    return reservations.map((reservation) => ({
      id: reservation.id,
      productName: reservation.productName,
      organisationName: reservation.organisationName,
      customerName: reservation.customerName,
      status: reservation.status,
      quantity: reservation.quantity,
      date: reservation.updatedAt,
      expiresAt: reservation.expiresAt,
    }));
  },

  getUsers: async (): Promise<AdminUserSummary[]> => {
    const response = await api.get('/admin/users');
    return unwrapResponse<AdminUserSummary[]>(response.data);
  },

  getAnalytics: async (): Promise<AdminAnalyticsData> => {
    const response = await api.get('/admin/dashboard/analytics');
    return unwrapResponse<AdminAnalyticsData>(response.data);
  },
};
