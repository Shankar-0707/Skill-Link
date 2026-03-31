import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Calendar, Shield, Loader2, AlertCircle } from 'lucide-react';
import type { Job } from '../../features/customer/types';
import { jobService } from '../../features/customer/services/jobService';
import { StatusBadge, ProgressStep, Toast } from '../../features/worker/components/ui';
import { WorkerLayout } from '../../features/worker/components/layout/Layout';

const getSteps = (job: Job) => [
  {
    label: 'Job Posted by Customer',
    done: true,
  },
  {
    label: 'Worker Assigned',
    done: !!job.worker,
  },
  {
    label: 'Job Started',
    done: !['POSTED', 'ASSIGNED'].includes(job.status),
  },
  {
    label: 'Job Completed',
    done: job.status === 'COMPLETED',
  },
  {
    label: 'Payment Released',
    done: job.escrow?.status === 'RELEASED',
  },
];

export const WorkerJobDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [job, setJob]               = useState<Job | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]           = useState('');

  const fetchJob = async (jobId: string) => {
    try {
      setLoading(true);
      const data = await jobService.getJobById(jobId);
      setJob(data);
    } catch (err) {
      console.error('Failed to fetch job details:', err);
      setError('Could not find this job or you do not have access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchJob(id);
  }, [id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleStart = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      const updated = await jobService.startJob(id);
      setJob(updated);
      showToast('Job started! The customer has been notified.');
    } catch (err) {
      showToast('Failed to start job. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      const updated = await jobService.completeJob(id);
      setJob(updated);
      showToast('Job marked complete. Awaiting customer confirmation.');
    } catch (err) {
      showToast('Failed to mark job complete.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <WorkerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Loading job details...</p>
        </div>
      </WorkerLayout>
    );
  }

  if (error || !job) {
    return (
      <WorkerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-500 max-w-xs mb-6">{error || 'We could not load the details for this job.'}</p>
          <button
            onClick={() => navigate('/worker/my-assignments')}
            className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-xl"
          >
            Back to My Work
          </button>
        </div>
      </WorkerLayout>
    );
  }

  const steps = getSteps(job);

  const isPosted      = job.status === 'POSTED';
  const isAssigned    = job.status === 'ASSIGNED';
  const isInProgress  = job.status === 'IN_PROGRESS';
  const isCompleted   = job.status === 'COMPLETED';

  return (
    <WorkerLayout>
      <div className="max-w-2xl mx-auto">

        {/* Toast notification */}
        {toast && <Toast message={toast} />}

        {/* Back */}
        <button
          onClick={() => navigate('/worker/my-assignments')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Work
        </button>

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {job.category}
            </span>
            <StatusBadge status={job.status} />
          </div>
          <h1
            className="font-bold text-2xl text-gray-900 leading-snug"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {job.title}
          </h1>
        </div>

        {/* ── Meta pills ── */}
        <div className="flex flex-wrap gap-3 mb-6">
          {job.budget && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
              <IndianRupee className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-900">
                {job.budget.toLocaleString()}
              </span>
            </div>
          )}
          {job.scheduledAt && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm text-gray-700">
                {new Date(job.scheduledAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
            </div>
          )}
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
            <span className="text-sm text-gray-400">
              Posted {new Date(job.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short',
              })}
            </span>
          </div>
        </div>

        {/* ── Description ── */}
        <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Job Description</p>
          <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
        </div>

        {/* ── Escrow status ── */}
        {job.escrow && (
          <div
            className={`p-4 border rounded-xl mb-6
              ${job.escrow.status === 'RELEASED'
                ? 'bg-green-50 border-green-200'
                : 'bg-amber-50 border-amber-200'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield
                  className={`w-4 h-4 flex-shrink-0
                    ${job.escrow.status === 'RELEASED' ? 'text-green-600' : 'text-amber-600'}`}
                />
                <div>
                  <p
                    className={`text-xs font-bold
                      ${job.escrow.status === 'RELEASED' ? 'text-green-700' : 'text-amber-700'}`}
                  >
                    Payment {job.escrow.status === 'RELEASED' ? 'Released to You' : 'Secured in Escrow'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {job.escrow.status === 'HELD'
                      ? 'Funds are locked until the customer confirms your work is complete.'
                      : 'Payment has been deposited to your account.'}
                  </p>
                </div>
              </div>
              <span
                className={`font-bold text-sm flex-shrink-0
                  ${job.escrow.status === 'RELEASED' ? 'text-green-700' : 'text-amber-700'}`}
              >
                ₹{job.escrow.amount.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* ── Progress timeline ── */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl mb-6 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Job Progress</p>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <ProgressStep key={i} label={step.label} done={step.done} index={i} />
            ))}
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="sticky bottom-6">
          {isPosted && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center shadow-sm">
              <p className="text-sm font-semibold text-blue-700">This job is open</p>
              <p className="text-xs text-blue-500 mt-1">
                The customer needs to assign you before you can begin.
              </p>
            </div>
          )}

          {isAssigned && (
            <button
              onClick={handleStart}
              disabled={actionLoading}
              className="w-full py-4 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '▶ Start This Job'}
            </button>
          )}

          {isInProgress && (
            <button
              onClick={handleComplete}
              disabled={actionLoading}
              className="w-full py-4 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '✓ Mark as Completed'}
            </button>
          )}

          {isCompleted && job.escrow?.status !== 'RELEASED' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center shadow-sm">
              <p className="text-sm font-semibold text-green-700">✓ Job marked complete</p>
              <p className="text-xs text-gray-400 mt-1">
                Waiting for the customer to confirm. Payment releases automatically on their confirmation.
              </p>
            </div>
          )}

          {isCompleted && job.escrow?.status === 'RELEASED' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center shadow-md">
              <p className="text-2xl mb-2">💰</p>
              <p className="text-sm font-semibold text-green-700">Payment received</p>
              <p className="text-xs text-gray-400 mt-1">
                ₹{job.escrow.amount.toLocaleString()} has been credited to your account.
              </p>
            </div>
          )}
        </div>

      </div>
    </WorkerLayout>
  );
};