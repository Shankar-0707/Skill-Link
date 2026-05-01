import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.worker.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.worker.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            profileImage: true,
          },
        },
      },
    });
  }

  async getProfileByUserId(userId: string) {
    return this.prisma.worker.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            profileImage: true,
          },
        },
      },
    });
  }

  async updateProfileByUserId(userId: string, data: Record<string, unknown>) {
    const {
      name: nameValue,
      profileImage: profileImageValue,
      ...workerData
    } = data;
    const name = typeof nameValue === 'string' ? nameValue : undefined;
    const profileImage =
      typeof profileImageValue === 'string' ? profileImageValue : undefined;

    // Update User record if name or profileImage is provided
    if (name || profileImage) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(profileImage && { profileImage }),
        },
      });
    }

    // Update Worker record
    const workerUpdateData = workerData as Prisma.WorkerUpdateInput;

    return this.prisma.worker.update({
      where: { userId },
      data: workerUpdateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            profileImage: true,
          },
        },
      },
    });
  }
}
