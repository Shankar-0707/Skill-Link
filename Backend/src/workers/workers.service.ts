import { Injectable } from '@nestjs/common';
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
}
