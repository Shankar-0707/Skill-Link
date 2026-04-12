import { cn } from '@/shared/utils/cn';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  ShoppingBag,
  Ticket,
  UserRound,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

const formatRole = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase();

const getLinkedHeading = (ticket: HelpTicket) => {
  if (ticket.job) return ticket.job.title;
  if (ticket.reservation) return ticket.reservation.product.name;
  return 'General support';
};

export const AdminHelpTicketDetailView = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<HelpTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const loadTicket = useCallback(async () => {
    if (!ticketId) {
      navigate('/admin/help', { replace: true });
      return;
    }

    setLoading(true);
    try {
      const response = await helpService.listAdminTickets({ all: true, limit: 100 });
      const found = (response.items ?? []).find((item) => item.id === ticketId) ?? null;
      setTicket(found);
      if (!found) {
        setToast({ ok: false, msg: 'Ticket not found in admin queue.' });
      }
    } catch (error) {
      console.error('Failed to load help ticket:', error);
      setToast({ ok: false, msg: 'Unable to load this ticket right now.' });
    } finally {
      setLoading(false);
    }
  }, [navigate, ticketId]);

  useEffect(() => {
    void loadTicket();
  }, [loadTicket]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const linkedWorker =
    ticket?.job?.worker ??
    (ticket?.worker
      ? {
          id: ticket.worker.id,
          user: ticket.worker.user,
        }
      : null);

  const linkedOrganisation =
    ticket?.reservation?.product.organisation ??
    (ticket?.organisation
      ? {
          id: ticket.organisation.id,
          businessName: ticket.organisation.businessName,
          user: ticket.organisation.user,
        }
      : null);

  const linkedCustomer =
    ticket?.job?.customer?.user ??
    ticket?.reservation?.customer?.user ??
    null;

  const linkedCustomerPhone =
    linkedCustomer &&
    'phone' in linkedCustomer &&
    typeof linkedCustomer.phone === 'string'
      ? linkedCustomer.phone
      : undefined;

  const handleResolve = async () => {
    if (!ticket) return;
    setActionLoading(true);
    try {
      const updated = await helpService.resolveTicket(
        ticket.id,
        resolutionNote.trim() || undefined,
      );
      setTicket(updated);
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
    if (!ticket || !rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      const updated = await helpService.rejectTicket(ticket.id, rejectionReason.trim());
      setTicket(updated);
      setRejectionReason('');
      setToast({ ok: true, msg: `${updated.ticketNumber} rejected.` });
    } catch (error) {
      console.error('Failed to reject help ticket:', error);
      setToast({ ok: false, msg: 'Could not reject the ticket.' });
    } finally {
      setActionLoading(false);
    }
  };

  const contextType = useMemo(() => {
    if (!ticket) return 'General';
    if (ticket.job) return 'Job';
    if (ticket.reservation) return 'Reservation';
    return 'General';
  }, [ticket]);

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

      <div className="flex items-center justify-between gap-4">
        <Link
          to="/admin/help"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-container"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Queue
        </Link>

        <button
          onClick={() => void loadTicket()}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-container"
        >
          <Loader2 className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh Ticket
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[640px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">Loading ticket details...</p>
        </div>
      ) : !ticket ? (
        <div className="flex min-h-[640px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-background px-8 text-center">
          <Ticket className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-bold text-foreground">Ticket not found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Go back to the queue and open another support case.</p>
        </div>
      ) : (
        <>
          <section className="rounded-[2rem] border border-border bg-background p-8 shadow-sm">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
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
                <h1 className="mt-4 font-headline text-3xl font-bold text-foreground">{ticket.subject}</h1>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">{ticket.message}</p>
              </div>

              <div className="rounded-[1.5rem] border border-border bg-surface-container/20 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Case Snapshot</p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>Type: <span className="font-semibold text-foreground">{contextType}</span></p>
                  <p>Raised {formatDate(ticket.createdAt)}</p>
                  <p>Updated {formatDate(ticket.updatedAt)}</p>
                  {ticket.reviewedAt && <p>Reviewed {formatDate(ticket.reviewedAt)}</p>}
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <section className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
                <h2 className="text-lg font-bold text-foreground">People Involved</h2>
                <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
                  <div className="rounded-[1.5rem] border border-border bg-surface-container/20 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-background p-3">
                        <UserRound className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Sender</p>
                        <p className="mt-1 text-base font-bold text-foreground">
                          {ticket.createdByUser.name ?? 'Unnamed user'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                      <p className="inline-flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {ticket.createdByUser.email}
                      </p>
                      {ticket.createdByUser.phone && (
                        <p className="inline-flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {ticket.createdByUser.phone}
                        </p>
                      )}
                      <p className="font-semibold text-foreground">{formatRole(ticket.createdByUser.role)}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border bg-surface-container/20 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-background p-3">
                        <UserRound className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Customer</p>
                        <p className="mt-1 text-base font-bold text-foreground">
                          {linkedCustomer?.name ?? linkedCustomer?.email ?? 'No customer linked'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                      <p>{linkedCustomer?.email ?? 'Email unavailable'}</p>
                      {linkedCustomerPhone && <p>{linkedCustomerPhone}</p>}
                      {ticket.job?.title && <p>From job: {ticket.job.title}</p>}
                      {ticket.reservation?.product.name && <p>From reservation: {ticket.reservation.product.name}</p>}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border bg-surface-container/20 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-background p-3">
                        <Briefcase className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Worker</p>
                        <p className="mt-1 text-base font-bold text-foreground">
                          {linkedWorker?.user.name ?? linkedWorker?.user.email ?? 'No worker linked'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                      <p>{linkedWorker?.user.email ?? 'Email unavailable'}</p>
                      {linkedWorker?.user.phone && <p>{linkedWorker.user.phone}</p>}
                      {ticket.job?.title && <p>From job: {ticket.job.title}</p>}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border bg-surface-container/20 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-background p-3">
                        <Building2 className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Organisation</p>
                        <p className="mt-1 text-base font-bold text-foreground">
                          {linkedOrganisation?.businessName ?? 'No organisation linked'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                      {linkedOrganisation && 'user' in linkedOrganisation && linkedOrganisation.user?.email && (
                        <p>{linkedOrganisation.user.email}</p>
                      )}
                      {linkedOrganisation && 'user' in linkedOrganisation && linkedOrganisation.user?.phone && (
                        <p>{linkedOrganisation.user.phone}</p>
                      )}
                      {ticket.reservation?.product.name && <p>From reservation: {ticket.reservation.product.name}</p>}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
                <h2 className="text-lg font-bold text-foreground">Linked Context</h2>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border bg-surface-container/20 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Reference</p>
                    <p className="mt-2 text-sm font-bold text-foreground">{ticket.ticketNumber}</p>
                    {ticket.jobId && <p className="mt-3 break-all text-sm text-muted-foreground">Job ID: {ticket.jobId}</p>}
                    {ticket.reservationId && (
                      <p className="mt-2 break-all text-sm text-muted-foreground">Reservation ID: {ticket.reservationId}</p>
                    )}
                  </div>

                  <div className="rounded-[1.5rem] border border-border bg-surface-container/20 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Linked Record</p>
                    <p className="mt-2 text-sm font-bold text-foreground">{getLinkedHeading(ticket)}</p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      This ticket is attached to a {contextType.toLowerCase()} so admin can investigate it with full context.
                    </p>
                  </div>
                </div>

                {ticket.job && (
                  <div className="mt-5 rounded-[1.5rem] border border-border bg-background p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-surface-container p-3">
                        <Briefcase className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Job Details</p>
                        <p className="mt-1 text-lg font-bold text-foreground">{ticket.job.title}</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-4 lg:grid-cols-3">
                      <div className="rounded-2xl bg-surface-container/30 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Category</p>
                        <p className="mt-2 text-sm font-bold text-foreground">{ticket.job.category}</p>
                      </div>
                      <div className="rounded-2xl bg-surface-container/30 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                        <p className="mt-2 text-sm font-bold text-foreground">{ticket.job.status}</p>
                      </div>
                      <div className="rounded-2xl bg-surface-container/30 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Budget</p>
                        <p className="mt-2 text-sm font-bold text-foreground">
                          {ticket.job.budget ? `Rs ${ticket.job.budget}` : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {ticket.reservation && (
                  <div className="mt-5 rounded-[1.5rem] border border-border bg-background p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-surface-container p-3">
                        <ShoppingBag className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Reservation Details</p>
                        <p className="mt-1 text-lg font-bold text-foreground">{ticket.reservation.product.name}</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-4 lg:grid-cols-3">
                      <div className="rounded-2xl bg-surface-container/30 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                        <p className="mt-2 text-sm font-bold text-foreground">{ticket.reservation.status}</p>
                      </div>
                      <div className="rounded-2xl bg-surface-container/30 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Quantity</p>
                        <p className="mt-2 text-sm font-bold text-foreground">{ticket.reservation.quantity ?? 0}</p>
                      </div>
                      <div className="rounded-2xl bg-surface-container/30 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Customer</p>
                        <p className="mt-2 text-sm font-bold text-foreground">
                          {ticket.reservation.customer?.user.name ?? ticket.reservation.customer?.user.email ?? 'Unavailable'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-8">
              {ticket.status === 'OPEN' ? (
                <section className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-foreground">Take Action</h2>

                  <div className="mt-5 space-y-4">
                    <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">Resolve Ticket</p>
                      <textarea
                        rows={5}
                        value={resolutionNote}
                        onChange={(event) => setResolutionNote(event.target.value)}
                        placeholder="Share the fix, action taken, or handoff note."
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
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-700">Reject Ticket</p>
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
                </section>
              ) : (
                <section
                  className={cn(
                    'rounded-[2rem] border p-6 shadow-sm',
                    ticket.status === 'REJECTED'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700',
                  )}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em]">
                    {ticket.status === 'REJECTED' ? 'Rejection Note' : 'Resolution Note'}
                  </p>
                  <p className="mt-3 text-sm leading-6">
                    {ticket.rejectionReason ?? ticket.resolutionNote ?? 'No note added.'}
                  </p>
                  {ticket.reviewedByUser && (
                    <p className="mt-4 text-xs font-semibold">
                      Reviewed by {ticket.reviewedByUser.name ?? ticket.reviewedByUser.email} on {formatDate(ticket.reviewedAt)}
                    </p>
                  )}
                </section>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
