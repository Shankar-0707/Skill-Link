import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, PaginationDto } from '../common/dto/pagination.dto';
import {
  ListOrganisationsDto,
  UpdateOrganisationDto,
} from './organisation.dto';

@Injectable()
export class OrganisationsService {
  private readonly logger = new Logger(OrganisationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Public: List all Organisations

  async findAll(query: ListOrganisationsDto & PaginationDto) {
    const { businessType, search, skip, limit, page } = query;

    const where = {
      deletedAt: null,
      ...(businessType && { businessType }),
      ...(search && {
        businessName: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.organisation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ratingAvg: 'desc' },
        select: {
          id: true,
          userId: true,
          businessName: true,
          businessType: true,
          description: true,
          ratingAvg: true,
          ratingCount: true,
          createdAt: true,
          updatedAt: true,
          // Do NOT expose user.passwordHash - select only safe fields
          user: {
            select: {
              id: true,
              email: true,
              profileImage: true,
              isActive: true,
            },
          },
        },
      }),
      this.prisma.organisation.count({ where }),
    ]);

    return paginate(items, total, { page, limit } as PaginationDto);
  }

  // Public: Get One organisation with products

  async findOne(id: string) {
    const org = await this.prisma.organisation.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profileImage: true,
            isActive: true,
          },
        },
        products: {
          where: { isActive: true, deletedAt: null },
          include: {
            images: { take: 1, orderBy: { createdAt: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20, // First page of the products
        },
      },
    });

    if (!org) throw new NotFoundException('organistaion not found');
    return org;
  }

  // Org: get own Profile

  async findMyProfile(userId: string) {
    const org = await this.prisma.organisation.findFirst({
      where: { userId, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            profileImage: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!org) throw new NotFoundException('organisation profile not found');
    return org;
  }

  // Org: Update own profile

  async update(userId: string, dto: UpdateOrganisationDto) {
    // Find the org that belongs to this user
    const org = await this.prisma.organisation.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!org) throw new NotFoundException('Organisation profile not found');

    const updated = await this.prisma.organisation.update({
      where: { id: org.id },
      data: {
        ...(dto.businessName && { businessName: dto.businessName }),
        ...(dto.businessType && { businessType: dto.businessType }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });

    this.logger.log(`Organisation ${org.id} updated by user ${userId}`);
    return updated;
  }

  // Internal Helper: resolev organisationId from userid

  async resolveOrgId(userId: string): Promise<string> {
    const org = await this.prisma.organisation.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    if (!org) throw new NotFoundException('Organisation profile not found');
    return org.id;
  }
}
