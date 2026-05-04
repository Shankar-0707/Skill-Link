import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Loader2, RefreshCcw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '@/features/admin/api/admin';
import {
  AnalyticsBarChart,
  AnalyticsChartCard,
  AnalyticsLeaderboardCard,
  AnalyticsLineChart,
  AnalyticsPieChart,
  analyticsPalette,
} from '@/features/admin/components/analytics/AdminAnalyticsWidgets';
import type {
  AdminAnalyticsData,
  AdminAnalyticsBreakdownItem,
  TicketHeavyUserAnalytics,
} from '@/features/admin/types';
import { cn } from '@/shared/utils/cn';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'individual-activity', label: 'Individual Activity' },
  { id: 'moderation', label: 'Moderation' },
  { id: 'marketplace', label: 'Marketplace' },
] as const;

type SectionId = (typeof sections)[number]['id'];

const isSectionId = (value: string | null): value is SectionId =>
  sections.some((section) => section.id === value);

const breakdownData = (items: AdminAnalyticsBreakdownItem[]) =>
  items.map((item) => ({
    name: item.label,
    value: item.value,
  }));

export const AdminAnalyticsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const sectionParam = searchParams.get('section');
  const activeSection: SectionId = isSectionId(sectionParam) ? sectionParam : 'overview';

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAnalytics();
      setAnalytics(response);
      setError(null);
    } catch {
      setError('Unable to load analytics right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const monthlyComparisonData = useMemo(
    () =>
      analytics?.monthlyActivity.map((month) => ({
        month: month.label,
        users: month.users,
        jobs: month.jobs,
        reservations: month.reservations,
        completedJobs: month.completedJobs,
        pickedUpReservations: month.pickedUpReservations,
      })) ?? [],
    [analytics],
  );

  const handleBlacklistToggle = async (user: TicketHeavyUserAnalytics) => {
    if (!analytics) {
      return;
    }

    try {
      setPendingUserId(user.id);

      if (user.isBlacklisted) {
        await adminApi.unblacklistUser(user.id);
      } else {
        await adminApi.blacklistUser(
            user.id,
            'Suspended by admin review. User can contact linkskillofficial@gmail.com for support.',
          );
      }

      const refreshedAnalytics = await adminApi.getAnalytics();
      setAnalytics(refreshedAnalytics);
    } catch {
      setError('Unable to update blacklist status right now.');
    } finally {
      setPendingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-background p-12 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
        <p className="mt-4 text-sm font-body text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-headline font-bold text-3xl text-foreground leading-tight">
              Analytics
            </h1>
            <p className="text-muted-foreground font-body mt-1">
              Deeper platform health, activity, and marketplace trends.
            </p>
          </div>
          <button
            onClick={() => void loadAnalytics()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-background border border-border text-foreground rounded-xl text-sm font-label font-semibold hover:bg-surface-container transition-all"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error ?? 'Unable to load analytics right now.'}
        </div>
      </div>
    );
  }

  const overview = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {analytics.highlights.map((highlight, index) => (
          <article
            key={highlight.label}
            className="rounded-2xl border border-border bg-background p-5 shadow-sm shadow-slate-950/5"
          >
            <div
              className="mb-4 h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${analyticsPalette[index % analyticsPalette.length]}15` }}
            >
              <BarChart3
                size={18}
                color={analyticsPalette[index % analyticsPalette.length]}
              />
            </div>
            <p className="text-xs font-label uppercase tracking-wider text-muted-foreground">
              {highlight.label}
            </p>
            <h2 className="mt-2 text-xl font-headline font-bold text-foreground">
              {highlight.value}
            </h2>
            <p className="mt-2 text-sm font-body text-muted-foreground">{highlight.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnalyticsChartCard
          title="Platform Growth Pulse"
          description="Monthly users, jobs, and reservations together so admin can spot demand shifts quickly."
        >
          <AnalyticsLineChart
            data={monthlyComparisonData}
            xKey="month"
            lines={[
              { dataKey: 'users', name: 'Users', color: analyticsPalette[1] },
              { dataKey: 'jobs', name: 'Jobs', color: analyticsPalette[0] },
              { dataKey: 'reservations', name: 'Reservations', color: analyticsPalette[2] },
            ]}
          />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Job Status Mix"
          description="Current workload across posted, assigned, in-progress, completed, and cancelled jobs."
        >
          <AnalyticsPieChart
            data={breakdownData(analytics.jobsByStatus)}
            dataKey="value"
            nameKey="name"
          />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Reservation Status Mix"
          description="Reservation pipeline health from pending through pickup, with churn visible too."
        >
          <AnalyticsPieChart
            data={breakdownData(analytics.reservationsByStatus)}
            dataKey="value"
            nameKey="name"
          />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="User Role Split"
          description="How the platform population is currently distributed across customers, workers, and organisations."
        >
          <AnalyticsBarChart
            data={breakdownData(analytics.usersByRole)}
            xKey="name"
            bars={[{ dataKey: 'value', name: 'Accounts', color: analyticsPalette[3] }]}
          />
        </AnalyticsChartCard>
      </div>
    </div>
  );

  const activity = (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <AnalyticsChartCard
        title="Monthly Workload Journey"
        description="Created jobs compared with completed jobs over the last six months."
      >
        <AnalyticsBarChart
          data={monthlyComparisonData}
          xKey="month"
          bars={[
            { dataKey: 'jobs', name: 'Created jobs', color: analyticsPalette[0] },
            { dataKey: 'completedJobs', name: 'Completed jobs', color: analyticsPalette[2] },
          ]}
        />
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Top Job Categories"
        description="The service categories generating the most activity right now."
      >
        <AnalyticsBarChart
          data={breakdownData(analytics.jobsByCategory)}
          xKey="name"
          horizontal
          bars={[{ dataKey: 'value', name: 'Jobs', color: analyticsPalette[1] }]}
        />
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Assignment Coverage"
        description="Operational coverage showing how many jobs are scheduled and assigned."
      >
        <AnalyticsBarChart
          data={breakdownData(analytics.jobCoverage)}
          xKey="name"
          bars={[{ dataKey: 'value', name: 'Jobs', color: analyticsPalette[4] }]}
        />
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Budget Bands"
        description="Where posted work is clustering by budget, helpful for supply-demand calibration."
      >
        <AnalyticsBarChart
          data={breakdownData(analytics.jobsByBudgetRange)}
          xKey="name"
          bars={[{ dataKey: 'value', name: 'Jobs', color: analyticsPalette[5] }]}
        />
      </AnalyticsChartCard>
    </div>
  );

  const individualActivity = (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <AnalyticsLeaderboardCard
        title="Top Workers"
        description="Most hired workers based on completed jobs first, then current active workload."
        rows={analytics.topWorkers}
        columns={[
          { key: 'name', label: 'Worker' },
          { key: 'completedJobs', label: 'Completed', align: 'right' },
          { key: 'activeJobs', label: 'Active', align: 'right' },
          { key: 'totalJobs', label: 'Total', align: 'right' },
        ]}
      />

      <AnalyticsLeaderboardCard
        title="Top Customers"
        description="Customers driving the most marketplace activity across jobs and reservations."
        rows={analytics.topCustomers}
        columns={[
          { key: 'name', label: 'Customer' },
          { key: 'totalJobs', label: 'Jobs', align: 'right' },
          { key: 'reservations', label: 'Reservations', align: 'right' },
          { key: 'completedJobs', label: 'Completed', align: 'right' },
        ]}
      />

      <AnalyticsChartCard
        title="User Health Snapshot"
        description="Activation and verification health across the current account base."
      >
        <AnalyticsBarChart
          data={breakdownData(analytics.userHealth)}
          xKey="name"
          bars={[{ dataKey: 'value', name: 'Accounts', color: analyticsPalette[2] }]}
        />
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Monthly New Accounts"
        description="A clean view of how many new users joined each month."
      >
        <AnalyticsLineChart
          data={monthlyComparisonData}
          xKey="month"
          lines={[{ dataKey: 'users', name: 'New users', color: analyticsPalette[6] }]}
        />
      </AnalyticsChartCard>
    </div>
  );

  const moderationCard = (
    title: string,
    description: string,
    rows: TicketHeavyUserAnalytics[],
    actionLabel: 'Blacklist' | 'Unblacklist' = 'Blacklist',
  ) => (
    <div className="rounded-2xl border border-border bg-background p-5 shadow-sm shadow-slate-950/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-headline font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm font-body text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm font-body text-muted-foreground">
            No ticket activity yet.
          </div>
        ) : (
          rows.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3"
            >
              <div>
                <p className="text-sm font-label font-semibold text-foreground">{user.name}</p>
                <p className="mt-1 text-xs font-body text-muted-foreground">
                  {user.email}
                </p>
                <p className="mt-1 text-[11px] font-body text-muted-foreground">
                  {user.role} | {user.helpTicketCount} tickets
                </p>
                {user.blacklistedReason && (
                  <p className="mt-1 text-[11px] font-body text-muted-foreground">
                    {user.blacklistedReason}
                  </p>
                )}
              </div>
              <button
                onClick={() => void handleBlacklistToggle(user)}
                disabled={pendingUserId === user.id}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs font-label font-semibold transition-colors',
                  user.isBlacklisted
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100',
                  pendingUserId === user.id && 'cursor-not-allowed opacity-60',
                )}
              >
                {pendingUserId === user.id
                  ? 'Saving...'
                  : actionLabel}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const moderation = (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-body text-amber-800">
        Top complaint lists now show the next 10 non-blacklisted users in each role. When you blacklist someone, they move into the blacklisted section below and the next highest complaint account takes their place automatically.
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {moderationCard(
          'Customers With Most Tickets',
          'Top 10 customers with the most complaints right now.',
          analytics.ticketHeavyCustomers,
        )}
        {moderationCard(
          'Workers With Most Tickets',
          'Top 10 workers with the heaviest complaint footprint.',
          analytics.ticketHeavyWorkers,
        )}
        <div className="xl:col-span-2">
          {moderationCard(
            'Organisations With Most Tickets',
            'Top 10 organisations creating the most support load.',
            analytics.ticketHeavyOrganisations,
          )}
        </div>
        <div className="xl:col-span-2">
          {moderationCard(
            'Blacklisted Users',
            'All currently suspended users with quick unblacklist access.',
            analytics.blacklistedUsers,
            'Unblacklist',
          )}
        </div>
      </div>
    </div>
  );

  const marketplace = (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <AnalyticsChartCard
        title="Reservation Flow"
        description="A status view of the reservation funnel, including drop-off from cancellation and expiry."
      >
        <AnalyticsBarChart
          data={breakdownData(analytics.reservationFlow)}
          xKey="name"
          bars={[{ dataKey: 'value', name: 'Reservations', color: analyticsPalette[3] }]}
        />
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Monthly Reservation Outcomes"
        description="Reservations created compared with successful pickups over the last six months."
      >
        <AnalyticsLineChart
          data={monthlyComparisonData}
          xKey="month"
          lines={[
            { dataKey: 'reservations', name: 'Reservations', color: analyticsPalette[1] },
            {
              dataKey: 'pickedUpReservations',
              name: 'Picked up',
              color: analyticsPalette[2],
            },
          ]}
        />
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Reservation Quantity Bands"
        description="Shows whether customers usually reserve single items or larger grouped quantities."
      >
        <AnalyticsBarChart
          data={breakdownData(analytics.reservationsByQuantityRange)}
          xKey="name"
          bars={[{ dataKey: 'value', name: 'Reservations', color: analyticsPalette[5] }]}
        />
      </AnalyticsChartCard>

      <AnalyticsLeaderboardCard
        title="Top Organisations"
        description="Organisations receiving the most reservation demand and fulfilled quantity."
        rows={analytics.topOrganisations}
        columns={[
          { key: 'name', label: 'Organisation' },
          { key: 'reservations', label: 'Reservations', align: 'right' },
          { key: 'pickedUpReservations', label: 'Picked up', align: 'right' },
          { key: 'quantity', label: 'Units', align: 'right' },
        ]}
      />

      <div className="xl:col-span-2">
        <AnalyticsLeaderboardCard
          title="Top Reserved Products"
          description="Products with the strongest current demand footprint."
          rows={analytics.topProducts.map((product) => ({
            ...product,
            name: `${product.name} (${product.organisationName})`,
          }))}
          columns={[
            { key: 'name', label: 'Product' },
            { key: 'reservations', label: 'Reservations', align: 'right' },
            { key: 'quantity', label: 'Units', align: 'right' },
          ]}
        />
      </div>
    </div>
  );

  const contentBySection: Record<SectionId, ReactNode> = {
    overview,
    activity,
    'individual-activity': individualActivity,
    moderation,
    marketplace,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-3xl text-foreground leading-tight">
            Analytics
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Deep admin visibility into growth, activity, individual performance, and marketplace flow.
          </p>
        </div>
        <button
          onClick={() => void loadAnalytics()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-background border border-border text-foreground rounded-xl text-sm font-label font-semibold hover:bg-surface-container transition-all"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-background p-3">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setSearchParams({ section: section.id })}
            className={cn(
              'rounded-xl px-4 py-2.5 text-sm font-label font-semibold transition-all',
              activeSection === section.id
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:bg-surface-container hover:text-foreground',
            )}
          >
            {section.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {contentBySection[activeSection]}
    </div>
  );
};
