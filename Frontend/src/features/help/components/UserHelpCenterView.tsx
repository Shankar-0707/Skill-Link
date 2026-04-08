import { useAuth } from '@/app/context/useAuth';
import { customerReservationService } from '@/features/customer/services/customerReservationService';
import { jobService } from '@/features/customer/services/jobService';
import type { Job } from '@/features/customer/types';
import { workerService } from '@/features/customer/services/workerService';
import { organisationApi } from '@/features/organisation/api/auth';
import { reservationApi } from '@/features/organisation/api/reservation.service';
import type { Reservation } from '@/features/organisation/types/reservation.types';
import { cn } from '@/shared/utils/cn';
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  LifeBuoy,
  Loader2,
  Phone,
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

type LinkedRecordCard = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  description: string;
  icon: Exclude<LinkType, 'NONE'>;
};

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

const linkTypeMeta = {
  NONE: {
    label: 'General',
    helper: 'Use this for account, payout, or platform issues that are not tied to one record.',
    badge: 'General support',
  },
  JOB: {
    label: 'Job',
    helper: 'Link a posted or assigned job so admin can inspect the worker, customer, and job status.',
    badge: 'Job-linked',
  },
  RESERVATION: {
    label: 'Reservation',
    helper: 'Link a reservation so admin can inspect the organisation, customer, and fulfilment status.',
    badge: 'Reservation-linked',
  },
} as const;

function mapJobToCard(job: Job): LinkedRecordCard {
  return {
    id: job.id,
    title: job.title,
    subtitle: `${job.category} - ${job.status}`,
    meta: job.budget ? `Budget Rs ${job.budget}` : `Job ${job.id.slice(0, 8)}`,
    description: job.description,
    icon: 'JOB',
  };
}

function mapReservationToCard(reservation: Reservation): LinkedRecordCard {
  return {
    id: reservation.id,
    title: reservation.product.name,
    subtitle: `${reservation.status} - Qty ${reservation.quantity}`,
    meta: `Reservation ${reservation.id.slice(0, 8)}`,
    description: reservation.product.description || 'Linked to a marketplace reservation.',
    icon: 'RESERVATION',
  };
}

function getRoleTitle(role: HelpRole) {
  if (role === 'WORKER') return 'Worker Help Desk';
  if (role === 'ORGANISATION') return 'Organisation Support';
  return 'Help Center';
}

