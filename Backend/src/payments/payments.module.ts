import { Module } from '@nestjs/common';
import { KycModule } from '../kyc/kyc.module';
import { PaymentsService } from './payments.service';

@Module({
  imports: [KycModule],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
