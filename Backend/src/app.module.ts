import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'

import { PrismaModule } from './prisma/prisma.module'
import { EscrowModule } from './escrow/escrow.module'
import { OrganisationsModule } from './organisations/organisations.module'
import { ProductsModule } from './products/products.module'
import { ReservationsModule } from './reservations/reservations.module'
import { JobsModule } from './jobs/jobs.module'


// To be commented when vidhits work is done
import { APP_GUARD } from '@nestjs/core'
import { MockAuthGuard } from './common/guards/mock-auth.guard'
// Vidhit's module — import once it's ready
// import { AuthModule } from './auth/auth.module'
// Udit's module — import once it's ready
// import { JobsModule } from './jobs/jobs.module'

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: MockAuthGuard, // Overrides JwtAuthGuard Gloabally
    }
  ],
  imports: [
    // ── Config (must be first so all modules can read env vars) ──────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Rate limiting (global — 100 req / 60s per IP) ────────────────────
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,   // 60 seconds
        limit: 100,
      },
    ]),

    // ── Cron jobs ────────────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ── Core ─────────────────────────────────────────────────────────────
    PrismaModule,      // @Global — available everywhere without importing
    EscrowModule,      // Shared between reservations and jobs

    // ── Feature modules ──────────────────────────────────────────────────
    OrganisationsModule,
    ProductsModule,
    ReservationsModule,

    // AuthModule,     // Vidhit
    JobsModule,     // Udit
    // WorkersModule,  // Udit
    
  ],
})
export class AppModule {}