import { useEffect, useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
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

const mockReservations: AdminDashboardData['recentReservations'] = [
  {
    id: '1',
    productName: 'Eco Bricks Pack',
    organisationName: 'GreenBuild Materials',
    customerName: 'TechCorp Inc.',
    status: 'Confirmed',
    date: 'Today',
  },
  {
    id: '2',
    productName: 'Electric Drill',
    organisationName: 'Urban Tools Hub',
    customerName: 'Alice Moore',
    status: 'Pending',
    date: 'Yesterday',
  },
];

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

type StatCardProps = {
  title: string;
  metric: MetricSummary;
  icon: React.ComponentType<{ size?: number }>;
};

const StatCard = ({ title, metric, icon: Icon }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-extrabold text-[#001F3F]">
          {metric.count.toLocaleString()}
        </h3>
      </div>
      <div className="w-12 h-12 rounded-xl bg-[#f2f4f6] flex items-center justify-center text-[#001F3F]">
        <Icon size={24} />
      </div>
    </div>
    <div
      className={cn(
        'mt-4 text-xs font-semibold',
        metric.trend > 0 && 'text-emerald-600',
        metric.trend < 0 && 'text-rose-600',
        metric.trend === 0 && 'text-gray-500',
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
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const [metricsResponse, activeJobsResponse] = await Promise.all([
          adminApi.getDashboardMetrics(),
          adminApi.getActiveJobs(),
        ]);

        if (!active) {
          return;
        }

        setMetrics(metricsResponse);
        setRecentJobs(activeJobsResponse.slice(0, 5));
        setMetricsError(null);
        setJobsError(null);
      } catch {
        if (!active) {
          return;
        }

        setMetricsError('Unable to load admin metrics right now.');
        setJobsError('Unable to load active jobs right now.');
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
        recentReservations: mockReservations,
      }
    : null;

  if (!data && !metricsError) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#001F3F]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-[#001F3F] tracking-tight">
            Marketplace Overview
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-2">
            Real-time performance metrics and active logistical status.
          </p>
        </div>
        <button className="px-6 py-2.5 bg-[#001F3F] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#001F3F]/20 hover:bg-[#001F3F]/90 transition-all">
          Generate Report
        </button>
      </div>

      {metricsError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fcfcfc]">
                <h2 className="text-lg font-bold text-[#001F3F]">
                  Active Job Assignments
                </h2>
                <button
                  onClick={() => navigate('/admin/jobs')}
                  className="text-xs font-bold text-[#001F3F] hover:underline"
                >
                  View All
                </button>
              </div>
              {jobsError ? (
                <div className="p-6 text-sm font-medium text-rose-700 bg-rose-50 border-t border-rose-100">
                  {jobsError}
                </div>
              ) : null}
              <div className="divide-y divide-gray-100 flex-1">
                {data.recentJobs.length > 0 ? (
                  data.recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-6 hover:bg-[#f8f9fb] transition-colors group flex justify-between items-center"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#001F3F] transition-colors">
                          {job.title}
                        </h4>
                        <p className="text-xs font-medium text-gray-500 mt-1">
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
                        <p className="text-xs font-semibold text-gray-400 mt-1">
                          {formatJobTimestamp(job.date)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-sm font-medium text-gray-500">
                    No active jobs found right now.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fcfcfc]">
                <h2 className="text-lg font-bold text-[#001F3F]">
                  Recent Reservations
                </h2>
                <button className="text-xs font-bold text-[#001F3F] hover:underline">
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-100 flex-1">
                {data.recentReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="p-6 hover:bg-[#f8f9fb] transition-colors group flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#001F3F] transition-colors">
                        {reservation.productName}
                      </h4>
                      <p className="text-xs font-medium text-gray-500 mt-1">
                        {reservation.organisationName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
                          reservation.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-700',
                        )}
                      >
                        {reservation.status === 'Confirmed' && (
                          <CheckCircle2 size={12} />
                        )}
                        {reservation.status}
                      </span>
                      <p className="text-xs font-semibold text-gray-400 mt-2">
                        {reservation.customerName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
