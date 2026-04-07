import { useEffect, useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  PackageCheck,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../features/admin/api/admin';
import type {
  AdminDashboardData,
  MetricSummary,
  UserMetrics,
} from '../../features/admin/types';
import { cn } from '@/shared/utils/cn';

const formatTrend = (trend: number) => {
  const absoluteValue = Math.abs(trend).toFixed(1);

  if (trend > 0) {
    return `+${absoluteValue}% from last month`;
  }

  if (trend < 0) {
    return `-${absoluteValue}% from last month`;
  }

  return 'No change from last month';
};

const formatJobStatusLabel = (status: string) => status.replace('_', ' ');

const formatJobTimestamp = (date: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));

const getParticipantLabel = (job: AdminDashboardData['recentJobs'][number]) => {
  const workerName = job.workerName ?? 'Unassigned';
  const customerName = job.customerName ?? 'Unknown customer';
  return `${workerName} - ${customerName}`;
};

const getJobBadgeClassName = (status: string) =>
  cn(
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
    status === 'IN_PROGRESS'
      ? 'bg-blue-50 text-blue-700'
      : status === 'ASSIGNED'
        ? 'bg-orange-50 text-orange-700'
        : 'bg-slate-100 text-slate-700',
  );

const formatReservationStatusLabel = (status: string) => status.replace('_', ' ');

const formatReservationTimestamp = (date: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));

const getReservationBadgeClassName = (status: string) =>
  cn(
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
    status === 'CONFIRMED'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'PENDING'
        ? 'bg-amber-50 text-amber-700'
        : status === 'PICKED_UP'
          ? 'bg-blue-50 text-blue-700'
          : 'bg-slate-100 text-slate-700',
  );

type StatCardProps = {
  title: string;
  metric: MetricSummary;
  icon: React.ComponentType<{ size?: number }>;
};

const StatCard = ({ title, metric, icon: Icon }: StatCardProps) => (
  <div className="bg-background border border-border rounded-xl p-5 flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-label text-muted-foreground uppercase tracking-wide mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-headline font-bold text-foreground">
          {metric.count.toLocaleString()}
        </h3>
      </div>
      <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-foreground">
        <Icon size={20} />
      </div>
    </div>
    <div
      className={cn(
        'text-xs font-label',
        metric.trend > 0 && 'text-emerald-600',
        metric.trend < 0 && 'text-rose-600',
        metric.trend === 0 && 'text-muted-foreground',
      )}
    >
      {formatTrend(metric.trend)}
    </div>
  </div>
);

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [recentJobs, setRecentJobs] = useState<AdminDashboardData['recentJobs']>([]);
  const [recentReservations, setRecentReservations] = useState<
    AdminDashboardData['recentReservations']
  >([]);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [reservationsError, setReservationsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const [metricsResponse, activeJobsResponse, reservationsResponse] =
          await Promise.all([
          adminApi.getDashboardMetrics(),
          adminApi.getActiveJobs(),
          adminApi.getReservations(),
        ]);

        if (!active) {
          return;
        }

        setMetrics(metricsResponse);
        setRecentJobs(activeJobsResponse.slice(0, 4));
        setRecentReservations(reservationsResponse.slice(0, 4));
        setMetricsError(null);
        setJobsError(null);
        setReservationsError(null);
      } catch {
        if (!active) {
          return;
        }

        setMetricsError('Unable to load admin metrics right now.');
        setJobsError('Unable to load active jobs right now.');
        setReservationsError('Unable to load reservations right now.');
      }
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const data: AdminDashboardData | null = metrics
    ? {
        metrics,
        recentJobs,
        recentReservations,
      }
    : null;

  if (!data && !metricsError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="font-headline font-bold text-3xl text-foreground leading-tight">
            Marketplace Overview
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Real-time performance metrics and active logistical status.
          </p>
        </div>
        {/* <button className="px-6 py-2.5 bg-[#001F3F] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#001F3F]/20 hover:bg-[#001F3F]/90 transition-all">
          Generate Report
        </button> */}
      </div>

      {metricsError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {metricsError}
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" metric={data.metrics.total} icon={Users} />
            <StatCard
              title="Customers"
              metric={data.metrics.customers}
              icon={ShoppingBag}
            />
            <StatCard title="Workers" metric={data.metrics.workers} icon={Briefcase} />
            <StatCard
              title="Organizations"
              metric={data.metrics.organisations}
              icon={Building2}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-background rounded-xl border border-border overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-border flex justify-between items-center">
                <h2 className="font-headline font-bold text-lg text-foreground">
                  Active Job Assignments
                </h2>
                <button
                  onClick={() => navigate('/admin/jobs')}
                  className="text-sm font-label font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  View All
                </button>
              </div>
              {jobsError ? (
                <div className="p-5 text-sm font-medium text-rose-700 bg-rose-50 border-t border-rose-100">
                  {jobsError}
                </div>
              ) : null}
              <div className="divide-y divide-border flex-1">
                {data.recentJobs.length > 0 ? (
                  data.recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="px-5 py-4 hover:bg-surface-container/60 transition-colors group flex justify-between items-center gap-4"
                    >
                      <div>
                        <h4 className="text-sm font-label font-semibold text-foreground">
                          {job.title}
                        </h4>
                        <p className="text-xs font-body text-muted-foreground mt-1">
                          {getParticipantLabel(job)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={getJobBadgeClassName(job.status)}>
                          {job.status === 'IN_PROGRESS' && <Clock size={12} />}
                          {job.status === 'ASSIGNED' && <CheckCircle2 size={12} />}
                          {job.status === 'POSTED' && <Briefcase size={12} />}
                          {formatJobStatusLabel(job.status)}
                        </span>
                        <p className="text-xs font-body text-muted-foreground mt-1">
                          {formatJobTimestamp(job.date)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-5 text-sm font-body text-muted-foreground">
                    No active jobs found right now.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-background rounded-xl border border-border overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-border flex justify-between items-center">
                <h2 className="font-headline font-bold text-lg text-foreground">
                  Recent Reservations
                </h2>
                <button
                  onClick={() => navigate('/admin/reservations')}
                  className="text-sm font-label font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  View All
                </button>
              </div>
              {reservationsError ? (
                <div className="p-5 text-sm font-medium text-rose-700 bg-rose-50 border-t border-rose-100">
                  {reservationsError}
                </div>
              ) : null}
              <div className="divide-y divide-border flex-1">
                {data.recentReservations.length > 0 ? (
                  data.recentReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="px-5 py-4 hover:bg-surface-container/60 transition-colors group flex justify-between items-center gap-4"
                    >
                      <div>
                        <h4 className="text-sm font-label font-semibold text-foreground">
                          {reservation.productName}
                        </h4>
                        <p className="text-xs font-body text-muted-foreground mt-1">
                          {reservation.organisationName}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={getReservationBadgeClassName(reservation.status)}>
                          {reservation.status === 'CONFIRMED' && (
                            <CheckCircle2 size={12} />
                          )}
                          {reservation.status === 'PENDING' && (
                            <Clock size={12} />
                          )}
                          {reservation.status === 'PICKED_UP' && (
                            <PackageCheck size={12} />
                          )}
                          {formatReservationStatusLabel(reservation.status)}
                        </span>
                        <p className="text-xs font-body text-muted-foreground mt-1">
                          {formatReservationTimestamp(reservation.date)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-5 text-sm font-body text-muted-foreground">
                    No reservations found right now.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
