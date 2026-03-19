import { Module } from '@nestjs/common'
import { ReservationsController } from './reservations.controller'
import { ReservationsService } from './reservations.service'
import { ReservationExpiryTask } from './reservation-expiry.tasks'
import { EscrowModule } from '../escrow/escrow.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [EscrowModule, AuthModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationExpiryTask],
  exports: [ReservationsService],
})
export class ReservationsModule {}