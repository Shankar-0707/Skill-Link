import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EscrowStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../payments/wallet.service';

/**
 * EscrowService owns ALL escrow state transitions.
 * Both the reservations flow (your domain) and the jobs flow (Udit's domain)
 * must call this service — never update escrow.status directly elsewhere.
 *
 * When escrow is RELEASED → the org/worker gets their virtual wallet credited.
 * When escrow is REFUNDED → the customer gets their virtual wallet credited.
 */
@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * Creates a new HELD escrow record.
   * Called inside a transaction from ReservationService or JobService.
   */
  async createEscrow(
    data: { jobId?: string; reservationId?: string; amount: number; paymentId?: string },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    if (!data.jobId && !data.reservationId) {
      throw new BadRequestException(
        'Escrow must be linked to a job or reservation',
      );
    }

    return client.escrow.create({
      data: {
        jobId: data.jobId,
        reservationId: data.reservationId,
        paymentId: data.paymentId ?? null,
        amount: data.amount,
        status: EscrowStatus.HELD,
      },
    });
  }

  /**
   * Releases escrow funds to the payee (worker / organisation).
   * Triggered when: job COMPLETED or reservation PICKED_UP (OTP verified).
   *
   * Side-effect: Credits the payee's virtual wallet.
   */
  async releaseEscrow(escrowId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    // Load escrow with full relations to find the payee
    const escrow = await client.escrow.findUnique({
      where: { id: escrowId },
      include: {
        reservation: {
          include: {
            product: {
              include: {
                organisation: { select: { userId: true, businessName: true } },
              },
            },
          },
        },
        job: {
          include: {
            worker: { select: { userId: true } },
          },
        },
      },
    });

    if (!escrow) throw new NotFoundException(`Escrow ${escrowId} not found`);
    if (escrow.status !== EscrowStatus.HELD) {
      throw new BadRequestException(
        `Cannot release escrow with status: ${escrow.status}. Must be HELD.`,
      );
    }

    // Mark escrow RELEASED
    const updated = await client.escrow.update({
      where: { id: escrowId },
      data: {
        status: EscrowStatus.RELEASED,
        releasedAt: new Date(),
      },
    });

    // Determine payee and credit their wallet (only originalAmount — NOT the full amount)
    let payeeUserId: string | null = null;
    let payeeLabel = '';

    if (escrow.reservation?.product?.organisation?.userId) {
      payeeUserId = escrow.reservation.product.organisation.userId;
      payeeLabel = escrow.reservation.product.organisation.businessName;
    } else if (escrow.job?.worker?.userId) {
      payeeUserId = escrow.job.worker.userId;
      payeeLabel = `Worker (Job #${escrow.jobId?.substring(0, 8)})`;
    }

    const payoutAmount = escrow.originalAmount > 0 ? escrow.originalAmount : escrow.amount;
    const feeAmount = escrow.platformFee ?? 0;
    const noteType = escrow.reservationId ? 'Reservation' : 'Job';

    if (payeeUserId) {
      await this.walletService.creditWallet(
        payeeUserId,
        payoutAmount,
        `${noteType} payout — Escrow #${escrowId.substring(0, 8)} (${payeeLabel})`,
        escrowId,
        client,
      );
      this.logger.log(
        `Escrow ${escrowId} RELEASED. ₹${payoutAmount} credited to ${payeeUserId} (${payeeLabel}).`,
      );
    } else {
      this.logger.warn(
        `Escrow ${escrowId} released but no payee found to credit wallet!`,
      );
    }

    // Credit 5% platform fee to the admin wallet
    if (feeAmount > 0) {
      const adminUser = await client.user.findFirst({
        where: { role: Role.ADMIN },
        select: { id: true },
      });
      if (adminUser) {
        await this.walletService.creditWallet(
          adminUser.id,
          feeAmount,
          `Platform Fee (5%) — ${noteType} Escrow #${escrowId.substring(0, 8)}`,
          escrowId,
          client,
        );
        this.logger.log(
          `Platform fee ₹${feeAmount} credited to admin wallet (user: ${adminUser.id}).`,
        );
      } else {
        this.logger.warn('No admin user found to credit platform fee!');
      }
    }

    return updated;
  }

  /**
   * Refunds escrow back to the customer.
   * Triggered when: job CANCELLED or reservation CANCELLED/EXPIRED/REJECTED.
   *
   * Side-effect: Credits the customer's virtual wallet.
   */
  async refundEscrow(escrowId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    // Load escrow with full relations to find the customer
    const escrow = await client.escrow.findUnique({
      where: { id: escrowId },
      include: {
        reservation: {
          include: {
            customer: { include: { user: { select: { id: true } } } },
          },
        },
        job: {
          include: {
            customer: { include: { user: { select: { id: true } } } },
          },
        },
        payment: true,
      },
    });

    if (!escrow) throw new NotFoundException(`Escrow ${escrowId} not found`);
    if (escrow.status !== EscrowStatus.HELD) {
      throw new BadRequestException(
        `cannot refund escrow with status: ${escrow.status}. Must be HELD.`,
      );
    }

    const updated = await client.escrow.update({
      where: { id: escrowId },
      data: { status: EscrowStatus.REFUNDED },
    });

    // Determine customer userId
    let customerUserId: string | null = null;

    if (escrow.reservation?.customer?.user?.id) {
      customerUserId = escrow.reservation.customer.user.id;
    } else if (escrow.job?.customer?.user?.id) {
      customerUserId = escrow.job.customer.user.id;
    }

    if (customerUserId) {
      // Mark payment as refunded if linked
      if (escrow.payment) {
        await client.payment.update({
          where: { id: escrow.payment.id },
          data: { status: 'REFUNDED' },
        });
      }

      // Credit customer's virtual wallet (simulated refund)
      const noteType = escrow.reservationId ? 'Reservation' : 'Job';
      await this.walletService.creditWallet(
        customerUserId,
        escrow.amount,
        `Refund — ${noteType} Escrow #${escrowId.substring(0, 8)}`,
        escrowId,
        client,
      );

      this.logger.log(
        `Escrow ${escrowId} REFUNDED. ₹${escrow.amount} credited back to customer ${customerUserId}.`,
      );
    } else {
      this.logger.warn(
        `Escrow ${escrowId} refunded but no customer found to credit!`,
      );
    }

    return updated;
  }

  /**
   * Finds escrow by reservationId.
   */
  async findByReservationId(
    reservationId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.escrow.findUnique({ where: { reservationId } });
  }

  /**
   * Finds escrow by jobId.
   */
  async findByJobId(jobId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.escrow.findUnique({ where: { jobId } });
  }
}
