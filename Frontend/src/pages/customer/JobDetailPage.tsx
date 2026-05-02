import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Calendar, Shield, Loader2 } from 'lucide-react';
import type { Job, Worker } from '../../features/customer/types';
import { StatusBadge, SectionHeader, EmptyState } from '../../features/customer/components/ui';
import { JobActionButton } from '../../features/customer/worker/JobCard';
import { WorkerRow } from '../../features/customer/worker/Workercard';
import { Layout } from '../../features/customer/components/layout/Layout';
import { jobService } from '../../features/customer/services/jobService';
import { workerService } from '../../features/customer/services/workerService';

export const JobDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  
  const [job, setJob] = useState<Job | null>(location.state as Job || null);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [loading, setLoading] = useState(!job);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = async (id: string) => {
    try {
      setRefreshing(true);
      const data = await jobService.getJobById(id);
      setJob(data);
    } catch (err) {
      console.error('Failed to refresh job:', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchWorkers = async (category?: string) => {
    try {
      const data = await workerService.getAllWorkers();
      
      // Normalization helper (e.g., "Electrician" matches "Electricians")
      const normalize = (s: string) => s.toLowerCase().trim().replace(/s$/, '');
      
      let filtered = data;
      
      // 1. Filter by relevance (if category exists)
      if (category) {
        const normCat = normalize(category);
        filtered = data.filter(w => 
          w.skills.some(skill => normalize(skill).includes(normCat) || normCat.includes(normalize(skill)))
        );
      }

      // 2. Sort by availability and verification status
      const sorted = [...filtered].sort((a, b) => {
        // Verified + Available first
        if (a.kycStatus === 'VERIFIED' && a.isAvailable && (b.kycStatus !== 'VERIFIED' || !b.isAvailable)) return -1;
        if (b.kycStatus === 'VERIFIED' && b.isAvailable && (a.kycStatus !== 'VERIFIED' || !a.isAvailable)) return 1;
        
        // Then just Verified
        if (a.kycStatus === 'VERIFIED' && b.kycStatus !== 'VERIFIED') return -1;
        if (b.kycStatus === 'VERIFIED' && a.kycStatus !== 'VERIFIED') return 1;
        
        return 0;
      });

      setAvailableWorkers(sorted);
    } catch (err) {
      console.error('Failed to fetch available workers:', err);
    }
  };

  useEffect(() => {
    const jobId = job?.id || id;
    if (jobId) {
      fetchJob(jobId);
    } else {
      setError('Job ID is missing.');
      setLoading(false);
    }
  }, [id, job?.id]);

  useEffect(() => {
    if (job?.category) {
      fetchWorkers(job.category);
    } else if (!loading) {
      fetchWorkers();
    }
  }, [job?.category, loading]);

  const handleConfirm = async () => {
    if (!job) return;
    try {
      setRefreshing(true);
      await jobService.confirmJob(job.id);
      await fetchJob(job.id);
    } catch (err) {
      console.error('Failed to confirm job:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancel = async () => {
    if (!job) return;
    if (!window.confirm('Are you sure you want to cancel this job?')) return;
    try {
      setRefreshing(true);
      await jobService.cancelJob(job.id);
      navigate('/user/my-jobs');
    } catch (err) {
      console.error('Failed to cancel job:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAssign = async (worker: Worker) => {
    if (!job) return;
    if (worker.kycStatus !== 'VERIFIED') {
      alert('This worker must complete KYC verification before they can be assigned to a job.');
      return;
    }
    try {
      setRefreshing(true);
      await jobService.assignWorker(job.id, worker.id);
      setShowAssignPanel(false);
      await fetchJob(job.id);
    } catch (err) {
      console.error('Failed to assign worker:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm font-body text-muted-foreground">Loading job details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <EmptyState
          icon="🔍"
          title="Job Not Found"
          description={error || "We couldn't find the job you're looking for."}
          action={{ label: 'Back to My Jobs', onClick: () => navigate('/user/my-jobs') }}
        />
      </Layout>
    );
  }

  const assignedWorker = job.worker;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/user/my-jobs')}
          className="flex items-center gap-2 text-sm font-label text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Jobs
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-label font-bold text-muted-foreground uppercase tracking-wider">
                {job.category}
              </span>
              <StatusBadge status={job.status} />
              {refreshing && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>
            <h1 className="font-headline font-bold text-2xl text-foreground leading-snug">{job.title}</h1>
          </div>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          {job.budget && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-border rounded-xl">
              <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-label font-semibold text-foreground">₹{job.budget.toLocaleString()}</span>
            </div>
          )}
          {job.scheduledAt && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-border rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-label text-foreground">
                {new Date(job.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-border rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-label text-muted-foreground">
              Posted {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="p-5 bg-surface-container border border-border rounded-xl mb-6">
          <h2 className="text-xs font-label font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</h2>
          <p className="text-sm font-body text-foreground leading-relaxed">{job.description}</p>
        </div>

        {/* Escrow */}
        {job.escrow && (
          <div className={`p-4 border rounded-xl mb-6 flex items-center justify-between
            ${job.escrow.status === 'RELEASED'
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
            }`}>
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${job.escrow.status === 'RELEASED' ? 'text-green-600' : 'text-amber-600'}`} />
              <div className="flex-1">
                <p className={`text-xs font-label font-bold ${job.escrow.status === 'RELEASED' ? 'text-green-700' : 'text-amber-700'}`}>
                  Escrow {job.escrow.status === 'RELEASED' ? 'Released' : 'Held'}
                </p>
                <p className="text-xs font-body text-muted-foreground max-w-md">
                  {job.escrow.status === 'HELD'
                    ? 'Funds are secured. Released when you confirm completion.'
                    : 'Payment has been released to the worker.'}
                </p>
              </div>
            </div>
            <span className={`font-headline font-bold text-sm ${job.escrow.status === 'RELEASED' ? 'text-green-700' : 'text-amber-700'}`}>
              ₹{job.escrow.amount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Assigned Worker */}
        {assignedWorker && (
          <div className="mb-6">
            <SectionHeader title="Assigned Worker" />
            <div className="p-5 bg-background border border-border rounded-xl flex items-center gap-4">
              <div className="relative">
                <img
                  src={assignedWorker.user.profileImage ?? `https://i.pravatar.cc/56?u=${assignedWorker.id}`}
                  alt={assignedWorker.user?.name || 'Worker'}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-background bg-green-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-label font-semibold text-foreground">{assignedWorker.user?.name || 'Assigned Worker'}</h3>
                </div>
                <p className="text-xs font-body text-muted-foreground">Successfully assigned to your request.</p>
                <p className="text-xs font-label text-green-600 mt-0.5">KYC Verified</p>
              </div>
              <button
                disabled
                className="px-4 py-2 border border-border rounded-lg text-xs font-label font-medium opacity-50 cursor-not-allowed"
              >
                In Progress
              </button>
            </div>
          </div>
        )}

        {/* Assign Worker Panel */}
        {showAssignPanel && (
          <div className="mb-6">
            <SectionHeader
              title="Available Workers"
              action={{ label: 'Close', onClick: () => setShowAssignPanel(false) }}
            />
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {availableWorkers.length === 0 ? (
                <p className="text-sm font-body text-muted-foreground text-center py-8 bg-surface-container rounded-xl">No available experts found right now.</p>
              ) : (
                availableWorkers.map(worker => (
                  <WorkerRow
                    key={worker.id}
                    worker={worker}
                    onViewProfile={(w) => handleAssign(w)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <JobActionButton
          status={job.status}
          isCustomer={true}
          onEdit={() => navigate('/user/create-job', { state: job })}
          onAssign={() => setShowAssignPanel(true)}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      </div>
    </Layout>
  );
};