function getRoleDescription(role: HelpRole) {
  if (role === 'WORKER') {
    return 'Raise support tickets for assigned jobs, profile checks, account access, or payout follow-ups.';
  }

  if (role === 'ORGANISATION') {
    return 'Raise support tickets for reservations, fulfilment issues, catalogue operations, and account support.';
  }

  return 'Raise support tickets for jobs, reservations, delivery issues, or general account help.';
}

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

  const availableLinkTypes = useMemo<LinkType[]>(() => {
    if (role === 'WORKER') return ['NONE', 'JOB'];
    if (role === 'ORGANISATION') return ['NONE', 'RESERVATION'];
    return ['NONE', 'JOB', 'RESERVATION'];
  }, [role]);

  const linkedCards = useMemo<LinkedRecordCard[]>(() => {
    if (form.linkType === 'JOB') return jobs.map(mapJobToCard);
    if (form.linkType === 'RESERVATION') return reservations.map(mapReservationToCard);
    return [];
  }, [form.linkType, jobs, reservations]);

  const selectedCard = useMemo(
    () => linkedCards.find((record) => record.id === form.linkedId) ?? null,
    [form.linkedId, linkedCards],
  );

  const selectedHelper = useMemo(() => {
    if (form.linkType === 'JOB') {
      return 'Admin will receive the linked job plus the assigned worker and customer context.';
    }

    if (form.linkType === 'RESERVATION') {
      return 'Admin will receive the linked reservation plus the organisation and customer context.';
    }

    return 'Admin will still see your sender profile and contact information on the ticket.';
  }, [form.linkType]);

  const fieldErrors = useMemo(
    () => ({
      subject:
        form.subject.trim().length > 0 && form.subject.trim().length < 5
          ? 'Subject must be at least 5 characters.'
          : '',
      message:
        form.message.trim().length > 0 && form.message.trim().length < 10
          ? 'Message must be at least 10 characters.'
          : '',
      linked:
        form.linkType !== 'NONE' && !form.linkedId
          ? `Select a ${form.linkType === 'JOB' ? 'job' : 'reservation'} to continue.`
          : '',
    }),
    [form.linkType, form.linkedId, form.message, form.subject],
  );

  const canSubmit =
    !loading &&
    !submitting &&
    form.subject.trim().length >= 5 &&
    form.message.trim().length >= 10 &&
    (form.linkType === 'NONE' || Boolean(form.linkedId));

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
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      setToast({ ok: false, msg: 'Please complete the required fields before submitting.' });
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
        <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              <LifeBuoy className="h-3.5 w-3.5" />
              Support Desk
            </div>
            <div>
              <h1 className="font-headline text-3xl font-bold text-foreground">{getRoleTitle(role)}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{getRoleDescription(role)}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Open Tickets</p>
                <p className="mt-3 text-3xl font-black text-foreground">{activeCount}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Total Raised</p>
                <p className="mt-3 text-3xl font-black text-foreground">{tickets.length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Current User</p>
                <p className="mt-3 truncate text-sm font-bold text-foreground">{user?.name ?? user?.email}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {role}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-background p-6 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Ticket Snapshot</p>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-surface-container px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-background p-3">
                    <UserRound className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sender</p>
                    <p className="truncate text-sm font-semibold text-foreground">{user?.name ?? 'Unnamed user'}</p>
                    <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </div>

              {user?.phone && (
                <div className="rounded-2xl bg-surface-container px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-background p-3">
                      <Phone className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Phone</p>
                      <p className="text-sm font-semibold text-foreground">{user.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-background px-4 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Linked Profile</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {role === 'WORKER'
                    ? workerId || 'Loading worker profile'
                    : role === 'ORGANISATION'
                      ? organisationId || 'Loading organisation profile'
                      : user?.customer?.id || 'Customer account'}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Admin will always see your sender role, contact details, and any linked job or reservation context.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
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
                placeholder="Example: Assigned worker did not complete the task"
                className="mt-2 w-full rounded-2xl border border-border bg-surface-container px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
              />
              {fieldErrors.subject && (
                <p className="mt-2 text-xs font-semibold text-rose-600">{fieldErrors.subject}</p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Message</label>
              <textarea
                rows={6}
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Describe what happened, what you expected, and anything admin should verify."
                className="mt-2 w-full rounded-[1.5rem] border border-border bg-surface-container px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
              />
              {fieldErrors.message && (
                <p className="mt-2 text-xs font-semibold text-rose-600">{fieldErrors.message}</p>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-border bg-surface-container/30 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">Link Ticket To</p>
                  <p className="mt-2 text-sm text-muted-foreground">{linkTypeMeta[form.linkType].helper}</p>
                </div>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                  {linkTypeMeta[form.linkType].badge}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {availableLinkTypes.map((type) => {
                  const active = form.linkType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          linkType: type,
                          linkedId: '',
                        }))
                      }
                      className={cn(
                        'rounded-full border px-4 py-2.5 text-sm font-bold transition-all',
                        active
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-background text-foreground hover:border-foreground/20 hover:bg-surface-container',
                      )}
                    >
                      {linkTypeMeta[type].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {form.linkType !== 'NONE' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                      Choose Linked Record
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{selectedHelper}</p>
                  </div>
                  {selectedCard && (
                    <span className="rounded-full bg-surface-container px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-foreground">
                      Selected
                    </span>
                  )}
                </div>

                {linkedCards.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-border bg-surface-container/20 px-5 py-6 text-sm text-muted-foreground">
                    No {form.linkType === 'JOB' ? 'jobs' : 'reservations'} available to link yet.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {linkedCards.map((record) => {
                      const isSelected = form.linkedId === record.id;
                      const Icon = record.icon === 'JOB' ? Briefcase : ShoppingBag;

                      return (
                        <button
                          key={record.id}
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              linkedId: isSelected ? '' : record.id,
                            }))
                          }
                          className={cn(
                            'group rounded-[1.5rem] border p-4 text-left transition-all',
                            isSelected
                              ? 'border-foreground bg-foreground text-background shadow-sm'
                              : 'border-border bg-background hover:border-foreground/15 hover:bg-surface-container/25',
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 gap-3">
                              <div
                                className={cn(
                                  'rounded-2xl p-3',
                                  isSelected ? 'bg-background/10' : 'bg-surface-container',
                                )}
                              >
                                <Icon
                                  className={cn(
                                    'h-4 w-4',
                                    isSelected ? 'text-background' : 'text-foreground',
                                  )}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className={cn('truncate text-sm font-bold', isSelected ? 'text-background' : 'text-foreground')}>
                                  {record.title}
                                </p>
                                <p className={cn('mt-1 text-xs font-semibold', isSelected ? 'text-background/85' : 'text-muted-foreground')}>
                                  {record.subtitle}
                                </p>
                                <p className={cn('mt-2 line-clamp-2 text-xs', isSelected ? 'text-background/80' : 'text-muted-foreground')}>
                                  {record.description}
                                </p>
                                <p className={cn('mt-2 text-xs font-bold uppercase tracking-[0.18em]', isSelected ? 'text-background/80' : 'text-muted-foreground')}>
                                  {record.meta}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className={cn('mt-1 h-4 w-4 shrink-0', isSelected ? 'text-background' : 'text-muted-foreground group-hover:text-foreground')} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {fieldErrors.linked && (
                  <p className="text-xs font-semibold text-rose-600">{fieldErrors.linked}</p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!canSubmit}
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
              type="button"
              onClick={() => void loadData()}
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-container"
            >
              Refresh
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-container/30">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">Loading tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-container/30 px-8 text-center">
                <Ticket className="h-10 w-10 text-muted-foreground/40" />
                <h3 className="mt-4 text-lg font-bold text-foreground">No tickets yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Once you raise a support request, the full thread and current status will appear here.
                </p>
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
                        <span className="rounded-full bg-foreground px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-background">
                          {ticket.ticketNumber}
                        </span>
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
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Linked Record</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {ticket.job?.title ?? ticket.reservation?.product.name ?? 'General issue'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-background px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Record Type</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {ticket.jobId ? 'Job' : ticket.reservationId ? 'Reservation' : 'General'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-background px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sender</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{ticket.createdByUser.role}</p>
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
