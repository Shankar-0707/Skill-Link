import { Injectable } from '@nestjs/common';
import { KycGateService } from '../kyc/kyc-gate.service';

/**
 * Call `assertWithdrawAllowed` from withdrawal flows once payouts are implemented.
 */
@Injectable()
export class PaymentsService {
  constructor(private readonly kycGate: KycGateService) {}

  async assertWithdrawAllowed(userId: string): Promise<void> {
    await this.kycGate.assertUserWorkerKycVerified(userId);
  }
}
