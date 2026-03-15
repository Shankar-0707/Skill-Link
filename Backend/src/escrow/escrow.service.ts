import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { EscrowStatus, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

/**
 * EscrowService owns ALL escrow state transitions.
 * Both the reservations flow (your domain) and the jobs flow (Udit's domain)
 * must call this service — never update escrow.status directly elsewhere.
 */

@Injectable()
export class EscrowService {
    private readonly logger = new Logger(EscrowService.name)

    constructor(private readonly prisma: PrismaService) {}

    /**
   * Creates a new HELD escrow record.
   * Called inside a transaction from ReservationService or JobService.
   */

    async createEscrow(
        data: {jobId?: string; reservationId?: string; amount: number },
        tx?: Prisma.TransactionClient,
    ) {
        const client = tx ?? this.prisma

        if(!data.jobId && !data.reservationId) {
            throw new BadRequestException('Escrow must be linked to a job or reservation')
        }

        return client.escrow.create({
            data: {
                jobId: data.jobId,
                reservationId: data.reservationId,
                amount: data.amount,
                status: EscrowStatus.HELD,
            },
        })
    }

     /**
   * Releases escrow funds to the payee (worker / organisation).
   * Triggered when: job COMPLETED or reservation PICKED_UP.
   */

    async releaseEscrow(escrowId: string, tx?: Prisma.TransactionClient) {
        const client = tx ?? this.prisma

        const escrow = await client.escrow.findUnique({ where: {id: escrowId} })

        if(!escrow) throw new NotFoundException(`Escrow ${escrowId} not found`)
        
        if(escrow.status !== EscrowStatus.HELD) {
            throw new BadRequestException(
                `Cannot release escrow with status: ${escrow.status}. Must be HELD.`,
            )
        }

        const updated = await client.escrow.update({
            where: { id: escrowId },
            data: {
                status: EscrowStatus.RELEASED,
                releasedAt: new Date(),
            },
        })

        this.logger.log(`Escrow ${escrowId} released. Amount: ${escrow.amount}`)
        return updated
    }

    /**
   * Refunds escrow back to the customer.
   * Triggered when: job CANCELLED or reservation CANCELLED/EXPIRED.
   */

    async refundEscrow(escrowId: string, tx?: Prisma.TransactionClient) {
        const client = tx ?? this.prisma

        const escrow = await client.escrow.findUnique({ where: {id: escrowId } })

        if(!escrow) throw new NotFoundException(`Escrow ${escrowId} not found`)

        if(escrow.status !== EscrowStatus.HELD) {
            throw new BadRequestException(
                `cannot refund escrow with status: ${escrow.status}. Must be HELD.`,
            )
        }

        const updated = await client.escrow.update({
            where: { id: escrowId },
            data: { status: EscrowStatus.REFUNDED },
        })

        this.logger.log(`Escrow ${escrowId} refunded. Amount: ${escrow.amount}`)
        return updated
    }

     /**
   * Finds escrow by reservationId.
   * Used before release/refund when you only have the reservationId.
   */

    async findByReservationId(reservationId: string, tx?: Prisma.TransactionClient) {
        const client = tx ?? this.prisma
        return client.escrow.findUnique({ where: { reservationId } })
    }

    /**
   * Finds escrow by jobId.
   */

    async findByJobId(jobId: string, tx?: Prisma.TransactionClient) {
        const client = tx ?? this.prisma
        return client.escrow.findUnique({ where: {jobId } })
    }
}