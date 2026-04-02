import React from 'react';
import type { JobStatus } from '../../types/index';

// ── Status Badge ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<JobStatus, { label: string; classes: string }> = {
  POSTED:      { label: 'Open',        classes: 'bg-blue-50 text-blue-700 border border-blue-200'       },
  ASSIGNED:    { label: 'Assigned',    classes: 'bg-amber-50 text-amber-700 border border-amber-200'    },
  IN_PROGRESS: { label: 'In Progress', classes: 'bg-violet-50 text-violet-700 border border-violet-200' },
  COMPLETED:   { label: 'Completed',   classes: 'bg-green-50 text-green-700 border border-green-200'    },
  CANCELLED:   { label: 'Cancelled',   classes: 'bg-surface-container text-muted-foreground border border-border' },
};

export const StatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  const { label, classes } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-label font-semibold ${classes}`}>
      {label}
    </span>
  );
};

// ── Category Pill ─────────────────────────────────────────────────────────────

interface CategoryPillProps {
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-label font-medium transition-all duration-150 whitespace-nowrap
      ${active
        ? 'bg-foreground text-background shadow-sm'
        : 'bg-background border border-border text-foreground hover:border-outline hover:bg-surface-container'
      }`}
  >
    <span>{icon}</span>
    {label}
  </button>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'default' | 'success' | 'warning' | 'primary';
}

const ACCENT_CLASSES = {
  default: 'text-foreground',
  success: 'text-green-600',
  warning: 'text-amber-600',
  primary: 'text-foreground',
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, accent = 'default' }) => (
  <div className="bg-background border border-border rounded-xl p-5 flex flex-col gap-1">
    <p className="text-xs font-label text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className={`text-2xl font-headline font-bold ${ACCENT_CLASSES[accent]}`}>{value}</p>
    {sub && <p className="text-xs font-body text-muted-foreground">{sub}</p>}
  </div>
);

// ── Section Header ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onClick: () => void };
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-5">
    <h2 className="font-headline font-bold text-lg text-foreground">{title}</h2>
    {action && (
      <button
        onClick={action.onClick}
        className="text-sm font-label font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        {action.label}
        <span className="text-base">→</span>
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
    <span className="text-4xl mb-4">{icon}</span>
    <h3 className="font-headline font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm font-body text-muted-foreground max-w-xs mb-6">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-5 py-2.5 bg-foreground text-background text-sm font-label font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        {action.label}
      </button>
    )}
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
      <h1 className="font-headline font-bold text-3xl text-foreground leading-tight">{title}</h1>
      {subtitle && <p className="text-muted-foreground font-body mt-1">{subtitle}</p>}
    </div>
    {action && (
      <button
        onClick={action.onClick}
        className="px-5 py-2.5 bg-foreground text-background text-sm font-label font-semibold rounded-xl hover:opacity-90 transition-opacity"
      >
        {action.label}
      </button>
    )}
  </div>
);