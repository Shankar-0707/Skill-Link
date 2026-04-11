import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { EscrowModule } from './escrow/escrow.module';
import { HelpModule } from './help/help.module';
import { JobsModule } from './jobs/jobs.module';
import { KycModule } from './kyc/kyc.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './storage/storage.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ReservationsModule } from './reservations/reservations.module';
import { UsersModule } from './users/users.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    StorageModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkersModule,
    OrganisationsModule,
    ProductsModule,
    JobsModule,
    ReservationsModule,
    PaymentsModule,
    EscrowModule,
    HelpModule,
    KycModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
