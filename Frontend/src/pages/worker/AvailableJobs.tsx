import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, IndianRupee, SlidersHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../../shared/constants/categories';
import { workerService } from '../../features/customer/services/workerService';
import { jobService } from '../../features/customer/services/jobService';
import type { Worker, Job } from '../../features/customer/types';
import { PageHeader, EmptyState } from '../../features/worker/components/ui';
import { AvailableJobCard } from '../../features/worker/components/jobs/JobsCard';
import { WorkerLayout } from '../../features/worker/components/layout/Layout';

export const AvailableJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs,       setJobs]       = useState<Job[]>([]);
  const [profile,    setProfile]    = useState<Worker | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState('');
  const [maxBudget,  setMaxBudget]  = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [availableJobs, profileData] = await Promise.all([
          jobService.getAvailableJobs(),
          workerService.getMe()
        ]);
        setJobs(availableJobs);
        setProfile(profileData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch available jobs:', err);
        setError('Failed to load available jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = jobs.filter(j => {
    const matchSearch   = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.description.toLowerCase().includes(search.toLowerCase());
    
    // Strict match against worker skills
    const normalize = (cat: string) => cat.toLowerCase().trim().replace(/s$/, '');
    const matchSkill = profile?.skills.some(skill => 
      normalize(j.category) === normalize(skill)
    );
    
    const matchBudget   = !maxBudget || (j.budget ?? 0) <= Number(maxBudget);
    return matchSearch && matchSkill && matchBudget;
  });

  const clearFilters = () => {
    setSearch('');
    setMaxBudget('');
  };

  const hasActiveFilters = search || maxBudget;

  if (loading) {
    return (
      <WorkerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Scanning for available jobs...</p>
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
        title="Available Jobs"
        subtitle={`${jobs.length} open job${jobs.length !== 1 ? 's' : ''} in your area`}
      />

      {/* ── Search + Filter toggle ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        <button
          onClick={() => setShowFilter(p => !p)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all
            ${showFilter
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
            }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Expanded filter panel ── */}
      {showFilter && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mb-5 flex items-center gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Max Budget</p>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="number"
                value={maxBudget}
                onChange={e => setMaxBudget(e.target.value)}
                placeholder="Any"
                className="w-32 pl-7 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Results count ── */}
      <p className="text-xs text-gray-400 mb-4">
        {filtered.length} job{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* ── Job list ── */}
      {!profile || profile.skills.length === 0 ? (
        <EmptyState
          icon="⚡"
          title="Skills mandatory"
          description="Please add your skills in settings to start seeing jobs that match your expertise."
          action={{ label: 'Add Skills', onClick: () => navigate('/worker/settings') }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No jobs match your skill set"
          description={hasActiveFilters ? "Try broadening your search or removing filters." : "We'll notify you when new jobs in your area match your skills."}
          action={hasActiveFilters ? { label: 'Clear Filters', onClick: clearFilters } : undefined}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((job) => (
            <AvailableJobCard
              key={job.id}
              job={job}
              distanceKm={+(0.8).toFixed(1)}
              onClick={(j: Job) => navigate(`/worker/job/${j.id}`)}
            />
          ))}
        </div>
      )}
    </WorkerLayout>
  );
};