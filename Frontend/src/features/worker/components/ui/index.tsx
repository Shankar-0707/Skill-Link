import React from 'react';
import type { JobStatus } from '../../../customer/types';

// ── Status Badge ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<JobStatus, { label: string; classes: string }> = {
  POSTED:      { label: 'Open',        classes: 'bg-blue-50 text-blue-700 border border-blue-200'         },
  ASSIGNED:    { label: 'Assigned',    classes: 'bg-amber-50 text-amber-700 border border-amber-200'      },
  IN_PROGRESS: { label: 'In Progress', classes: 'bg-violet-50 text-violet-700 border border-violet-200'   },
  COMPLETED:   { label: 'Completed',   classes: 'bg-green-50 text-green-700 border border-green-200'      },
  CANCELLED:   { label: 'Cancelled',   classes: 'bg-gray-100 text-gray-500 border border-gray-200'        },
};

export const StatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  const { label, classes } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'default' | 'success' | 'warning';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, accent = 'default' }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5">
    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-2xl font-bold
      ${accent === 'success' ? 'text-green-600' : accent === 'warning' ? 'text-amber-600' : 'text-gray-900'}`}
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      {value}
    </p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

// ── Page Header ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-8">
    <div>
      <h1 className="font-bold text-3xl text-gray-900 leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
        {title}
      </h1>
      {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
    </div>
    {action && (
      <button
        onClick={action.onClick}
        className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
      >
        {action.label}
      </button>
    )}
  </div>
);

// ── Section Header ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onClick: () => void };
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-bold text-base text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
      {title}
    </h2>
    {action && (
      <button
        onClick={action.onClick}
        className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-4xl mb-3">{icon}</span>
    <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
      {title}
    </h3>
    <p className="text-sm text-gray-500 max-w-xs mb-5">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        {action.label}
      </button>
    )}
  </div>
);

// ── KYC Banner ────────────────────────────────────────────────────────────────
// Shown on worker dashboard when KYC is not verified

interface KycBannerProps {
  status: 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  onAction: () => void;
}

const KYC_CONFIG = {
  NOT_STARTED: {
    icon: '⚠️',
    title: 'KYC Required',
    message: 'Complete verification to get hired by customers.',
    actionLabel: 'Start Verification',
    classes: 'bg-amber-50 border-amber-200',
    titleClass: 'text-amber-700',
    msgClass: 'text-amber-600',
    btnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  PENDING: {
    icon: '🕐',
    title: 'KYC Under Review',
    message: 'Your documents are being reviewed. Usually takes 24–48 hrs.',
    actionLabel: 'Check Status',
    classes: 'bg-blue-50 border-blue-200',
    titleClass: 'text-blue-700',
    msgClass: 'text-blue-600',
    btnClass: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  REJECTED: {
    icon: '❌',
    title: 'KYC Rejected',
    message: 'Your verification was rejected. Please resubmit your documents.',
    actionLabel: 'Resubmit',
    classes: 'bg-red-50 border-red-200',
    titleClass: 'text-red-700',
    msgClass: 'text-red-600',
    btnClass: 'bg-red-500 hover:bg-red-600 text-white',
  },
  VERIFIED: null,
};

export const KycBanner: React.FC<KycBannerProps> = ({ status, onAction }) => {
  const cfg = KYC_CONFIG[status];
  if (!cfg) return null;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border rounded-xl ${cfg.classes}`}>
      <span className="text-xl flex-shrink-0">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold ${cfg.titleClass}`}>{cfg.title}</p>
        <p className={`text-xs ${cfg.msgClass}`}>{cfg.message}</p>
      </div>
      <button
        onClick={onAction}
        className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${cfg.btnClass}`}
      >
        {cfg.actionLabel}
      </button>
    </div>
  );
};

// ── Skills Banner ─────────────────────────────────────────────────────────────
// Shown when KYC is verified but no skills are listed

export const SkillsBanner: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-violet-200 bg-violet-50 rounded-xl">
      <span className="text-xl flex-shrink-0">⚡</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-violet-700">Skills Needed</p>
        <p className="text-xs text-violet-600">List your skills in settings to start seeing jobs that match your expertise.</p>
      </div>
      <button
        onClick={onAction}
        className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-500 hover:bg-violet-600 text-white transition-colors"
      >
        Add Skills
      </button>
    </div>
  );
};

// ── Progress Step ─────────────────────────────────────────────────────────────
// Used in the job detail timeline

interface ProgressStepProps {
  label: string;
  done: boolean;
  index: number;
}

export const ProgressStep: React.FC<ProgressStepProps> = ({ label, done, index }) => (
  <div className="flex items-center gap-3 py-2">
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border text-sm transition-all
        ${done ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-300'}`}
    >
      {done ? '✓' : <span className="text-xs">{index + 1}</span>}
    </div>
    <p className={`text-sm ${done ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
      {label}
    </p>
  </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ message }) => (
  <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
    {message}
  </div>
);