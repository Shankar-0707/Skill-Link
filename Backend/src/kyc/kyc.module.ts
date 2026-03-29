import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { KycController } from './kyc.controller';
import { KycGateService } from './kyc-gate.service';
import { KycService } from './kyc.service';
import { KycVerifiedGuard } from './guards/kyc-verified.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [KycController],
  providers: [KycService, KycGateService, KycVerifiedGuard],
  exports: [KycGateService, KycVerifiedGuard],
})
export class KycModule {}
