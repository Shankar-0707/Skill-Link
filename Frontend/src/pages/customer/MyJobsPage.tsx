import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import type { Job, JobStatus } from '../../features/customer/types';
import { JobCard } from '../../features/customer/worker/JobCard';
import { StatCard, EmptyState, PageHeader } from '../../features/customer/components/ui';
import { Layout } from '../../features/customer/components/layout/Layout';
import { jobService } from '../../features/customer/services/jobService';

export const MyJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | JobStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobService.getMyJobs();
      setJobs(data);
    } catch (err: any) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load your jobs. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filtered = jobs.filter(j => {
    const matchesFilter = activeFilter === 'ALL' || j.status === activeFilter;
    const matchesSearch = !searchQuery || 
      j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total:      jobs.length,
    active:     jobs.filter(j => ['POSTED', 'ASSIGNED', 'IN_PROGRESS'].includes(j.status)).length,
    completed:  jobs.filter(j => j.status === 'COMPLETED').length,
    totalSpend: jobs.filter(j => j.status === 'COMPLETED').reduce((s, j) => s + (j.budget ?? 0), 0),
  };

  const FILTER_TABS: { label: string; value: 'ALL' | JobStatus }[] = [
    { label: 'All',         value: 'ALL'         },
    { label: 'Open',        value: 'POSTED'      },
    { label: 'Assigned',    value: 'ASSIGNED'    },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed',   value: 'COMPLETED'   },
    { label: 'Cancelled',   value: 'CANCELLED'   },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm font-body text-muted-foreground">Loading your jobs...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <EmptyState
          icon="⚠️"
          title="Couldn't load jobs"
          description={error}
          action={{ label: 'Try Again', onClick: fetchJobs }}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="My Jobs"
        subtitle="Track and manage all your service requests"
        action={{ label: '+ Post New Job', onClick: () => navigate('/user/create-job') }}
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Jobs"    value={stats.total}     />
        <StatCard label="Active"        value={stats.active}    accent="warning"   />
        <StatCard label="Completed"     value={stats.completed} accent="success"  />
        <StatCard label="Total Spent"   value={`₹${stats.totalSpend.toLocaleString()}`} sub="on completed jobs" />
      </div>

      {/* Filter and Search actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl w-fit overflow-x-auto max-w-full scrollbar-hide">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-label font-medium transition-all whitespace-nowrap
                ${activeFilter === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab.label}
              {tab.value !== 'ALL' && (
                <span className="ml-1.5 opacity-50 font-bold">
                  {jobs.filter(j => j.status === tab.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-xs group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container border border-transparent rounded-xl text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-outline focus:ring-4 focus:ring-foreground/5 transition-all"
          />
        </div>
      </div>

      {/* Jobs list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title={searchQuery ? "No matching jobs" : "No jobs here"}
          description={searchQuery 
            ? `We couldn't find any jobs matching "${searchQuery}" in this category.` 
            : activeFilter === 'ALL' ? "You haven't posted any jobs yet." : "No jobs found with this status."}
          action={searchQuery ? { label: 'Clear Search', onClick: () => setSearchQuery('') } : (activeFilter === 'ALL' ? { label: 'Post a New Job', onClick: () => navigate('/user/create-job') } : undefined)}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onClick={(j: Job) => navigate(`/user/job-detail/${j.id}`, { state: j })}
            />
          ))}
        </div>
      )}
    </Layout>
  );
};
