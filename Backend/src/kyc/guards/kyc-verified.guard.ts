import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { KycStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

/**
 * Use after JwtAuthGuard. Ensures the authenticated user has a worker profile
 * with Worker.kycStatus === VERIFIED (e.g. withdrawals, sensitive worker actions).
 */
@Injectable()
export class KycVerifiedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = req.user;
    if (!user?.sub) {
      throw new ForbiddenException({
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const worker = await this.prisma.worker.findUnique({
      where: { userId: user.sub },
      select: { kycStatus: true },
    });

    if (!worker) {
      throw new ForbiddenException({
        message: 'Worker profile required',
        code: 'WORKER_PROFILE_REQUIRED',
      });
    }

    if (worker.kycStatus !== KycStatus.VERIFIED) {
      throw new ForbiddenException({
        message: 'Verified KYC is required for this action',
        code: 'KYC_NOT_VERIFIED',
      });
    }

    return true;
  }
}
