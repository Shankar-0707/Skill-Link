import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type AdminUserSummary = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  organisationName: string | null;
};

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(): Promise<AdminUserSummary[]> {
    const users = await this.prisma.user.findMany({
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
        createdAt: true,
        organisation: {
          select: {
            businessName: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      organisationName: user.organisation?.businessName ?? null,
    }));
  }
}
