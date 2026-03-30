import React from 'react';
import { Calendar, IndianRupee, ChevronRight, User } from 'lucide-react';
import type { Job } from '../types';
import { StatusBadge } from '../components/ui';

// ── Job Card (My Jobs list) ───────────────────────────────────────────────────

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => (
  <div
    className="bg-background border border-border rounded-xl p-5 hover:shadow-sm hover:border-outline transition-all cursor-pointer group"
    onClick={() => onClick(job)}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        {/* Category tag */}
        <span className="inline-block text-[10px] font-label font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          {job.category}
        </span>
        <h3 className="font-headline font-semibold text-foreground text-base leading-snug line-clamp-2 mb-3">
          {job.title}
        </h3>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={job.status} />

          {job.budget && (
            <div className="flex items-center gap-1 text-xs font-body text-muted-foreground">
              <IndianRupee className="w-3 h-3" />
              <span>{job.budget.toLocaleString()}</span>
            </div>
          )}

          {job.scheduledAt && (
            <div className="flex items-center gap-1 text-xs font-body text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{new Date(job.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}

          {job.worker && (
            <div className="flex items-center gap-1 text-xs font-body text-muted-foreground">
              <User className="w-3 h-3" />
              <span>Worker assigned</span>
            </div>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
    </div>

    {/* Escrow bar if held */}
    {job.escrow?.status === 'HELD' && (
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs font-label text-muted-foreground">Escrow held</span>
        <span className="text-xs font-label font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
          ₹{job.escrow.amount.toLocaleString()} locked
        </span>
      </div>
    )}
  </div>
);

// ── Job Action Button ─────────────────────────────────────────────────────────
// Status-driven CTA rendered on Job Detail page

interface JobActionButtonProps {
  status: Job['status'];
  isCustomer: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  onEdit?: () => void;
  onAssign?: () => void;
}

export const JobActionButton: React.FC<JobActionButtonProps> = ({
  status, isCustomer, onCancel, onConfirm, onEdit, onAssign,
}) => {
  if (isCustomer) {
    if (status === 'POSTED') return (
      <div className="flex gap-3">
        <button onClick={onEdit}
          className="flex-1 px-5 py-2.5 border border-border text-sm font-label font-semibold rounded-xl hover:bg-surface-container transition-colors">
          Edit Job
        </button>
        <button onClick={onAssign}
          className="flex-1 px-5 py-2.5 bg-foreground text-background text-sm font-label font-semibold rounded-xl hover:opacity-90 transition-opacity">
          Assign Worker
        </button>
        <button onClick={onCancel}
          className="px-4 py-2.5 border border-destructive text-destructive text-sm font-label font-semibold rounded-xl hover:bg-red-50 transition-colors">
          Cancel
        </button>
      </div>
    );
    if (status === 'COMPLETED') return (
      <button onClick={onConfirm}
        className="w-full px-5 py-3 bg-green-600 text-white text-sm font-label font-semibold rounded-xl hover:bg-green-700 transition-colors">
        ✓ Confirm Completion & Release Payment
      </button>
    );
  }
  return null;
};