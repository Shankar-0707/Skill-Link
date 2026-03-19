import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ReservationsService } from './reservations.service'

/**
 * Runs every 15 minutes and expires PENDING reservations
 * whose expiresAt has passed. This is the system-driven
 * PENDING → EXPIRED transition.
 *
 * Requires @nestjs/schedule to be installed and ScheduleModule.forRoot()
 * registered in AppModule.
 */
@Injectable()
export class ReservationExpiryTask {
  private readonly logger = new Logger(ReservationExpiryTask.name)

  constructor(private readonly reservationsService: ReservationsService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleExpiry(): Promise<void> {
    this.logger.debug('Running reservation expiry check...')

    try {
      const count = await this.reservationsService.expireOverdueReservations()
      if (count > 0) {
        this.logger.log(`Expired ${count} overdue reservation(s)`)
      }
    } catch (err) {
      this.logger.error(`Expiry cron failed: ${(err as Error).message}`)
    }
  }
}