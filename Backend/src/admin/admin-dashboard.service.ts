import { Injectable, NotFoundException } from '@nestjs/common';
import { JobStatus, ReservationStatus, Role, EscrowStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EscrowService } from '../escrow/escrow.service';

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
  id: string;
  name: string;
  email: string;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  helpTicketCount: number;
  isBlacklisted: boolean;
};

type TopCustomerAnalytics = {
  id: string;
  name: string;
  email: string;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  reservations: number;
  helpTicketCount: number;
  isBlacklisted: boolean;
};

type TopOrganisationAnalytics = {
  id: string;
  name: string;
  email: string;
  reservations: number;
  pickedUpReservations: number;
  quantity: number;
  helpTicketCount: number;
  isBlacklisted: boolean;
};

type TicketHeavyUserAnalytics = {
  id: string;
  name: string;
  email: string;
  role: string;
  helpTicketCount: number;
  isBlacklisted: boolean;
  blacklistedAt: Date | null;
  blacklistedReason?: string | null;
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
  ticketHeavyCustomers: TicketHeavyUserAnalytics[];
  ticketHeavyWorkers: TicketHeavyUserAnalytics[];
  ticketHeavyOrganisations: TicketHeavyUserAnalytics[];
  blacklistedUsers: TicketHeavyUserAnalytics[];
  highlights: AnalyticsHighlight[];
};

