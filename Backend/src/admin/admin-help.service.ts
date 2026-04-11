import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HelpTicketStatus, Prisma } from '@prisma/client';
import {
  paginate,
  PaginationDto,
  parsePaginationInts,
} from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AdminHelpListQueryDto } from './dto/admin-help-query.dto';

const adminHelpTicketSelect = {
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
      quantity: true,
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
      customer: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
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
export class AdminHelpService {
  constructor(private readonly prisma: PrismaService) {}

  async listTickets(query: AdminHelpListQueryDto & PaginationDto) {
    const { status, all } = query;
    const { page, limit, skip } = parsePaginationInts(query);

    let where: Prisma.HelpTicketWhereInput = {};

    if (all === true) {
      if (status !== undefined) {
        where = { status };
      }
    } else {
      where = {
        status: status ?? HelpTicketStatus.OPEN,
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.helpTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        select: adminHelpTicketSelect,
      }),
      this.prisma.helpTicket.count({ where }),
    ]);

    return paginate(items, total, { page, limit } as PaginationDto);
  }

  async resolve(
    ticketId: string,
    adminUserId: string,
    resolutionNote?: string,
  ) {
    const ticket = await this.prisma.helpTicket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Help ticket not found');
    }

    if (ticket.status === HelpTicketStatus.RESOLVED) {
      return this.getTicketById(ticketId);
    }

    if (ticket.status !== HelpTicketStatus.OPEN) {
      throw new ConflictException('Only open tickets can be resolved');
    }

    const now = new Date();

    await this.prisma.helpTicket.update({
      where: { id: ticketId },
      data: {
        status: HelpTicketStatus.RESOLVED,
        resolutionNote: resolutionNote?.trim() || null,
        rejectionReason: null,
        reviewedByUserId: adminUserId,
        reviewedAt: now,
        resolvedAt: now,
      },
    });

    return this.getTicketById(ticketId);
  }

  async reject(
    ticketId: string,
    adminUserId: string,
    rejectionReason: string,
  ) {
    const ticket = await this.prisma.helpTicket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Help ticket not found');
    }

    if (ticket.status === HelpTicketStatus.REJECTED) {
      return this.getTicketById(ticketId);
    }

    if (ticket.status !== HelpTicketStatus.OPEN) {
      throw new ConflictException('Only open tickets can be rejected');
    }

    const now = new Date();

    await this.prisma.helpTicket.update({
      where: { id: ticketId },
      data: {
        status: HelpTicketStatus.REJECTED,
        rejectionReason: rejectionReason.trim(),
        resolutionNote: null,
        reviewedByUserId: adminUserId,
        reviewedAt: now,
        resolvedAt: null,
      },
    });

    return this.getTicketById(ticketId);
  }

  private getTicketById(ticketId: string) {
    return this.prisma.helpTicket.findUnique({
      where: { id: ticketId },
      select: adminHelpTicketSelect,
    });
  }
}
