import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { KycModule } from '../kyc/kyc.module';
import { WorkersModule } from '../workers/workers.module';
import { PaymentsModule } from '../payments/payments.module';
import { EscrowModule } from '../escrow/escrow.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { JobLifecycleTask } from './job-lifecycle.task';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    KycModule,
    WorkersModule,
    PaymentsModule,
    EscrowModule,
    RealtimeModule,
    InvoiceModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, JobLifecycleTask],
  exports: [JobsService],
})
export class JobsModule {}

