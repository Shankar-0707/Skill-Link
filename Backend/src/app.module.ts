import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkersModule } from './workers/workers.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { ProductsModule } from './products/products.module';
import { JobsModule } from './jobs/jobs.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PaymentsModule } from './payments/payments.module';
import { EscrowModule } from './escrow/escrow.module';
import { KycModule } from './kyc/kyc.module';

@Module({
  imports: [AuthModule, UsersModule, WorkersModule, OrganisationsModule, ProductsModule, JobsModule, ReservationsModule, PaymentsModule, EscrowModule, KycModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
