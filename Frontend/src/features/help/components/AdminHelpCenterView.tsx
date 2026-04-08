import { cn } from '@/shared/utils/cn';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquareWarning,
  RefreshCcw,
  Search,
  ShieldCheck,
  Ticket,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { helpService } from '../api/helpService';
import type { HelpTicket } from '../types';

const statusClasses: Record<string, string> = {
  OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
};

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

type FilterStatus = 'OPEN' | 'RESOLVED' | 'REJECTED' | 'ALL';

export const AdminHelpCenterView = () => {
  const [tickets, setTickets] = useState<HelpTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('OPEN');
  const [selected, setSelected] = useState<HelpTicket | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
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
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredTickets = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatus =
        filterStatus === 'ALL' ? true : ticket.status === filterStatus;

      const searchable = [
        ticket.ticketNumber,
        ticket.subject,
        ticket.createdByUser.name,
        ticket.createdByUser.email,
        ticket.reservationId,
        ticket.workerId,
        ticket.organisationId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !searchTerm || searchable.includes(searchTerm);
      return matchesStatus && matchesSearch;
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

  const syncSelected = (updated: HelpTicket) => {
    setTickets((current) =>
      current.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
    );
    setSelected(updated);
  };

  const handleResolve = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const updated = await helpService.resolveTicket(
        selected.id,
        resolutionNote.trim() || undefined,
      );
      syncSelected(updated);
      setResolutionNote('');
      setToast({ ok: true, msg: `${updated.ticketNumber} resolved.` });
    } catch (error) {
      console.error('Failed to resolve help ticket:', error);
      setToast({ ok: false, msg: 'Could not resolve the ticket.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      const updated = await helpService.rejectTicket(
        selected.id,
        rejectionReason.trim(),
      );
      syncSelected(updated);
      setRejectionReason('');
      setToast({ ok: true, msg: `${updated.ticketNumber} rejected.` });
    } catch (error) {
      console.error('Failed to reject help ticket:', error);
      setToast({ ok: false, msg: 'Could not reject the ticket.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div
          className={cn(
            'fixed right-5 top-5 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold shadow-xl',
            toast.ok ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white',
          )}
        >
          {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      <section className="rounded-[2rem] border border-border bg-background p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-container px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Queue
            </div>
            <h1 className="mt-4 font-headline text-3xl font-bold text-foreground">
              Help Center
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Review incoming support tickets, inspect linked reservation or profile
              IDs, and resolve or reject requests from one admin workspace.
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
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
              Open
            </p>
            <p className="mt-3 text-3xl font-black text-foreground">{metrics.open}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-container/40 p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
              Resolved
            </p>
            <p className="mt-3 text-3xl font-black text-foreground">{metrics.resolved}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-container/40 p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
              Rejected
            </p>
            <p className="mt-3 text-3xl font-black text-foreground">{metrics.rejected}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                  {status === 'ALL'
                    ? 'All'
                    : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tickets or linked IDs"
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground outline-none transition-colors focus:border-foreground md:w-72"
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-container/30">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">Loading admin queue...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-container/30 px-8 text-center">
                <MessageSquareWarning className="h-10 w-10 text-muted-foreground/40" />
                <h3 className="mt-4 text-lg font-bold text-foreground">No tickets in this view</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try another status filter or search term.
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelected(ticket)}
                  className={cn(
                    'w-full rounded-[1.5rem] border p-5 text-left transition-all hover:border-foreground/10 hover:shadow-sm',
                    selected?.id === ticket.id
                      ? 'border-foreground bg-surface-container/30'
                      : 'border-border bg-background',
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
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
                      <h3 className="mt-3 text-lg font-bold text-foreground">{ticket.subject}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{ticket.message}</p>
                    </div>
                    <Ticket className="h-5 w-5 shrink-0 text-muted-foreground/50" />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
                    <span>{ticket.createdByUser.name ?? ticket.createdByUser.email}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
          {!selected ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-container/30 px-8 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-bold text-foreground">Select a ticket</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Choose any request from the queue to inspect sender details, linked IDs,
                and the resolve or reject actions.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-foreground px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-background">
                      {selected.ticketNumber}
                    </span>
                    <span
                      className={cn(
                        'rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]',
                        statusClasses[selected.status],
                      )}
                    >
                      {selected.status}
                    </span>
                  </div>
                  <h2 className="mt-3 font-headline text-2xl font-bold text-foreground">
                    {selected.subject}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {selected.message}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-surface-container/40 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                    Sender
                  </p>
                  <p className="mt-2 text-sm font-bold text-foreground">
                    {selected.createdByUser.name ?? 'Unnamed user'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{selected.createdByUser.email}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {selected.createdByUser.role}
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-container/40 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                    Raised On
                  </p>
                  <p className="mt-2 text-sm font-bold text-foreground">{formatDate(selected.createdAt)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last update: {formatDate(selected.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                    Job ID
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-foreground">
                    {selected.jobId ?? 'Not linked'}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                    Reservation ID
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-foreground">
                    {selected.reservationId ?? 'Not linked'}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                    Worker ID
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-foreground">
                    {selected.workerId ?? 'Not linked'}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                    Organisation ID
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-foreground">
                    {selected.organisationId ?? 'Not linked'}
                  </p>
                </div>
              </div>

              {selected.job && (
                <div className="rounded-[1.5rem] border border-border bg-surface-container/30 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                    Linked Job
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{selected.job.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {selected.job.category} - {selected.job.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Customer: {selected.job.customer.user.name ?? selected.job.customer.user.email}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {selected.job.customer.user.email}
                        {selected.job.customer.user.phone ? ` - ${selected.job.customer.user.phone}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selected.reservation && (
                <div className="rounded-[1.5rem] border border-border bg-surface-container/30 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                    Linked Reservation
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{selected.reservation.product.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Status: {selected.reservation.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {selected.reservation.product.organisation?.businessName ?? 'Organisation unavailable'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Quantity: {selected.reservation.quantity ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selected.status === 'OPEN' ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
                      Resolve Ticket
                    </p>
                    <textarea
                      rows={5}
                      value={resolutionNote}
                      onChange={(event) => setResolutionNote(event.target.value)}
                      placeholder="Share the fix or action taken for this ticket."
                      className="mt-3 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-emerald-400"
                    />
                    <button
                      onClick={() => void handleResolve()}
                      disabled={actionLoading}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Mark Resolved
                    </button>
                  </div>

                  <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-700">
                      Reject Ticket
                    </p>
                    <textarea
                      rows={5}
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      placeholder="Explain why this request cannot be actioned yet."
                      className="mt-3 w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-rose-400"
                    />
                    <button
                      onClick={() => void handleReject()}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      Reject Ticket
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    'rounded-[1.5rem] border p-5 text-sm',
                    selected.status === 'REJECTED'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700',
                  )}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em]">
                    {selected.status === 'REJECTED' ? 'Rejection Note' : 'Resolution Note'}
                  </p>
                  <p className="mt-3 leading-6">
                    {selected.rejectionReason ?? selected.resolutionNote ?? 'No note added.'}
                  </p>
                  {selected.reviewedByUser && (
                    <p className="mt-4 text-xs font-semibold">
                      Reviewed by {selected.reviewedByUser.name ?? selected.reviewedByUser.email} on{' '}
                      {formatDate(selected.reviewedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
