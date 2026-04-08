import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHelpTicketDto } from './dto/create-help-ticket.dto';

const helpTicketSelect = {
  id: true,
  ticketNumber: true,
  subject: true,
  message: true,
  status: true,
  jobId: true,
  reservationId: true,
  workerId: true,
  organisationId: true,
  createdByUserId: true,
  resolutionNote: true,
  rejectionReason: true,
  reviewedAt: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
  createdByUser: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  },
  reviewedByUser: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  reservation: {
    select: {
      id: true,
      status: true,
      product: {
        select: {
          id: true,
          name: true,
          organisationId: true,
          organisation: {
            select: {
              id: true,
              businessName: true,
            },
          },
        },
      },
    },
  },
  job: {
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      budget: true,
      customer: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
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
              phone: true,
            },
          },
        },
      },
    },
  },
  worker: {
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  },
  organisation: {
    select: {
      id: true,
      userId: true,
      businessName: true,
      businessType: true,
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
        },
      },
    },
  },
} as Prisma.HelpTicketSelect;

@Injectable()
export class HelpService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(userId: string, dto: CreateHelpTicketDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer: { select: { id: true } },
        worker: { select: { id: true, userId: true } },
        organisation: { select: { id: true, userId: true } },
      },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const jobId = dto.jobId ?? null;
    const reservationId = dto.reservationId ?? null;
    const workerId = dto.workerId ?? user.worker?.id ?? null;
    const organisationId =
      dto.organisationId ?? user.organisation?.id ?? null;

    await Promise.all([
      jobId ? this.assertJobAccess(jobId, userId, user.role) : Promise.resolve(),
      reservationId
        ? this.assertReservationAccess(reservationId, userId, user.role)
        : Promise.resolve(),
      workerId ? this.assertWorkerAccess(workerId, userId, user.role) : Promise.resolve(),
      organisationId
        ? this.assertOrganisationAccess(organisationId, userId, user.role)
        : Promise.resolve(),
    ]);

    const created = await this.prisma.helpTicket.create({
      data: {
        ticketNumber: this.generateTicketNumber(),
        createdByUserId: userId,
        subject: dto.subject.trim(),
        message: dto.message.trim(),
        jobId,
        reservationId,
        workerId,
        organisationId,
      } as Prisma.HelpTicketUncheckedCreateInput,
      select: helpTicketSelect,
    });

    return created;
  }

  async getMyTickets(userId: string) {
    return this.prisma.helpTicket.findMany({
      where: {
        createdByUserId: userId,
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      select: helpTicketSelect,
    });
  }

  private async assertReservationAccess(
    reservationId: string,
    userId: string,
    role: Role,
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        customer: {
          select: {
            userId: true,
          },
        },
        product: {
          select: {
            organisation: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const isCustomerOwner = reservation.customer.userId === userId;
    const isOrganisationOwner = reservation.product.organisation.userId === userId;

    if (role === Role.CUSTOMER && !isCustomerOwner) {
      throw new ForbiddenException('You can only attach your own reservation');
    }

    if (role === Role.ORGANISATION && !isOrganisationOwner) {
      throw new ForbiddenException(
        'You can only attach reservations for your organisation',
      );
    }
  }

  private async assertJobAccess(jobId: string, userId: string, role: Role) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        customer: {
          select: {
            userId: true,
          },
        },
        worker: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const isCustomerOwner = job.customer.userId === userId;
    const isAssignedWorker = job.worker?.userId === userId;

    if (role === Role.CUSTOMER && !isCustomerOwner) {
      throw new ForbiddenException('You can only attach your own job');
    }

    if (role === Role.WORKER && !isAssignedWorker) {
      throw new ForbiddenException('You can only attach your assigned job');
    }
  }

  private async assertWorkerAccess(workerId: string, userId: string, role: Role) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { id: true, userId: true },
    });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    if (role === Role.WORKER && worker.userId !== userId) {
      throw new ForbiddenException('You can only attach your own worker profile');
    }
  }

  private async assertOrganisationAccess(
    organisationId: string,
    userId: string,
    role: Role,
  ) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      select: { id: true, userId: true },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    if (role === Role.ORGANISATION && organisation.userId !== userId) {
      throw new ForbiddenException(
        'You can only attach your own organisation profile',
      );
    }
  }

  private generateTicketNumber() {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = randomBytes(3).toString('hex').toUpperCase();
    return `TKT-${datePart}-${randomPart}`;
  }
}
