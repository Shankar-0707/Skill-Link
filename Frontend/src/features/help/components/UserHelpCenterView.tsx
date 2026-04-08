import { useAuth } from '@/app/context/useAuth';
import { jobService } from '@/features/customer/services/jobService';
import { customerReservationService } from '@/features/customer/services/customerReservationService';
import type { Job } from '@/features/customer/types';
import { workerService } from '@/features/customer/services/workerService';
import { organisationApi } from '@/features/organisation/api/auth';
import { reservationApi } from '@/features/organisation/api/reservation.service';
import type { Reservation } from '@/features/organisation/types/reservation.types';
import { cn } from '@/shared/utils/cn';
import {
  AlertCircle,
  Building2,
  Briefcase,
  CheckCircle2,
  CircleHelp,
  Clock3,
  LifeBuoy,
  Loader2,
  Send,
  ShoppingBag,
  Ticket,
  UserRound,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { helpService } from '../api/helpService';
import type { CreateHelpTicketPayload, HelpTicket } from '../types';

type HelpRole = 'CUSTOMER' | 'WORKER' | 'ORGANISATION';
type LinkType = 'NONE' | 'JOB' | 'RESERVATION';

interface UserHelpCenterViewProps {
  role: HelpRole;
}

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

const statusClasses: Record<string, string> = {
  OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const UserHelpCenterView = ({ role }: UserHelpCenterViewProps) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<HelpTicket[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [workerId, setWorkerId] = useState('');
  const [organisationId, setOrganisationId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [form, setForm] = useState({
    subject: '',
    message: '',
    linkType: 'NONE' as LinkType,
    linkedId: '',
  });

  const activeCount = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'OPEN').length,
    [tickets],
  );

  const linkedOptions = useMemo(() => {
    if (form.linkType === 'JOB') {
      return jobs.map((job) => ({
        id: job.id,
        label: `${job.title} - ${job.status} - ${job.id.slice(0, 8)}`,
      }));
    }

    if (form.linkType === 'RESERVATION') {
      return reservations.map((reservation) => ({
        id: reservation.id,
        label: `${reservation.product.name} - ${reservation.status} - ${reservation.id.slice(0, 8)}`,
      }));
    }

    return [];
  }, [form.linkType, jobs, reservations]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const requests: Promise<unknown>[] = [helpService.getMyTickets()];

      if (role === 'CUSTOMER') {
        requests.push(jobService.getMyJobs());
        requests.push(customerReservationService.getMyReservations({ limit: 20 }));
      }

      if (role === 'WORKER') {
        requests.push(workerService.getMe());
        requests.push(jobService.getMyAssignments());
      }

      if (role === 'ORGANISATION') {
        requests.push(organisationApi.getMyProfile());
        requests.push(reservationApi.getIncoming({ limit: 20 }));
      }

      const results = await Promise.all(requests);
      setTickets(results[0] as HelpTicket[]);

      if (role === 'CUSTOMER') {
        setJobs((results[1] as Job[]) ?? []);
        setReservations(((results[2] as { items?: Reservation[] })?.items ?? []));
      }

      if (role === 'WORKER') {
        setWorkerId((results[1] as { id: string }).id);
        setJobs((results[2] as Job[]) ?? []);
      }

      if (role === 'ORGANISATION') {
        setOrganisationId((results[1] as { id: string }).id);
        setReservations(((results[2] as { items?: Reservation[] })?.items ?? []));
      }
    } catch (error) {
      console.error('Failed to load help center data:', error);
      setToast({ ok: false, msg: 'Unable to load help center right now.' });
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      setToast({ ok: false, msg: 'Subject and message are required.' });
      return;
    }

    const payload: CreateHelpTicketPayload = {
      subject: form.subject.trim(),
      message: form.message.trim(),
      jobId: form.linkType === 'JOB' ? form.linkedId : undefined,
      reservationId: form.linkType === 'RESERVATION' ? form.linkedId : undefined,
      workerId: role === 'WORKER' ? workerId : undefined,
      organisationId: role === 'ORGANISATION' ? organisationId : undefined,
    };

    setSubmitting(true);
    try {
      const created = await helpService.createTicket(payload);
      setTickets((current) => [created, ...current]);
      setForm({
        subject: '',
        message: '',
        linkType: 'NONE',
        linkedId: '',
      });
      setToast({ ok: true, msg: `Ticket ${created.ticketNumber} created.` });
    } catch (error) {
      console.error('Failed to create help ticket:', error);
      setToast({ ok: false, msg: 'Could not submit your ticket.' });
    } finally {
      setSubmitting(false);
    }
  };

  const pageTitle =
    role === 'CUSTOMER'
      ? 'Help Center'
      : role === 'WORKER'
        ? 'Worker Help Desk'
        : 'Organisation Support';

  const pageDescription =
    role === 'CUSTOMER'
      ? 'Raise support tickets for posted jobs, reservations, marketplace issues, or account help.'
      : role === 'WORKER'
        ? 'Raise support tickets for assigned jobs, account review, or payout-related help.'
        : 'Raise support tickets for incoming reservations, product operations, and account support.';

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

      <section className="overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-background via-background to-surface-container shadow-sm">
        <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              <LifeBuoy className="h-3.5 w-3.5" />
              Support Desk
            </div>
            <div>
              <h1 className="font-headline text-3xl font-bold text-foreground">{pageTitle}</h1>
              <p className="mt-2 max-w-2xl text-sm font-body text-muted-foreground">{pageDescription}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Open Tickets</p>
                <p className="mt-3 text-3xl font-black text-foreground">{activeCount}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Total Raised</p>
                <p className="mt-3 text-3xl font-black text-foreground">{tickets.length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Sender ID</p>
                <p className="mt-3 truncate text-sm font-bold text-foreground">{user?.id}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-background p-6 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Linked Context</p>
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-surface-container px-4 py-3">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">User ID</p>
                  <p className="truncate text-sm font-semibold text-foreground">{user?.id}</p>
                </div>
              </div>
              {role === 'WORKER' && (
                <div className="flex items-center gap-3 rounded-2xl bg-surface-container px-4 py-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Worker ID</p>
                    <p className="truncate text-sm font-semibold text-foreground">{workerId || 'Loading...'}</p>
                  </div>
                </div>
              )}
              {role === 'ORGANISATION' && (
                <div className="flex items-center gap-3 rounded-2xl bg-surface-container px-4 py-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Organisation ID</p>
                    <p className="truncate text-sm font-semibold text-foreground">{organisationId || 'Loading...'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Raise Ticket</p>
              <h2 className="mt-2 font-headline text-2xl font-bold text-foreground">Tell us what needs attention</h2>
            </div>
            <div className="rounded-2xl bg-surface-container p-3 text-foreground">
              <CircleHelp className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Subject</label>
              <input
                value={form.subject}
                onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                placeholder="Short summary of the issue"
                className="mt-2 w-full rounded-2xl border border-border bg-surface-container px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Message</label>
              <textarea
                rows={6}
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Describe the problem, what you expected, and any important context."
                className="mt-2 w-full rounded-2xl border border-border bg-surface-container px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Link Ticket To</label>
                <select
                  value={form.linkType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      linkType: event.target.value as LinkType,
                      linkedId: '',
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-border bg-surface-container px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                >
                  <option value="NONE">General issue</option>
                  <option value="JOB">Job</option>
                  <option value="RESERVATION">Reservation</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Select Record</label>
                <select
                  value={form.linkedId}
                  onChange={(event) => setForm((current) => ({ ...current, linkedId: event.target.value }))}
                  disabled={form.linkType === 'NONE'}
                  className="mt-2 w-full rounded-2xl border border-border bg-surface-container px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {form.linkType === 'NONE' ? 'No linked record required' : 'Choose a record'}
                  </option>
                  {linkedOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface-container/30 px-4 py-4 text-sm text-muted-foreground">
              {form.linkType === 'JOB' && (
                <div className="flex items-start gap-3">
                  <Briefcase className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    The selected job ID will be sent to the backend. Admin will see the sender role,
                    contact info, the linked job, and who is attached to it.
                  </p>
                </div>
              )}
              {form.linkType === 'RESERVATION' && (
                <div className="flex items-start gap-3">
                  <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    The selected reservation ID will be sent to the backend so admin can inspect the
                    related customer, organisation, and reservation details.
                  </p>
                </div>
              )}
              {form.linkType === 'NONE' && (
                <p>General help tickets are also allowed if the issue is not tied to a specific job or reservation.</p>
              )}
            </div>

            <button
              onClick={() => void handleSubmit()}
              disabled={submitting || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3.5 text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Ticket
            </button>
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Ticket History</p>
              <h2 className="mt-2 font-headline text-2xl font-bold text-foreground">Your recent conversations</h2>
            </div>
            <button
              onClick={() => void loadData()}
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-container"
            >
              Refresh
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-container/30">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">Loading tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-container/30 px-8 text-center">
                <Ticket className="h-10 w-10 text-muted-foreground/40" />
                <h3 className="mt-4 text-lg font-bold text-foreground">No tickets yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">Once you raise a support request, the full thread and status will appear here.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="rounded-[1.5rem] border border-border bg-surface-container/30 p-5 transition-all hover:border-foreground/10 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-foreground px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-background">{ticket.ticketNumber}</span>
                        <span
                          className={cn(
                            'rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]',
                            statusClasses[ticket.status] ?? 'bg-slate-50 text-slate-700 border-slate-200',
                          )}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-foreground">{ticket.subject}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{ticket.message}</p>
                    </div>
                    <div className="text-right text-xs font-semibold text-muted-foreground">
                      <div className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatDate(ticket.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-background px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Job ID</p>
                      <p className="mt-2 truncate text-sm font-semibold text-foreground">{ticket.jobId ?? 'Not linked'}</p>
                    </div>
                    <div className="rounded-2xl bg-background px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Reservation ID</p>
                      <p className="mt-2 truncate text-sm font-semibold text-foreground">{ticket.reservationId ?? 'Not linked'}</p>
                    </div>
                    <div className="rounded-2xl bg-background px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sender Role</p>
                      <p className="mt-2 truncate text-sm font-semibold text-foreground">{ticket.createdByUser.role}</p>
                    </div>
                  </div>

                  {(ticket.resolutionNote || ticket.rejectionReason) && (
                    <div
                      className={cn(
                        'mt-5 rounded-2xl border px-4 py-4 text-sm',
                        ticket.status === 'REJECTED'
                          ? 'border-rose-200 bg-rose-50 text-rose-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700',
                      )}
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.22em]">
                        {ticket.status === 'REJECTED' ? 'Admin Rejection Note' : 'Admin Resolution Note'}
                      </p>
                      <p className="mt-2 leading-6">{ticket.rejectionReason ?? ticket.resolutionNote}</p>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
