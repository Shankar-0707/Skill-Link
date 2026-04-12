import { useEffect, useState } from 'react';
import { Briefcase, CheckCircle2, Clock, Loader2, RefreshCcw } from 'lucide-react';
import { adminApi } from '../../features/admin/api/admin';
import type { RecentJob } from '../../features/admin/types';
import { cn } from '@/shared/utils/cn';

const formatStatusLabel = (status: string) => status.replace('_', ' ');

const getStatusClassName = (status: string) =>
  cn(
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
    status === 'IN_PROGRESS'
      ? 'bg-blue-50 text-blue-700'
      : status === 'ASSIGNED'
        ? 'bg-orange-50 text-orange-700'
        : 'bg-slate-100 text-slate-700',
  );

const formatJobDate = (date: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));

export const AdminJobsPage = () => {
  const [jobs, setJobs] = useState<RecentJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getActiveJobs();
      setJobs(response);
      setError(null);
    } catch {
      setError('Unable to load active jobs right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-3xl text-foreground leading-tight">
            Active Jobs
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Posted, assigned, and in-progress jobs across the marketplace.
          </p>
        </div>
        <button
          onClick={() => void loadJobs()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-background border border-border text-foreground rounded-xl text-sm font-label font-semibold hover:bg-surface-container transition-all"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-background p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          <p className="mt-4 text-sm font-body text-muted-foreground">
            Loading active jobs...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background p-12 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h2 className="mt-4 text-lg font-headline font-bold text-foreground">
            No active jobs found
          </h2>
          <p className="mt-2 text-sm font-body text-muted-foreground">
            New posted, assigned, or in-progress jobs will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr_0.9fr] gap-4 px-6 py-4 border-b border-border text-[11px] font-label uppercase tracking-wider text-muted-foreground">
            <span>Job</span>
            <span>Customer</span>
            <span>Worker</span>
            <span>Status</span>
            <span>Updated</span>
          </div>
          <div className="divide-y divide-border">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr_0.9fr] gap-4 px-6 py-5 items-center hover:bg-surface-container/60 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-label font-semibold text-foreground">{job.title}</h3>
                  <p className="mt-1 text-xs font-body text-muted-foreground">
                    {job.category}
                    {typeof job.price === 'number'
                      ? ` - Rs ${job.price.toLocaleString()}`
                      : ''}
                  </p>
                </div>
                <p className="text-sm font-body text-foreground">
                  {job.customerName ?? 'Unknown customer'}
                </p>
                <p className="text-sm font-body text-foreground">
                  {job.workerName ?? 'Not assigned'}
                </p>
                <div>
                  <span className={getStatusClassName(job.status)}>
                    {job.status === 'IN_PROGRESS' && <Clock size={12} />}
                    {job.status === 'POSTED' && <Briefcase size={12} />}
                    {job.status === 'ASSIGNED' && <CheckCircle2 size={12} />}
                    {formatStatusLabel(job.status)}
                  </span>
                </div>
                <p className="text-xs font-body text-muted-foreground">
                  {formatJobDate(job.date)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
