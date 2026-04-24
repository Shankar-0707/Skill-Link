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

  private calculateGrowth(currentMonthCount: number, previousMonthCount: number) {
    if (previousMonthCount === 0) {
      return currentMonthCount > 0 ? 100 : 0;
    }

    return Number(
      (((currentMonthCount - previousMonthCount) / previousMonthCount) * 100).toFixed(1),
    );
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
