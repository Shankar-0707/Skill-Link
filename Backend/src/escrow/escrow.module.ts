import { Module } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { PaymentsModule } from '../payments/payments.module';

/**
 * EscrowModule is imported by ReservationsModule, JobsModule, and AdminModule.
 * It is NOT global — only modules that need it import it explicitly.
 *
 * Imports PaymentsModule to access WalletService for crediting wallets on release/refund.
 */
@Module({
  imports: [PaymentsModule],
  providers: [EscrowService],
  exports: [EscrowService],
})
export class EscrowModule {}
