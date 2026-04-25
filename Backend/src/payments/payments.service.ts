import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, PaymentStatus, EscrowStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from './wallet.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  // ─── Order Creation ───────────────────────────────────────────────────────

  /**
   * Creates a Payment record in INITIATED state and returns a mock checkout URL.
   * Called when a customer creates a reservation or a job payment is triggered.
   */
  async createPaymentOrder(data: {
    userId: string;
    amount: number;
    originalAmount?: number;
    platformFee?: number;
    type: string;
    reservationId?: string;
    jobId?: string;
  }, tx?: Prisma.TransactionClient) {
    const providerPaymentId = `mock_pay_${uuidv4()}`;
    const checkoutUrl = `/mock-checkout?paymentId=${providerPaymentId}`;

    const client = tx ?? this.prisma;

    const payment = await client.payment.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        status: PaymentStatus.INITIATED,
        idempotencyKey: providerPaymentId,
        providerPaymentId,
        checkoutUrl,
        reservationId: data.reservationId ?? null,
        jobId: data.jobId ?? null,
      },
    });

    this.logger.log(
      `Payment order created: ${providerPaymentId} for ₹${data.amount} (base: ₹${data.originalAmount ?? data.amount}) [${data.type}]`,
    );

    return {
      paymentId: payment.id,
      providerPaymentId,
      checkoutUrl,
      amount: payment.amount,
      originalAmount: data.originalAmount ?? data.amount,
      platformFee: data.platformFee ?? 0,
    };
  }

  // ─── Mock Checkout ────────────────────────────────────────────────────────

  /**
   * Returns the payment info needed for the mock checkout page.
   */
  async getPaymentForCheckout(providerPaymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { providerPaymentId },
      include: {
        reservation: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                organisation: { select: { businessName: true } },
              },
            },
          },
        },
        job: { select: { id: true, title: true, budget: true } },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.INITIATED) {
      throw new BadRequestException(
        `Payment is already ${payment.status}. Cannot checkout again.`,
      );
    }

    return payment;
  }

  /**
   * Finalizes a successful payment.
   * Called by the frontend after a successful Razorpay checkout.
   *
   * Actions:
   *  1. Marks Payment → SUCCESS
   *  2. Creates Escrow in HELD state (or activates existing one)
   *  3. Links Payment ↔ Escrow
   * Returns a redirect URL for the frontend.
   */
  async handlePaymentSuccess(providerPaymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { providerPaymentId },
      include: {
        reservation: { include: { escrow: true } },
        job: { include: { escrow: true } },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.INITIATED) {
      throw new BadRequestException(
        `Payment ${providerPaymentId} is already ${payment.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark payment as SUCCESS
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.SUCCESS },
      });

      let escrowId: string;

      if (payment.reservationId) {
        // 2a. Reservation flow — create escrow and link payment
        if (payment.reservation?.escrow) {
          // Escrow already exists (edge case), just link and set HELD
          escrowId = payment.reservation.escrow.id;
          await tx.escrow.update({
            where: { id: escrowId },
            data: { status: EscrowStatus.HELD, paymentId: payment.id },
          });
        } else {
          // Normal case — create fresh escrow
          // Derive fee split: 5% of net = payment.amount / 1.05 * 0.05
          const originalAmount = Math.round((payment.amount / 1.05) * 100) / 100;
          const platformFee = Math.round((payment.amount - originalAmount) * 100) / 100;
          const escrow = await tx.escrow.create({
            data: {
              reservationId: payment.reservationId,
              amount: payment.amount,
              originalAmount,
              platformFee,
              status: EscrowStatus.HELD,
              paymentId: payment.id,
            },
          });
          escrowId = escrow.id;
        }
        this.logger.log(
          `Payment ${providerPaymentId} CONFIRMED. Escrow ${escrowId} HELD for reservation ${payment.reservationId}.`,
        );
        return {
          success: true,
          redirectUrl: `/user/products/reservations/${payment.reservationId}`,
        };
      } else if (payment.jobId) {
        // 2b. Job flow — create escrow and link payment
        if (payment.job?.escrow) {
          escrowId = payment.job.escrow.id;
          await tx.escrow.update({
            where: { id: escrowId },
            data: { status: EscrowStatus.HELD, paymentId: payment.id },
          });
        } else {
          const escrow = await tx.escrow.create({
            data: {
              jobId: payment.jobId,
              amount: payment.amount,
              status: EscrowStatus.HELD,
              paymentId: payment.id,
            },
          });
          escrowId = escrow.id;
        }
        this.logger.log(
          `Payment ${providerPaymentId} CONFIRMED. Escrow ${escrowId} HELD for job ${payment.jobId}.`,
        );
        return {
          success: true,
          redirectUrl: `/user/job-detail/${payment.jobId}`,
        };
      }

      throw new BadRequestException(
        'Payment has no linked reservation or job.',
      );
    });
  }

  /**
   * Handles a payment failure (marks INITIATED → FAILED).
   */
  async handlePaymentFailure(providerPaymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { providerPaymentId },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.INITIATED) {
      throw new BadRequestException(`Payment is already ${payment.status}`);
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });

    this.logger.log(`Payment ${providerPaymentId} marked as FAILED.`);

    return {
      success: false,
      redirectUrl: payment.reservationId
        ? `/user/products/reservations`
        : `/user/my-jobs`,
    };
  }

  // ─── Refund (called by EscrowService or Admin) ───────────────────────────

  /**
   * Marks a payment as REFUNDED and credits the customer's virtual wallet.
   * Called by EscrowService.refundEscrow() or admin actions.
   */
  async processRefund(
    paymentId: string,
    customerUserId: string,
    amount: number,
    escrowId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    await client.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.REFUNDED },
    });

    // Credit customer's virtual wallet with the refund
    await this.walletService.creditWallet(
      customerUserId,
      amount,
      `Refund — Escrow #${escrowId.substring(0, 8)}`,
      escrowId,
      client,
    );

    this.logger.log(
      `Refund of ₹${amount} processed for payment ${paymentId}. Credited to user ${customerUserId}.`,
    );
  }

  // ─── Wallet Passthrough ───────────────────────────────────────────────────

  /**
   * Get the wallet for the currently logged-in user.
   */
  async getMyWallet(userId: string) {
    return this.walletService.getWallet(userId);
  }

  /**
   * Kept for backward compatibility with KycGate usage.
   */
  async assertWithdrawAllowed(_userId: string): Promise<void> {
    // Future: check KYC before allowing withdrawals
  }
}
