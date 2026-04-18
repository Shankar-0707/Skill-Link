import { Injectable, Logger } from '@nestjs/common';
import { Prisma, WalletTransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * WalletService manages the virtual wallet for all users (orgs, workers, customers).
 * Money credited here represents funds released from escrow.
 * Debits are recorded when admin processes a manual withdrawal.
 */
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the wallet for a user, creating it if it doesn't exist yet.
   */
  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.upsert({
      where: { userId },
      create: { userId, balance: 0 },
      update: {},
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
    return wallet;
  }

  /**
   * Credits an amount to a user's virtual wallet.
   * Upserts the wallet to ensure it exists.
   * Optionally links the transaction to an escrow record.
   */
  async creditWallet(
    userId: string,
    amount: number,
    note: string,
    escrowId?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    // Upsert wallet (creates if not exists) and increment balance atomically
    const wallet = await client.wallet.upsert({
      where: { userId },
      create: { userId, balance: amount },
      update: { balance: { increment: amount } },
    });

    // Record the transaction in the audit log
    await client.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: WalletTransactionType.CREDIT,
        amount,
        note,
        escrowId: escrowId ?? null,
      },
    });

    this.logger.log(
      `Credited ₹${amount} to wallet of user ${userId}. Note: "${note}"`,
    );

    return wallet;
  }

  /**
   * Debits an amount from a user's virtual wallet.
   * Use for withdrawal tracking.
   */
  async debitWallet(
    userId: string,
    amount: number,
    note: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    const wallet = await client.wallet.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    });

    await client.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: WalletTransactionType.DEBIT,
        amount,
        note,
      },
    });

    this.logger.log(
      `Debited ₹${amount} from wallet of user ${userId}. Note: "${note}"`,
    );

    return wallet;
  }
}
