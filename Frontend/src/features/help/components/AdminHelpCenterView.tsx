import { cn } from '@/shared/utils/cn';
import {
  AlertCircle,
  Clock3,
  Loader2,
  MessageSquareWarning,
  RefreshCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { helpService } from '../api/helpService';
import type { HelpTicket } from '../types';

const statusClasses: Record<string, string> = {
  OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
};

type FilterStatus = 'OPEN' | 'RESOLVED' | 'REJECTED' | 'ALL';

const formatDate = (value?: string | null) => {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
};

const formatRole = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase();

const getLinkedHeading = (ticket: HelpTicket) => {
  if (ticket.job) return ticket.job.title;
  if (ticket.reservation) return ticket.reservation.product.name;
  return 'General support';
};

export const AdminHelpCenterView = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<HelpTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('OPEN');
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await helpService.listAdminTickets({ all: true, limit: 100 });
      setTickets(response.items ?? []);
    } catch (error) {
      console.error('Failed to load help tickets:', error);
      setToast({ ok: false, msg: 'Unable to load help tickets.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredTickets = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus = filterStatus === 'ALL' || ticket.status === filterStatus;
      const haystack = [
        ticket.ticketNumber,
        ticket.subject,
        ticket.message,
        ticket.createdByUser.name,
        ticket.createdByUser.email,
        ticket.job?.title,
        ticket.job?.worker?.user.name,
        ticket.reservation?.product.name,
        ticket.reservation?.product.organisation?.businessName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && (!searchTerm || haystack.includes(searchTerm));
    });
  }, [filterStatus, search, tickets]);

  const metrics = useMemo(
    () => ({
      open: tickets.filter((ticket) => ticket.status === 'OPEN').length,
      resolved: tickets.filter((ticket) => ticket.status === 'RESOLVED').length,
      rejected: tickets.filter((ticket) => ticket.status === 'REJECTED').length,
    }),
    [tickets],
  );

  return (
    <div className="space-y-8">
      {toast && (
        <div
          className={cn(
            'fixed right-5 top-5 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold shadow-xl',
            toast.ok ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white',
          )}
        >
          <AlertCircle className="h-4 w-4" />
          {toast.msg}
        </div>
      )}

      <section className="rounded-[2rem] border border-border bg-background p-8 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-container px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Queue
            </div>
            <h1 className="mt-4 font-headline text-3xl font-bold text-foreground">Help Center</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Open a ticket to inspect the full sender, worker, organisation, reservation, and job context on its own page.
            </p>
          </div>

          <button
            onClick={() => void loadTickets()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-container"
          >
            <RefreshCcw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh Queue
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface-container/40 p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Open</p>
            <p className="mt-3 text-3xl font-black text-foreground">{metrics.open}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-container/40 p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Resolved</p>
            <p className="mt-3 text-3xl font-black text-foreground">{metrics.resolved}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-container/40 p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Rejected</p>
            <p className="mt-3 text-3xl font-black text-foreground">{metrics.rejected}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex rounded-2xl bg-surface-container p-1">
            {(['OPEN', 'RESOLVED', 'REJECTED', 'ALL'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  'rounded-[1rem] px-4 py-2 text-sm font-bold transition-all',
                  filterStatus === status
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {status === 'ALL' ? 'All' : formatRole(status)}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tickets, people, or linked records"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground outline-none transition-colors focus:border-foreground lg:w-96"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex min-h-[480px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-container/30">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">Loading admin queue...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex min-h-[480px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-container/30 px-8 text-center">
              <MessageSquareWarning className="h-10 w-10 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-bold text-foreground">No tickets in this view</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try another status or search term.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => navigate(`/admin/help/${ticket.id}`)}
                className="w-full rounded-[1.5rem] border border-border bg-background p-5 text-left transition-all hover:border-foreground/10 hover:bg-surface-container/20 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-foreground px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-background">
                        {ticket.ticketNumber}
                      </span>
                      <span
                        className={cn(
                          'rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]',
                          statusClasses[ticket.status],
                        )}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <h3 className="mt-4 truncate text-lg font-bold text-foreground">{ticket.subject}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{ticket.message}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-foreground">
                        {ticket.createdByUser.name ?? ticket.createdByUser.email}
                      </span>
                      <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-foreground">
                        {getLinkedHeading(ticket)}
                      </span>
                      <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-foreground">
                        {formatRole(ticket.createdByUser.role)}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-xs font-semibold text-muted-foreground">
                    <div className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDate(ticket.createdAt)}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
