import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KycStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export const PLATFORM_FEE_PERCENT = 10;

@Injectable()
export class PlatformContractService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureContract(workerId: string) {
    const existing = await this.prisma.workerPlatformContract.findUnique({
      where: { workerId },
    });

    if (existing) return existing;

    return this.prisma.workerPlatformContract.create({
      data: {
        workerId,
        platformFeePercent: PLATFORM_FEE_PERCENT,
      },
    });
  }

  async getStatusByUserId(userId: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { userId },
      select: { id: true, kycStatus: true },
    });

    if (!worker) {
      throw new NotFoundException({
        message: 'Worker profile not found',
        code: 'WORKER_PROFILE_REQUIRED',
      });
    }

    const contract = await this.ensureContract(worker.id);

    return {
      kycStatus: worker.kycStatus,
      isSigned: contract.isSigned,
      platformFeePercent: contract.platformFeePercent,
      signedAt: contract.signedAt,
      canSign: worker.kycStatus === KycStatus.VERIFIED && !contract.isSigned,
    };
  }

  async signByUserId(userId: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { userId },
      select: { id: true, kycStatus: true },
    });

    if (!worker) {
      throw new NotFoundException({
        message: 'Worker profile not found',
        code: 'WORKER_PROFILE_REQUIRED',
      });
    }

    if (worker.kycStatus !== KycStatus.VERIFIED) {
      throw new ForbiddenException({
        message: 'Complete KYC verification before signing the platform contract',
        code: 'KYC_NOT_VERIFIED',
      });
    }

    const contract = await this.ensureContract(worker.id);

    if (contract.isSigned) {
      throw new BadRequestException({
        message: 'Platform contract is already signed',
        code: 'PLATFORM_CONTRACT_ALREADY_SIGNED',
      });
    }

    const signed = await this.prisma.workerPlatformContract.update({
      where: { workerId: worker.id },
      data: {
        isSigned: true,
        signedAt: new Date(),
      },
    });

    return {
      isSigned: signed.isSigned,
      platformFeePercent: signed.platformFeePercent,
      signedAt: signed.signedAt,
    };
  }
}
