import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KycStatus, Prisma } from '@prisma/client';
import { KycRequestStatus } from '../kyc/kyc-request-status';
import { PrismaService } from '../prisma/prisma.service';
import {
  paginate,
  PaginationDto,
  parsePaginationInts,
} from '../common/dto/pagination.dto';
import { AdminKycListQueryDto } from './dto/admin-kyc-query.dto';

@Injectable()
export class AdminKycService {
  constructor(private readonly prisma: PrismaService) {}

  async listRequests(query: AdminKycListQueryDto & PaginationDto) {
    const { status, all } = query;
    const { page, limit, skip } = parsePaginationInts(query);

    let where: Prisma.KycRequestWhereInput = {};
    if (all === true) {
      if (status !== undefined)
        where = { status } as Prisma.KycRequestWhereInput;
    } else {
      where = {
        status: status ?? KycRequestStatus.PENDING,
      } as Prisma.KycRequestWhereInput;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.kycRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          worker: {
            select: {
              id: true,
              kycStatus: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  phone: true,
                  profileImage: true,
                },
              },
            },
          },
          documents: {
            select: {
              id: true,
              documentType: true,
              documentUrl: true,
              status: true,
              createdAt: true,
            },
          },
          _count: { select: { documents: true } },
        } as Prisma.KycRequestInclude,
      }),
      this.prisma.kycRequest.count({ where }),
    ]);

    return paginate(items, total, { page, limit } as PaginationDto);
  }

  async approve(requestId: string, adminUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const req = await tx.kycRequest.findUnique({
        where: { id: requestId },
        include: {
          worker: { select: { id: true, kycStatus: true } },
        },
      });

      if (!req) {
        throw new NotFoundException({
          message: 'KYC request not found',
          code: 'KYC_REQUEST_NOT_FOUND',
        });
      }

      if (req.status === KycRequestStatus.VERIFIED) {
        return {
          id: req.id,
          status: req.status,
          message: 'Already verified',
          workerKycStatus: req.worker.kycStatus,
        };
      }

      if (req.status !== KycRequestStatus.PENDING) {
        throw new ConflictException({
          message: 'Only pending requests can be approved',
          code: 'KYC_REQUEST_NOT_PENDING',
        });
      }

      const now = new Date();

      await tx.kycRequest.update({
        where: { id: requestId },
        data: {
          status: KycRequestStatus.VERIFIED,
          verifiedAt: now,
          reviewedBy: adminUserId,
          reviewedAt: now,
          rejectionReason: null,
        } as Prisma.KycRequestUpdateInput,
      });

      await tx.worker.update({
        where: { id: req.workerId },
        data: { kycStatus: KycStatus.VERIFIED },
      });

      await tx.workerDocument.updateMany({
        where: { kycRequestId: requestId } as Prisma.WorkerDocumentWhereInput,
        data: {
          status: 'VERIFIED',
          verifiedAt: now,
          verifiedBy: adminUserId,
        },
      });

      return tx.kycRequest.findUnique({
        where: { id: requestId },
        include: {
          worker: {
            select: {
              id: true,
              kycStatus: true,
              user: {
                select: { id: true, email: true, name: true, phone: true },
              },
            },
          },
          documents: true,
        } as Prisma.KycRequestInclude,
      });
    });
  }

  async reject(
    requestId: string,
    adminUserId: string,
    rejectionReason: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const req = await tx.kycRequest.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          status: true,
          workerId: true,
          rejectionReason: true,
          worker: { select: { id: true, kycStatus: true } },
        } as Prisma.KycRequestSelect,
      });

      if (!req) {
        throw new NotFoundException({
          message: 'KYC request not found',
          code: 'KYC_REQUEST_NOT_FOUND',
        });
      }

      if (req.status === KycRequestStatus.REJECTED) {
        const reason = (req as typeof req & { rejectionReason?: string | null })
          .rejectionReason;
        return {
          id: req.id,
          status: req.status,
          message: 'Already rejected',
          rejectionReason: reason,
          workerKycStatus: req.worker.kycStatus,
        };
      }

      if (req.status !== KycRequestStatus.PENDING) {
        throw new ConflictException({
          message: 'Only pending requests can be rejected',
          code: 'KYC_REQUEST_NOT_PENDING',
        });
      }

      const now = new Date();

      await tx.kycRequest.update({
        where: { id: requestId },
        data: {
          status: KycRequestStatus.REJECTED,
          rejectionReason,
          reviewedBy: adminUserId,
          reviewedAt: now,
          verifiedAt: null,
        } as Prisma.KycRequestUpdateInput,
      });

      await tx.worker.update({
        where: { id: req.workerId },
        data: { kycStatus: KycStatus.REJECTED },
      });

      await tx.workerDocument.updateMany({
        where: { kycRequestId: requestId } as Prisma.WorkerDocumentWhereInput,
        data: {
          status: 'REJECTED',
          verifiedAt: null,
          verifiedBy: null,
        },
      });

      return tx.kycRequest.findUnique({
        where: { id: requestId },
        include: {
          worker: {
            select: {
              id: true,
              kycStatus: true,
              user: {
                select: { id: true, email: true, name: true, phone: true },
              },
            },
          },
          documents: true,
        } as Prisma.KycRequestInclude,
      });
    });
  }
}
