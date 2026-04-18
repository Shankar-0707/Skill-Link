import { Injectable } from '@nestjs/common';
import { JobStatus, ReservationStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type DashboardMetric = {
  count: number;
  trend: number;
};

type DashboardMetricsResponse = {
  total: DashboardMetric;
  customers: DashboardMetric;
  workers: DashboardMetric;
  organisations: DashboardMetric;
};

type ActiveJobSummary = {
  id: string;
  title: string;
  category: string;
  status: JobStatus;
  budget: number | null;
  createdAt: Date;
  updatedAt: Date;
  scheduledAt: Date | null;
  workerName: string | null;
  customerName: string | null;
};

type ReservationSummary = {
  id: string;
  productName: string;
  organisationName: string;
  customerName: string;
  status: ReservationStatus;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
};

type AnalyticsBucket = {
  label: string;
  key: string;
  users: number;
  jobs: number;
  reservations: number;
  completedJobs: number;
  pickedUpReservations: number;
};

type AnalyticsBreakdownItem = {
  label: string;
  value: number;
};

type TopWorkerAnalytics = {
  name: string;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
};

type TopCustomerAnalytics = {
  name: string;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  reservations: number;
};

type TopOrganisationAnalytics = {
  name: string;
  reservations: number;
  pickedUpReservations: number;
  quantity: number;
};

type TopProductAnalytics = {
  name: string;
  organisationName: string;
  reservations: number;
  quantity: number;
};

type AnalyticsHighlight = {
  label: string;
  value: string;
  detail: string;
};

type AdminAnalyticsResponse = {
  monthlyActivity: AnalyticsBucket[];
  jobsByStatus: AnalyticsBreakdownItem[];
  reservationsByStatus: AnalyticsBreakdownItem[];
  jobsByCategory: AnalyticsBreakdownItem[];
  jobsByBudgetRange: AnalyticsBreakdownItem[];
  reservationsByQuantityRange: AnalyticsBreakdownItem[];
  usersByRole: AnalyticsBreakdownItem[];
  userHealth: AnalyticsBreakdownItem[];
  jobCoverage: AnalyticsBreakdownItem[];
  reservationFlow: AnalyticsBreakdownItem[];
  topWorkers: TopWorkerAnalytics[];
  topCustomers: TopCustomerAnalytics[];
  topOrganisations: TopOrganisationAnalytics[];
  topProducts: TopProductAnalytics[];
  highlights: AnalyticsHighlight[];
};

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(): Promise<DashboardMetricsResponse> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const activeUsersWhere = {
      deletedAt: null,
      isActive: true,
    } as const;

    const activeNonAdminUsersWhere = {
      ...activeUsersWhere,
      role: {
        not: Role.ADMIN,
      },
    } as const;

    const [
      totalUsers,
      totalCustomers,
      totalWorkers,
      totalOrganisations,
      newUsersThisMonth,
      newUsersLastMonth,
      newCustomersThisMonth,
      newCustomersLastMonth,
      newWorkersThisMonth,
      newWorkersLastMonth,
      newOrganisationsThisMonth,
      newOrganisationsLastMonth,
    ] = await Promise.all([
      this.prisma.user.count({ where: activeNonAdminUsersWhere }),
      this.prisma.user.count({
        where: { ...activeUsersWhere, role: Role.CUSTOMER },
      }),
      this.prisma.user.count({
        where: { ...activeUsersWhere, role: Role.WORKER },
      }),
      this.prisma.user.count({
        where: { ...activeUsersWhere, role: Role.ORGANISATION },
      }),
      this.prisma.user.count({
        where: {
          ...activeUsersWhere,
          role: { not: Role.ADMIN },
          createdAt: { gte: currentMonthStart },
        },
      }),
      this.prisma.user.count({
        where: {
          ...activeUsersWhere,
          role: { not: Role.ADMIN },
          createdAt: { gte: previousMonthStart, lt: currentMonthStart },
        },
      }),
      this.prisma.user.count({
        where: {
          ...activeUsersWhere,
          role: Role.CUSTOMER,
          createdAt: { gte: currentMonthStart },
        },
      }),
      this.prisma.user.count({
        where: {
          ...activeUsersWhere,
          role: Role.CUSTOMER,
          createdAt: { gte: previousMonthStart, lt: currentMonthStart },
        },
      }),
      this.prisma.user.count({
        where: {
          ...activeUsersWhere,
          role: Role.WORKER,
          createdAt: { gte: currentMonthStart },
        },
      }),
      this.prisma.user.count({
        where: {
          ...activeUsersWhere,
          role: Role.WORKER,
          createdAt: { gte: previousMonthStart, lt: currentMonthStart },
        },
      }),
      this.prisma.user.count({
        where: {
          ...activeUsersWhere,
          role: Role.ORGANISATION,
          createdAt: { gte: currentMonthStart },
        },
      }),
      this.prisma.user.count({
        where: {
          ...activeUsersWhere,
          role: Role.ORGANISATION,
          createdAt: { gte: previousMonthStart, lt: currentMonthStart },
        },
      }),
    ]);

    return {
      total: {
        count: totalUsers,
        trend: this.calculateGrowth(newUsersThisMonth, newUsersLastMonth),
      },
      customers: {
        count: totalCustomers,
        trend: this.calculateGrowth(newCustomersThisMonth, newCustomersLastMonth),
      },
      workers: {
        count: totalWorkers,
        trend: this.calculateGrowth(newWorkersThisMonth, newWorkersLastMonth),
      },
      organisations: {
        count: totalOrganisations,
        trend: this.calculateGrowth(
          newOrganisationsThisMonth,
          newOrganisationsLastMonth,
        ),
      },
    };
  }

  async getActiveJobs(): Promise<ActiveJobSummary[]> {
    const activeStatuses: JobStatus[] = [
      JobStatus.POSTED,
      JobStatus.ASSIGNED,
      JobStatus.IN_PROGRESS,
    ];

    const jobs = await this.prisma.job.findMany({
      where: {
        deletedAt: null,
        status: { in: activeStatuses },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        budget: true,
        createdAt: true,
        updatedAt: true,
        scheduledAt: true,
        customer: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        worker: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return jobs.map((job) => ({
      id: job.id,
      title: job.title,
      category: job.category,
      status: job.status,
      budget: job.budget,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      scheduledAt: job.scheduledAt,
      workerName: job.worker?.user.name ?? null,
      customerName: job.customer.user.name ?? null,
    }));
  }

  async getRecentReservations(): Promise<ReservationSummary[]> {
    const reservations = await this.prisma.reservation.findMany({
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        quantity: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
        product: {
          select: {
            name: true,
            organisation: {
              select: {
                businessName: true,
              },
            },
          },
        },
        customer: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return reservations.map((reservation) => ({
      id: reservation.id,
      productName: reservation.product.name,
      organisationName: reservation.product.organisation.businessName,
      customerName:
        reservation.customer.user.name ?? reservation.customer.user.email,
      status: reservation.status,
      quantity: reservation.quantity,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      expiresAt: reservation.expiresAt,
    }));
  }

  async getAnalytics(): Promise<AdminAnalyticsResponse> {
    const [users, jobs, reservations] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          deletedAt: null,
          role: {
            not: Role.ADMIN,
          },
        },
        select: {
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
      this.prisma.job.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          title: true,
          category: true,
          budget: true,
          status: true,
          scheduledAt: true,
          createdAt: true,
          customer: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          worker: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.reservation.findMany({
        select: {
          quantity: true,
          status: true,
          createdAt: true,
          product: {
            select: {
              name: true,
              organisation: {
                select: {
                  businessName: true,
                },
              },
            },
          },
          customer: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const monthlyActivity = this.buildMonthlyActivity(users, jobs, reservations);

    const jobsByStatus = this.toBreakdown(
      this.countBy(jobs, (job) => this.formatStatus(job.status)),
    );
    const reservationsByStatus = this.toBreakdown(
      this.countBy(reservations, (reservation) =>
        this.formatStatus(reservation.status),
      ),
    );
    const jobsByCategory = this.toBreakdown(
      this.countBy(jobs, (job) => job.category || 'Uncategorized'),
      6,
    );
    const jobsByBudgetRange = this.toBreakdown(
      this.countBy(jobs, (job) => this.getBudgetRangeLabel(job.budget)),
    );
    const reservationsByQuantityRange = this.toBreakdown(
      this.countBy(reservations, (reservation) =>
        this.getReservationQuantityRangeLabel(reservation.quantity),
      ),
    );
    const usersByRole = this.toBreakdown(
      this.countBy(users, (user) => this.formatRole(user.role)),
    );
    const userHealth = [
      { label: 'Active accounts', value: users.filter((user) => user.isActive).length },
      { label: 'Inactive accounts', value: users.filter((user) => !user.isActive).length },
      {
        label: 'Email verified',
        value: users.filter((user) => user.emailVerified).length,
      },
      {
        label: 'Email pending',
        value: users.filter((user) => !user.emailVerified).length,
      },
    ];
    const jobCoverage = [
      {
        label: 'Scheduled jobs',
        value: jobs.filter((job) => job.scheduledAt).length,
      },
      {
        label: 'Unscheduled jobs',
        value: jobs.filter((job) => !job.scheduledAt).length,
      },
      {
        label: 'Assigned jobs',
        value: jobs.filter((job) => job.worker).length,
      },
      {
        label: 'Unassigned jobs',
        value: jobs.filter((job) => !job.worker).length,
      },
    ];
    const reservationFlow = [
      {
        label: 'Pending',
        value: reservations.filter((reservation) => reservation.status === ReservationStatus.PENDING).length,
      },
      {
        label: 'Confirmed',
        value: reservations.filter((reservation) => reservation.status === ReservationStatus.CONFIRMED).length,
      },
      {
        label: 'Picked up',
        value: reservations.filter((reservation) => reservation.status === ReservationStatus.PICKED_UP).length,
      },
      {
        label: 'Cancelled or expired',
        value: reservations.filter(
          (reservation) =>
            reservation.status === ReservationStatus.CANCELLED ||
            reservation.status === ReservationStatus.EXPIRED,
        ).length,
      },
    ];

    return {
      monthlyActivity,
      jobsByStatus,
      reservationsByStatus,
      jobsByCategory,
      jobsByBudgetRange,
      reservationsByQuantityRange,
      usersByRole,
      userHealth,
      jobCoverage,
      reservationFlow,
      topWorkers: this.buildTopWorkers(jobs),
      topCustomers: this.buildTopCustomers(jobs, reservations),
      topOrganisations: this.buildTopOrganisations(reservations),
      topProducts: this.buildTopProducts(reservations),
      highlights: this.buildHighlights(monthlyActivity, jobs, reservations),
    };
  }

  private calculateGrowth(currentMonthCount: number, previousMonthCount: number) {
    if (previousMonthCount === 0) {
      return currentMonthCount > 0 ? 100 : 0;
    }

    return Number(
      (((currentMonthCount - previousMonthCount) / previousMonthCount) * 100).toFixed(1),
    );
  }

  private buildMonthlyActivity(
    users: Array<{ createdAt: Date }>,
    jobs: Array<{ createdAt: Date; status: JobStatus }>,
    reservations: Array<{ createdAt: Date; status: ReservationStatus }>,
  ): AnalyticsBucket[] {
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, index) => {
      const bucketDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        label: bucketDate.toLocaleString('en-IN', { month: 'short' }),
        key: `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`,
        users: 0,
        jobs: 0,
        reservations: 0,
        completedJobs: 0,
        pickedUpReservations: 0,
      };
    });

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    users.forEach((user) => {
      const key = `${user.createdAt.getFullYear()}-${user.createdAt.getMonth()}`;
      const bucket = bucketMap.get(key);
      if (bucket) {
        bucket.users += 1;
      }
    });

    jobs.forEach((job) => {
      const key = `${job.createdAt.getFullYear()}-${job.createdAt.getMonth()}`;
      const bucket = bucketMap.get(key);
      if (bucket) {
        bucket.jobs += 1;
        if (job.status === JobStatus.COMPLETED) {
          bucket.completedJobs += 1;
        }
      }
    });

    reservations.forEach((reservation) => {
      const key = `${reservation.createdAt.getFullYear()}-${reservation.createdAt.getMonth()}`;
      const bucket = bucketMap.get(key);
      if (bucket) {
        bucket.reservations += 1;
        if (reservation.status === ReservationStatus.PICKED_UP) {
          bucket.pickedUpReservations += 1;
        }
      }
    });

    return buckets;
  }

  private buildTopWorkers(
    jobs: Array<{
      status: JobStatus;
      worker: { user: { name: string | null; email: string } } | null;
    }>,
  ): TopWorkerAnalytics[] {
    const counts = new Map<string, TopWorkerAnalytics>();

    jobs.forEach((job) => {
      if (!job.worker) {
        return;
      }

      const workerName = job.worker.user.name ?? job.worker.user.email;
      const existing = counts.get(workerName) ?? {
        name: workerName,
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
      };

      existing.totalJobs += 1;
      if (
        job.status === JobStatus.POSTED ||
        job.status === JobStatus.ASSIGNED ||
        job.status === JobStatus.IN_PROGRESS
      ) {
        existing.activeJobs += 1;
      }
      if (job.status === JobStatus.COMPLETED) {
        existing.completedJobs += 1;
      }

      counts.set(workerName, existing);
    });

    return Array.from(counts.values())
      .sort((left, right) =>
        right.completedJobs - left.completedJobs ||
        right.activeJobs - left.activeJobs ||
        right.totalJobs - left.totalJobs,
      )
      .slice(0, 5);
  }

  private buildTopCustomers(
    jobs: Array<{
      status: JobStatus;
      customer: { user: { name: string | null; email: string } };
    }>,
    reservations: Array<{
      customer: { user: { name: string | null; email: string } };
    }>,
  ): TopCustomerAnalytics[] {
    const counts = new Map<string, TopCustomerAnalytics>();

    jobs.forEach((job) => {
      const customerName = job.customer.user.name ?? job.customer.user.email;
      const existing = counts.get(customerName) ?? {
        name: customerName,
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        reservations: 0,
      };

      existing.totalJobs += 1;
      if (
        job.status === JobStatus.POSTED ||
        job.status === JobStatus.ASSIGNED ||
        job.status === JobStatus.IN_PROGRESS
      ) {
        existing.activeJobs += 1;
      }
      if (job.status === JobStatus.COMPLETED) {
        existing.completedJobs += 1;
      }

      counts.set(customerName, existing);
    });

    reservations.forEach((reservation) => {
      const customerName =
        reservation.customer.user.name ?? reservation.customer.user.email;
      const existing = counts.get(customerName) ?? {
        name: customerName,
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        reservations: 0,
      };

      existing.reservations += 1;
      counts.set(customerName, existing);
    });

    return Array.from(counts.values())
      .sort((left, right) =>
        right.totalJobs - left.totalJobs ||
        right.reservations - left.reservations ||
        right.completedJobs - left.completedJobs,
      )
      .slice(0, 6);
  }

  private buildTopOrganisations(
    reservations: Array<{
      quantity: number;
      status: ReservationStatus;
      product: { organisation: { businessName: string } };
    }>,
  ): TopOrganisationAnalytics[] {
    const counts = new Map<string, TopOrganisationAnalytics>();

    reservations.forEach((reservation) => {
      const organisationName = reservation.product.organisation.businessName;
      const existing = counts.get(organisationName) ?? {
        name: organisationName,
        reservations: 0,
        pickedUpReservations: 0,
        quantity: 0,
      };

      existing.reservations += 1;
      existing.quantity += reservation.quantity;
      if (reservation.status === ReservationStatus.PICKED_UP) {
        existing.pickedUpReservations += 1;
      }

      counts.set(organisationName, existing);
    });

    return Array.from(counts.values())
      .sort((left, right) =>
        right.reservations - left.reservations ||
        right.quantity - left.quantity ||
        right.pickedUpReservations - left.pickedUpReservations,
      )
      .slice(0, 6);
  }

  private buildTopProducts(
    reservations: Array<{
      quantity: number;
      product: { name: string; organisation: { businessName: string } };
    }>,
  ): TopProductAnalytics[] {
    const counts = new Map<string, TopProductAnalytics>();

    reservations.forEach((reservation) => {
      const key = `${reservation.product.organisation.businessName}::${reservation.product.name}`;
      const existing = counts.get(key) ?? {
        name: reservation.product.name,
        organisationName: reservation.product.organisation.businessName,
        reservations: 0,
        quantity: 0,
      };

      existing.reservations += 1;
      existing.quantity += reservation.quantity;
      counts.set(key, existing);
    });

    return Array.from(counts.values())
      .sort((left, right) =>
        right.reservations - left.reservations || right.quantity - left.quantity,
      )
      .slice(0, 6);
  }

  private buildHighlights(
    monthlyActivity: AnalyticsBucket[],
    jobs: Array<{
      status: JobStatus;
      worker: { user: { name: string | null; email: string } } | null;
    }>,
    reservations: Array<{
      quantity: number;
      status: ReservationStatus;
      product: { organisation: { businessName: string } };
    }>,
  ): AnalyticsHighlight[] {
    const topJobMonth = [...monthlyActivity].sort((left, right) => right.jobs - left.jobs)[0];
    const topReservationMonth = [...monthlyActivity].sort(
      (left, right) => right.reservations - left.reservations,
    )[0];
    const topWorker = this.buildTopWorkers(jobs)[0];
    const topOrganisation = this.buildTopOrganisations(reservations)[0];

    return [
      {
        label: 'Busiest jobs month',
        value: topJobMonth ? topJobMonth.label : 'N/A',
        detail: topJobMonth ? `${topJobMonth.jobs} jobs created` : 'No job data yet',
      },
      {
        label: 'Peak reservations month',
        value: topReservationMonth ? topReservationMonth.label : 'N/A',
        detail: topReservationMonth
          ? `${topReservationMonth.reservations} reservations created`
          : 'No reservation data yet',
      },
      {
        label: 'Most hired worker',
        value: topWorker?.name ?? 'No worker data',
        detail: topWorker
          ? `${topWorker.completedJobs} completed and ${topWorker.activeJobs} active jobs`
          : 'Assignments will surface here',
      },
      {
        label: 'Busiest organisation',
        value: topOrganisation?.name ?? 'No organisation data',
        detail: topOrganisation
          ? `${topOrganisation.reservations} reservations and ${topOrganisation.quantity} units`
          : 'Reservations will surface here',
      },
    ];
  }

  private countBy<T>(
    items: T[],
    getKey: (item: T) => string,
  ): Record<string, number> {
    return items.reduce<Record<string, number>>((accumulator, item) => {
      const key = getKey(item);
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});
  }

  private toBreakdown(
    counts: Record<string, number>,
    limit?: number,
  ): AnalyticsBreakdownItem[] {
    const items = Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value);

    return typeof limit === 'number' ? items.slice(0, limit) : items;
  }

  private formatStatus(status: JobStatus | ReservationStatus): string {
    return status
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private formatRole(role: Role): string {
    if (role === Role.ORGANISATION) {
      return 'Organisation';
    }

    return role.charAt(0) + role.slice(1).toLowerCase();
  }

  private getBudgetRangeLabel(budget: number | null): string {
    if (budget === null || budget === undefined) {
      return 'Budget not set';
    }

    if (budget < 1000) {
      return 'Under Rs 1k';
    }

    if (budget < 5000) {
      return 'Rs 1k - 5k';
    }

    if (budget < 10000) {
      return 'Rs 5k - 10k';
    }

    return 'Rs 10k+';
  }

  private getReservationQuantityRangeLabel(quantity: number): string {
    if (quantity <= 1) {
      return 'Single unit';
    }

    if (quantity <= 3) {
      return '2-3 units';
    }

    if (quantity <= 5) {
      return '4-5 units';
    }

    return '6+ units';
  }
}
