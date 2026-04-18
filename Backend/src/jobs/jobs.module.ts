import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { KycModule } from '../kyc/kyc.module';
import { PaymentsModule } from '../payments/payments.module';
import { EscrowModule } from '../escrow/escrow.module';

@Module({
  imports: [PrismaModule, AuthModule, KycModule, PaymentsModule, EscrowModule],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
