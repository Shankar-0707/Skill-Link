import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KycStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Central place for "worker must be KYC verified" checks (jobs, payments, etc.).
 */
@Injectable()
export class KycGateService {
  constructor(private readonly prisma: PrismaService) {}

  async assertWorkerKycVerified(workerId: string): Promise<void> {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { kycStatus: true },
    });
    if (!worker) {
      throw new NotFoundException({
        message: 'Worker not found',
        code: 'WORKER_NOT_FOUND',
      });
    }
    if (worker.kycStatus !== KycStatus.VERIFIED) {
      throw new BadRequestException({
        message: 'Worker KYC is not verified',
        code: 'KYC_NOT_VERIFIED',
      });
    }
  }

  async assertUserWorkerKycVerified(userId: string): Promise<void> {
    const worker = await this.prisma.worker.findUnique({
      where: { userId },
      select: { id: true, kycStatus: true },
    });
    if (!worker) {
      throw new ForbiddenException({
        message: 'Worker profile required',
        code: 'WORKER_PROFILE_REQUIRED',
      });
    }
    if (worker.kycStatus !== KycStatus.VERIFIED) {
      throw new ForbiddenException({
        message: 'Worker KYC must be verified for this action',
        code: 'KYC_NOT_VERIFIED',
      });
    }
  }
}