@Injectable()
export class AdminDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly escrowService: EscrowService,
  ) {}

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
    const [users, jobs, reservations, helpTickets] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          deletedAt: null,
          role: {
            not: Role.ADMIN,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          isBlacklisted: true,
          blacklistedAt: true,
          blacklistedReason: true,
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
                  id: true,
                  name: true,
                  email: true,
                  isBlacklisted: true,
                },
              },
            },
          },
          worker: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  isBlacklisted: true,
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
                  user: {
                    select: {
                      id: true,
                      email: true,
                      isBlacklisted: true,
                    },
                  },
                },
              },
            },
          },
          customer: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  isBlacklisted: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.helpTicket.findMany({
        select: {
          createdByUserId: true,
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isBlacklisted: true,
              blacklistedAt: true,
              blacklistedReason: true,
            },
          },
        },
      }),
    ]);

    const helpTicketCountByUserId = this.buildHelpTicketCountMap(helpTickets);

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

    const topWorkers = this.buildTopWorkers(jobs, helpTicketCountByUserId);
    const topCustomers = this.buildTopCustomers(
      jobs,
      reservations,
      helpTicketCountByUserId,
    );
    const topOrganisations = this.buildTopOrganisations(
      reservations,
      helpTicketCountByUserId,
    );

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
      topWorkers,
      topCustomers,
      topOrganisations,
      topProducts: this.buildTopProducts(reservations),
      ticketHeavyCustomers: this.buildTicketHeavyUsers(
        helpTickets,
        Role.CUSTOMER,
      ),
      ticketHeavyWorkers: this.buildTicketHeavyUsers(helpTickets, Role.WORKER),
      ticketHeavyOrganisations: this.buildTicketHeavyUsers(
        helpTickets,
        Role.ORGANISATION,
      ),
      blacklistedUsers: this.buildBlacklistedUsers(users, helpTicketCountByUserId),
      highlights: this.buildHighlights(
        monthlyActivity,
        topWorkers,
        topOrganisations,
      ),
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
      worker: {
        id: string;
        user: {
          id: string;
          name: string | null;
          email: string;
          isBlacklisted: boolean;
        };
      } | null;
    }>,
    helpTicketCountByUserId: Map<string, number>,
  ): TopWorkerAnalytics[] {
    const counts = new Map<string, TopWorkerAnalytics>();

    jobs.forEach((job) => {
      if (!job.worker) {
        return;
      }

      const workerName = job.worker.user.name ?? job.worker.user.email;
      const existing = counts.get(job.worker.user.id) ?? {
        id: job.worker.user.id,
        name: workerName,
        email: job.worker.user.email,
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        helpTicketCount: helpTicketCountByUserId.get(job.worker.user.id) ?? 0,
        isBlacklisted: job.worker.user.isBlacklisted,
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

      counts.set(job.worker.user.id, existing);
    });

    return Array.from(counts.values())
      .sort((left, right) =>
        right.completedJobs - left.completedJobs ||
        right.activeJobs - left.activeJobs ||
        right.totalJobs - left.totalJobs,
      )
      .slice(0, 10);
  }

  private buildTopCustomers(
    jobs: Array<{
      status: JobStatus;
      customer: {
        user: {
          id: string;
          name: string | null;
          email: string;
          isBlacklisted: boolean;
        };
      };
    }>,
    reservations: Array<{
      customer: {
        user: {
          id: string;
          name: string | null;
          email: string;
          isBlacklisted: boolean;
        };
      };
    }>,
    helpTicketCountByUserId: Map<string, number>,
  ): TopCustomerAnalytics[] {
    const counts = new Map<string, TopCustomerAnalytics>();

    jobs.forEach((job) => {
      const customerName = job.customer.user.name ?? job.customer.user.email;
      const existing = counts.get(job.customer.user.id) ?? {
        id: job.customer.user.id,
        name: customerName,
        email: job.customer.user.email,
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        reservations: 0,
        helpTicketCount: helpTicketCountByUserId.get(job.customer.user.id) ?? 0,
        isBlacklisted: job.customer.user.isBlacklisted,
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

      counts.set(job.customer.user.id, existing);
    });

    reservations.forEach((reservation) => {
      const customerName =
        reservation.customer.user.name ?? reservation.customer.user.email;
      const existing = counts.get(reservation.customer.user.id) ?? {
        id: reservation.customer.user.id,
        name: customerName,
        email: reservation.customer.user.email,
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        reservations: 0,
        helpTicketCount:
          helpTicketCountByUserId.get(reservation.customer.user.id) ?? 0,
        isBlacklisted: reservation.customer.user.isBlacklisted,
      };

      existing.reservations += 1;
      counts.set(reservation.customer.user.id, existing);
    });

    return Array.from(counts.values())
      .sort((left, right) =>
        right.totalJobs - left.totalJobs ||
        right.reservations - left.reservations ||
        right.completedJobs - left.completedJobs,
      )
      .slice(0, 10);
  }

  private buildTopOrganisations(
    reservations: Array<{
      quantity: number;
      status: ReservationStatus;
      product: {
        organisation: {
          businessName: string;
          user: {
            id: string;
            email: string;
            isBlacklisted: boolean;
          };
        };
      };
    }>,
    helpTicketCountByUserId: Map<string, number>,
  ): TopOrganisationAnalytics[] {
    const counts = new Map<string, TopOrganisationAnalytics>();

    reservations.forEach((reservation) => {
      const organisationName = reservation.product.organisation.businessName;
      const organisationUser = reservation.product.organisation.user;
      const existing = counts.get(organisationUser.id) ?? {
        id: organisationUser.id,
        name: organisationName,
        email: organisationUser.email,
        reservations: 0,
        pickedUpReservations: 0,
        quantity: 0,
        helpTicketCount: helpTicketCountByUserId.get(organisationUser.id) ?? 0,
        isBlacklisted: organisationUser.isBlacklisted,
      };

      existing.reservations += 1;
      existing.quantity += reservation.quantity;
      if (reservation.status === ReservationStatus.PICKED_UP) {
        existing.pickedUpReservations += 1;
      }

      counts.set(organisationUser.id, existing);
    });

    return Array.from(counts.values())
      .sort((left, right) =>
        right.reservations - left.reservations ||
        right.quantity - left.quantity ||
        right.pickedUpReservations - left.pickedUpReservations,
      )
      .slice(0, 10);
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
    topWorkers: TopWorkerAnalytics[],
    topOrganisations: TopOrganisationAnalytics[],
  ): AnalyticsHighlight[] {
    const topJobMonth = [...monthlyActivity].sort((left, right) => right.jobs - left.jobs)[0];
    const topReservationMonth = [...monthlyActivity].sort(
      (left, right) => right.reservations - left.reservations,
    )[0];
    const topWorker = topWorkers[0];
    const topOrganisation = topOrganisations[0];

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

  private buildHelpTicketCountMap(
    helpTickets: Array<{ createdByUserId: string }>,
  ) {
    return helpTickets.reduce<Map<string, number>>((counts, ticket) => {
      counts.set(
        ticket.createdByUserId,
        (counts.get(ticket.createdByUserId) ?? 0) + 1,
      );
      return counts;
    }, new Map<string, number>());
  }

  private buildTicketHeavyUsers(
    helpTickets: Array<{
      createdByUser: {
        id: string;
        name: string | null;
        email: string;
        role: Role;
        isBlacklisted: boolean;
        blacklistedAt: Date | null;
        blacklistedReason: string | null;
      };
    }>,
    role: Role,
  ): TicketHeavyUserAnalytics[] {
    const counts = new Map<string, TicketHeavyUserAnalytics>();

    helpTickets.forEach((ticket) => {
      if (ticket.createdByUser.role !== role) {
        return;
      }

      const user = ticket.createdByUser;
      if (user.isBlacklisted) {
        return;
      }

      const existing = counts.get(user.id) ?? {
        id: user.id,
        name: user.name ?? user.email,
        email: user.email,
        role: this.formatRole(user.role),
        helpTicketCount: 0,
        isBlacklisted: user.isBlacklisted,
        blacklistedAt: user.blacklistedAt,
        blacklistedReason: user.blacklistedReason ?? null,
      };

      existing.helpTicketCount += 1;
      counts.set(user.id, existing);
    });

    return Array.from(counts.values())
      .sort((left, right) => right.helpTicketCount - left.helpTicketCount)
      .slice(0, 10);
  }

  private buildBlacklistedUsers(
    users: Array<{
      id: string;
      name: string | null;
      email: string;
      role: Role;
      isBlacklisted: boolean;
      blacklistedAt: Date | null;
      blacklistedReason: string | null;
    }>,
    helpTicketCountByUserId: Map<string, number>,
  ): TicketHeavyUserAnalytics[] {
    const blacklistedUsers = users
      .filter((user) => user.isBlacklisted)
      .map((user) => ({
        id: user.id,
        name: user.name ?? user.email,
        email: user.email,
        role: this.formatRole(user.role),
        helpTicketCount: helpTicketCountByUserId.get(user.id) ?? 0,
        isBlacklisted: true,
        blacklistedAt: user.blacklistedAt,
        blacklistedReason: user.blacklistedReason,
      }));

    return blacklistedUsers.sort((left, right) => {
      const rightTime = right.blacklistedAt
        ? new Date(right.blacklistedAt).getTime()
        : 0;
      const leftTime = left.blacklistedAt ? new Date(left.blacklistedAt).getTime() : 0;
      return rightTime - leftTime || right.helpTicketCount - left.helpTicketCount;
    });
  }
  // ─── Escrow Control Panel ─────────────────────────────────────────────────

  /**
   * Returns all escrows for admin oversight (HELD, RELEASED, REFUNDED).
   */
  async getEscrows() {
    const escrows = await this.prisma.escrow.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        payment: {
          select: { id: true, status: true, amount: true, type: true },
        },
        reservation: {
          include: {
            product: {
              select: {
                name: true,
                organisation: { select: { businessName: true } },
              },
            },
            customer: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            budget: true,
            customer: { include: { user: { select: { id: true, name: true, email: true } } } },
            worker: { include: { user: { select: { id: true, name: true, email: true } } } },
          },
        },
      },
    });

    return escrows.map((escrow) => ({
      id: escrow.id,
      amount: escrow.amount,
      status: escrow.status,
      createdAt: escrow.createdAt,
      releasedAt: escrow.releasedAt,
      type: escrow.reservationId ? 'RESERVATION' : 'JOB',
      paymentStatus: escrow.payment?.status ?? null,
      // Reservation info
      productName: escrow.reservation?.product?.name ?? null,
      organisationName: escrow.reservation?.product?.organisation?.businessName ?? null,
      customerName: escrow.reservation?.customer?.user?.name ?? escrow.job?.customer?.user?.name ?? null,
      customerEmail: escrow.reservation?.customer?.user?.email ?? escrow.job?.customer?.user?.email ?? null,
      // Job info
      jobTitle: escrow.job?.title ?? null,
      workerName: escrow.job?.worker?.user?.name ?? null,
      workerEmail: escrow.job?.worker?.user?.email ?? null,
    }));
  }

  /**
   * Admin manually releases a HELD escrow → payee wallet credited.
   */
  async adminReleaseEscrow(escrowId: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
    });
    if (!escrow) throw new NotFoundException(`Escrow ${escrowId} not found`);

    await this.escrowService.releaseEscrow(escrowId);
    return { message: `Escrow ${escrowId} released. Payee wallet credited.` };
  }

  /**
   * Admin manually refunds a HELD escrow → customer wallet credited.
   */
  async adminRefundEscrow(escrowId: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
    });
    if (!escrow) throw new NotFoundException(`Escrow ${escrowId} not found`);

    await this.escrowService.refundEscrow(escrowId);
    return { message: `Escrow ${escrowId} refunded. Customer wallet credited.` };
  }
}
