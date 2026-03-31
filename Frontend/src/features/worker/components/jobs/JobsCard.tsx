import React from 'react';
import { IndianRupee, Calendar, MapPin } from 'lucide-react';
import type { Job } from '../../../customer/types';
import { StatusBadge } from '../ui';

// ── Available Job Card ────────────────────────────────────────────────────────
// Used on the Find Jobs page — shows open POSTED jobs to the worker

interface AvailableJobCardProps {
  job: Job;
  distanceKm?: number;
  onClick: (job: Job) => void;
}

export const AvailableJobCard: React.FC<AvailableJobCardProps> = ({
  job,
  distanceKm,
  onClick,
}) => (
  <div
    onClick={() => onClick(job)}
    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        {/* Category + date */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {job.category}
          </span>
          <span className="text-gray-200">·</span>
          <span className="text-[10px] text-gray-400">
            Posted {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        <h3
          className="font-semibold text-base text-gray-900 mb-2 leading-snug"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          {job.title}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
          {job.description}
        </p>

        <div className="flex items-center gap-3">
          {distanceKm !== undefined && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />
              <span>{distanceKm} km away</span>
            </div>
          )}
          {job.scheduledAt && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(job.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )}
          <span className="text-xs text-green-600 font-medium">● Open for hire</span>
        </div>
      </div>

      {/* Budget */}
      <div className="text-right flex-shrink-0">
        {job.budget ? (
          <>
            <div className="flex items-center gap-0.5 justify-end">
              <IndianRupee className="w-3.5 h-3.5 text-gray-700" />
              <p
                className="font-bold text-lg text-gray-900"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {job.budget.toLocaleString()}
              </p>
            </div>
            <p className="text-[10px] text-gray-400">budget</p>
          </>
        ) : (
          <p className="text-sm text-gray-400">Negotiable</p>
        )}
      </div>
    </div>

    {/* Footer CTA */}
    <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
      <button
        onClick={e => { e.stopPropagation(); onClick(job); }}
        className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        View Details →
      </button>
    </div>
  </div>
);

// ── Assignment Row Card ───────────────────────────────────────────────────────
// Used on My Assignments page — compact view with inline action button

interface AssignmentCardProps {
  job: Job;
  onAction: (job: Job) => void;
  onViewDetail: (job: Job) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  job,
  onAction,
  onViewDetail,
}) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:border-gray-300 transition-all">
    <div className="flex items-start justify-between gap-4">
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onViewDetail(job)}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {job.category}
          </span>
          <StatusBadge status={job.status} />
        </div>
        <h3
          className="font-semibold text-base text-gray-900 mb-1 truncate"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          {job.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-1 mb-2">{job.description}</p>

        <div className="flex items-center gap-3">
          {job.budget && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <IndianRupee className="w-3 h-3" />
              {job.budget.toLocaleString()}
            </span>
          )}
          {job.scheduledAt && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {new Date(job.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      {/* Status-driven action button */}
      <div className="flex-shrink-0 text-right">
        {job.status === 'ASSIGNED' && (
          <button
            onClick={() => onAction(job)}
            className="px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors"
          >
            ▶ Start Job
          </button>
        )}
        {job.status === 'IN_PROGRESS' && (
          <button
            onClick={() => onAction(job)}
            className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            ✓ Mark Complete
          </button>
        )}
        {job.status === 'COMPLETED' && (
          <div className="text-right">
            <span className="text-xs font-semibold text-green-600">✓ Done</span>
            {job.escrow?.status === 'RELEASED' && (
              <p className="text-[10px] text-gray-400 mt-0.5">Paid</p>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Escrow pill */}
    {job.escrow && (
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {job.escrow.status === 'RELEASED' ? 'Payment released' : 'Payment in escrow'}
        </span>
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border
            ${job.escrow.status === 'RELEASED'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
        >
          ₹{job.escrow.amount.toLocaleString()}
        </span>
      </div>
    )}
  </div>
);

// ── Dashboard Active Job Row ──────────────────────────────────────────────────
// Compact row used on the worker dashboard for quick overview

interface DashboardJobRowProps {
  job: Job;
  onStart: (job: Job) => void;
  onComplete: (job: Job) => void;
  onViewDetail: (job: Job) => void;
}

export const DashboardJobRow: React.FC<DashboardJobRowProps> = ({
  job,
  onStart,
  onComplete,
  onViewDetail,
}) => (
  <div
    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
    onClick={() => onViewDetail(job)}
  >
    {/* Status icon */}
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg
        ${job.status === 'IN_PROGRESS' ? 'bg-violet-50' : 'bg-amber-50'}`}
    >
      {job.status === 'IN_PROGRESS' ? '🔨' : '📋'}
    </div>

    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-sm text-gray-900 truncate">{job.title}</h3>
      <p className="text-xs text-gray-400">
        {job.category}
        {job.budget ? ` · ₹${job.budget.toLocaleString()}` : ''}
      </p>
    </div>

    <div className="flex-shrink-0 text-right">
      <StatusBadge status={job.status} />
      {job.status === 'ASSIGNED' && (
        <button
          onClick={e => { e.stopPropagation(); onStart(job); }}
          className="mt-2 block px-3 py-1 bg-gray-900 text-white text-[10px] font-semibold rounded-lg hover:opacity-90 ml-auto"
        >
          Start Job
        </button>
      )}
      {job.status === 'IN_PROGRESS' && (
        <button
          onClick={e => { e.stopPropagation(); onComplete(job); }}
          className="mt-2 block px-3 py-1 bg-green-600 text-white text-[10px] font-semibold rounded-lg hover:bg-green-700 ml-auto"
        >
          Mark Done
        </button>
      )}
    </div>
  </div>
);