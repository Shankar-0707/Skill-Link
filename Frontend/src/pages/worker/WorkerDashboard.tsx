import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { workerService } from '../../features/customer/services/workerService';
import { jobService } from '../../features/customer/services/jobService';
import type { Worker, Job } from '../../features/customer/types';
import { StatCard, SectionHeader, KycBanner } from '../../features/worker/components/ui';
import { DashboardJobRow } from '../../features/worker/components/jobs/JobsCard';
import { WorkerLayout } from '../../features/worker/components/layout/Layout';

const QUICK_ACTIONS = [
  { icon: '🔍', label: 'Browse Open Jobs',  sub: 'Find new work nearby',   path: '/worker/available-jobs'  },
  { icon: '📊', label: 'View Earnings',      sub: 'Track your income',      path: '/worker/earnings' },
  { icon: '📅', label: 'My Schedule',        sub: 'Upcoming assignments',   path: '/worker/schedule' },
];

export const WorkerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Worker | null>(null);
  const [assignments, setAssignments] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileData, assignmentsData] = await Promise.all([
          workerService.getMe(),
          jobService.getMyAssignments(),
        ]);
        setProfile(profileData);
        setAssignments(assignmentsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <WorkerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </WorkerLayout>
    );
  }

  if (error || !profile) {
    return (
      <WorkerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-500 max-w-xs mb-6">{error || 'We could not load your profile.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </WorkerLayout>
    );
  }

  const activeJobs    = assignments.filter(j => ['ASSIGNED', 'IN_PROGRESS'].includes(j.status));
  const completedJobs = assignments.filter(j => j.status === 'COMPLETED');
  const totalEarned   = assignments
    .filter(j => j.status === 'COMPLETED' && j.escrow?.status === 'RELEASED')
    .reduce((sum, j) => sum + (j.budget || 0), 0);

  const firstName = profile.user.name?.split(' ')[0] ?? 'Worker';

  return (
    <WorkerLayout>
      {/* ── Greeting + KYC Banner ── */}
      <div className="flex items-start justify-between mb-8 gap-6">
        <div>
          <p className="text-sm text-gray-400 mb-1">Good morning 👋</p>
          <h1
            className="font-bold text-3xl text-gray-900 leading-tight"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {firstName}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Here's what's on your plate today.</p>
        </div>

        {/* KYC banner — only shown if not verified */}
        {profile.kycStatus !== 'VERIFIED' && (
          <div className="flex-shrink-0 max-w-sm w-full">
            <KycBanner
              status={profile.kycStatus}
              onAction={() => navigate('/worker/settings')}
            />
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Jobs"   value={activeJobs.length}                     accent="warning" />
        <StatCard label="Completed"     value={completedJobs.length}                  accent="success" />
        <StatCard label="Total Earned"  value={`₹${totalEarned.toLocaleString()}`}    sub="lifetime"   />
        <StatCard
          label="Rating"
          value={`${profile.ratingAvg.toFixed(1)} ★`}
          sub={`${profile.ratingCount} reviews`}
        />
      </div>

      {/* ── Active Jobs ── */}
      <div className="mb-8">
        <SectionHeader
          title="Active Jobs"
          action={{ label: 'View All →', onClick: () => navigate('/worker/my-assignments') }}
        />

        {activeJobs.length === 0 ? (
          <div className="p-8 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-center">
            <p className="text-2xl mb-2">🎯</p>
            <p className="text-sm font-medium text-gray-700">No active jobs right now</p>
            <p className="text-xs text-gray-400 mt-1">Browse available jobs to get started</p>
            <button
              onClick={() => navigate('/worker/available-jobs')}
              className="mt-4 px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeJobs.map(job => (
              <DashboardJobRow
                key={job.id}
                job={job}
                onStart={() => navigate(`/worker/job/${job.id}`)}
                onComplete={() => navigate(`/worker/job/${job.id}`)}
                onViewDetail={() => navigate(`/worker/job/${job.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.path}
              onClick={() => navigate(a.path)}
              className="p-4 bg-white border border-gray-200 rounded-xl text-left hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <span className="text-2xl block mb-2">{a.icon}</span>
              <p className="font-semibold text-sm text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {a.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{a.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </WorkerLayout>
  );
};