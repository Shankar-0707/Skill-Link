import { Module } from '@nestjs/common';
import { EscrowService } from './escrow.service';

/**
 * EscrowModule is imported by ReservationsModule and JobsModule.
 * It is NOT global — only modules that need it import it explicitly.
 */

@Module({
  providers: [EscrowService],
  exports: [EscrowService],
})
export class EscrowModule {}
