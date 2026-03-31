import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { jobService } from '../../features/customer/services/jobService';
import type { Job, JobStatus } from '../../features/customer/types';
import { StatCard, PageHeader, EmptyState } from '../../features/worker/components/ui';
import { AssignmentCard } from '../../features/worker/components/jobs/JobsCard';
import { WorkerLayout } from '../../features/worker/components/layout/Layout';

type FilterValue = 'ALL' | JobStatus;

const FILTER_TABS: { label: string; value: FilterValue }[] = [
  { label: 'All',         value: 'ALL'         },
  { label: 'Assigned',    value: 'ASSIGNED'    },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed',   value: 'COMPLETED'   },
];

export const MyAssignmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Job[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterValue>('ALL');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await jobService.getMyAssignments();
        setAssignments(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch assignments:', err);
        setError('Failed to load your assignments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const filtered = activeFilter === 'ALL'
    ? assignments
    : assignments.filter(j => j.status === activeFilter);

  const counts = {
    ASSIGNED:    assignments.filter(j => j.status === 'ASSIGNED').length,
    IN_PROGRESS: assignments.filter(j => j.status === 'IN_PROGRESS').length,
    COMPLETED:   assignments.filter(j => j.status === 'COMPLETED').length,
  };

  const handleAction = (job: Job) => {
    navigate(`/worker/job/${job.id}`);
  };

  if (loading) {
    return (
      <WorkerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Loading your assignments...</p>
        </div>
      </WorkerLayout>
    );
  }

  if (error) {
    return (
      <WorkerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-500 max-w-xs mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-xl"
          >
            Retry
          </button>
        </div>
      </WorkerLayout>
    );
  }

  return (
    <WorkerLayout>
      <PageHeader
        title="My Assignments"
        subtitle="All jobs assigned to you"
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Assigned"    value={counts.ASSIGNED}    accent="warning" />
        <StatCard label="In Progress" value={counts.IN_PROGRESS} accent="warning" />
        <StatCard label="Completed"   value={counts.COMPLETED}   accent="success" />
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {FILTER_TABS.map(tab => {
          const count = tab.value === 'ALL'
            ? assignments.length
            : assignments.filter(j => j.status === tab.value).length;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                ${activeFilter === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] text-gray-400">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Assignment list ── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="💼"
          title="No jobs here"
          description={activeFilter === 'ALL' ? "Jobs you're assigned to will appear here." : "No jobs match this filter."}
          action={{ label: 'Find Jobs', onClick: () => navigate('/worker/available-jobs') }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(job => (
            <AssignmentCard
              key={job.id}
              job={job}
              onAction={handleAction}
              onViewDetail={j => navigate(`/worker/job/${j.id}`)}
            />
          ))}
        </div>
      )}
    </WorkerLayout>
  );
};