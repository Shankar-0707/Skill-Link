import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformContractService } from './platform-contract.service';

/**
 * Central place for "worker must have signed platform contract" checks.
 */
@Injectable()
export class PlatformContractGateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly platformContractService: PlatformContractService,
  ) {}

  async assertWorkerContractSigned(workerId: string): Promise<void> {
    const contract = await this.platformContractService.ensureContract(workerId);

    if (!contract.isSigned) {
      throw new ForbiddenException({
        message: 'Platform fee contract must be signed before accessing jobs',
        code: 'PLATFORM_CONTRACT_NOT_SIGNED',
      });
    }
  }

  async assertUserWorkerContractSigned(userId: string): Promise<void> {
    const worker = await this.prisma.worker.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!worker) {
      throw new NotFoundException({
        message: 'Worker profile required',
        code: 'WORKER_PROFILE_REQUIRED',
      });
    }

    await this.assertWorkerContractSigned(worker.id);
  }

  async isUserWorkerContractSigned(userId: string): Promise<boolean> {
    const worker = await this.prisma.worker.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!worker) return false;

    const contract = await this.platformContractService.ensureContract(worker.id);
    return contract.isSigned;
  }
}
