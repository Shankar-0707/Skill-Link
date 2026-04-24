import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type AdminUserSummary = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  isBlacklisted: boolean;
  blacklistedReason: string | null;
  blacklistedAt: Date | null;
  helpTicketCount: number;
  createdAt: Date;
  organisationName: string | null;
};

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(): Promise<AdminUserSummary[]> {
    const [users, helpTicketCounts] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: [{ createdAt: 'desc' }],
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          isBlacklisted: true,
          blacklistedReason: true,
          blacklistedAt: true,
          createdAt: true,
          organisation: {
            select: {
              businessName: true,
            },
          },
        },
      }),
      this.prisma.helpTicket.groupBy({
        by: ['createdByUserId'],
        _count: {
          createdByUserId: true,
        },
      }),
    ]);

    const helpTicketCountByUserId = new Map(
      helpTicketCounts.map((entry) => [
        entry.createdByUserId,
        entry._count.createdByUserId,
      ]),
    );

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      isBlacklisted: user.isBlacklisted,
      blacklistedReason: user.blacklistedReason,
      blacklistedAt: user.blacklistedAt,
      helpTicketCount: helpTicketCountByUserId.get(user.id) ?? 0,
      createdAt: user.createdAt,
      organisationName: user.organisation?.businessName ?? null,
    }));
  }

  async blacklistUser(
    targetUserId: string,
    adminUserId: string,
    reason?: string,
  ) {
    if (targetUserId === adminUserId) {
      throw new BadRequestException('Admin accounts cannot blacklist themselves.');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: targetUserId,
      },
      select: {
        id: true,
        role: true,
        isBlacklisted: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found.');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Admin accounts cannot be blacklisted.');
    }

    if (user.isBlacklisted) {
      return this.getUserById(targetUserId);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.updateMany({
        where: { userId: targetUserId, revoked: false },
        data: { revoked: true },
      });

      await tx.user.update({
        where: { id: targetUserId },
        data: {
          isBlacklisted: true,
          blacklistedReason: reason?.trim() || null,
          blacklistedAt: new Date(),
          blacklistedByUserId: adminUserId,
        },
      });
    });

    return this.getUserById(targetUserId);
  }

  async unblacklistUser(targetUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        deletedAt: true,
        isBlacklisted: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found.');
    }

    if (!user.isBlacklisted) {
      return this.getUserById(targetUserId);
    }

    await this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        isBlacklisted: false,
        blacklistedReason: null,
        blacklistedAt: null,
        blacklistedByUserId: null,
      },
    });

    return this.getUserById(targetUserId);
  }

  private async getUserById(userId: string): Promise<AdminUserSummary> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        isBlacklisted: true,
        blacklistedReason: true,
        blacklistedAt: true,
        createdAt: true,
        organisation: {
          select: {
            businessName: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const helpTicketCount = await this.prisma.helpTicket.count({
      where: { createdByUserId: userId },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      isBlacklisted: user.isBlacklisted,
      blacklistedReason: user.blacklistedReason,
      blacklistedAt: user.blacklistedAt,
      helpTicketCount,
      createdAt: user.createdAt,
      organisationName: user.organisation?.businessName ?? null,
    };
  }
}
