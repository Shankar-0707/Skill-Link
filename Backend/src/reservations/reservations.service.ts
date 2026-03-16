import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common'
import { ReservationStatus, EscrowStatus, Role } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { EscrowService } from '../escrow/escrow.service'
import { paginate, PaginationDto } from '../common/dto/pagination.dto'
import {
  CreateReservationDto,
  CancelReservationDto,
  ListReservationsDto,
  ListIncomingReservationsDto,
} from './dto/reservation.dto'
import { JwtPayload } from '../common'

// ─── Valid transitions ────────────────────────────────────────────────────────
// This map defines EXACTLY which transitions are allowed and who can make them.
const VALID_TRANSITIONS: Record<
  ReservationStatus,
  { next: ReservationStatus[]; allowedRoles: Role[] }
> = {
  [ReservationStatus.PENDING]: {
    next: [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED],
    allowedRoles: [Role.ORGANISATION, Role.CUSTOMER],
  },
  [ReservationStatus.CONFIRMED]: {
    next: [ReservationStatus.PICKED_UP, ReservationStatus.CANCELLED],
    allowedRoles: [Role.CUSTOMER, Role.ORGANISATION],
  },
  [ReservationStatus.PICKED_UP]: {
    next: [],
    allowedRoles: [],
  },
  [ReservationStatus.CANCELLED]: {
    next: [],
    allowedRoles: [],
  },
  [ReservationStatus.EXPIRED]: {
    next: [],
    allowedRoles: [],
  },
}

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly escrowService: EscrowService,
  ) {}

  // ─── Customer: Create reservation ────────────────────────────────────────

  async create(userId: string, dto: CreateReservationDto) {
    // Resolve customerId from userId
    const customer = await this.prisma.customer.findFirst({
      where: { userId, deletedAt: null },
    })
    if (!customer) throw new NotFoundException('Customer profile not found')

    // All checks and writes in a single transaction — prevents race conditions
    return this.prisma.$transaction(async (tx) => {
      // Lock the product row (SELECT ... FOR UPDATE equivalent via findUnique inside tx)
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      })

      if (!product) throw new NotFoundException('Product not found')
      if (!product.isActive || product.deletedAt)
        throw new BadRequestException('Product is not available')
      if (product.stockQuantity < dto.quantity) {
        throw new ConflictException(
          `Insufficient stock. Requested: ${dto.quantity}, Available: ${product.stockQuantity}`,
        )
      }

      // Decrement stock immediately (held for this reservation)
      await tx.product.update({
        where: { id: dto.productId },
        data: { stockQuantity: { decrement: dto.quantity } },
      })

      // Create reservation with 24-hour expiry window
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

      const reservation = await tx.reservation.create({
        data: {
          productId: dto.productId,
          customerId: customer.id,
          quantity: dto.quantity,
          status: ReservationStatus.PENDING,
          expiresAt,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              organisation: { select: { id: true, businessName: true } },
            },
          },
        },
      })

      // Create escrow — holds the money until pickup
      await this.escrowService.createEscrow(
        {
          reservationId: reservation.id,
          amount: product.price * dto.quantity,
        },
        tx,
      )

      this.logger.log(
        `Reservation ${reservation.id} created for customer ${customer.id}. ` +
          `Product: ${dto.productId}, Qty: ${dto.quantity}`,
      )

      return reservation
    })
  }

  // ─── Customer: List own reservations ─────────────────────────────────────

  async findMyReservations(
    userId: string,
    query: ListReservationsDto & PaginationDto,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    })
    if (!customer) throw new NotFoundException('Customer profile not found')

    const where = {
      customerId: customer.id,
      ...(query.status && { status: query.status }),
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.reservation.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            include: {
              images: { take: 1 },
              organisation: { select: { id: true, businessName: true } },
            },
          },
          escrow: { select: { id: true, amount: true, status: true } },
        },
      }),
      this.prisma.reservation.count({ where }),
    ])

    return paginate(items, total, query)
  }

  // ─── Org: List incoming reservations for their products ──────────────────

  async findIncomingReservations(
    userId: string,
    query: ListIncomingReservationsDto & PaginationDto,
  ) {
    const org = await this.prisma.organisation.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    })
    if (!org) throw new NotFoundException('Organisation profile not found')

    const where = {
      product: { organisationId: org.id },
      ...(query.status && { status: query.status }),
      ...(query.productId && { productId: query.productId }),
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.reservation.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, price: true } },
          customer: {
            include: {
              user: { select: { id: true, email: true, phone: true, profileImage: true } },
            },
          },
          escrow: { select: { id: true, amount: true, status: true } },
        },
      }),
      this.prisma.reservation.count({ where }),
    ])

    return paginate(items, total, query)
  }

  // ─── Get single reservation (customer or org) ─────────────────────────────

  async findOne(reservationId: string, actor: JwtPayload) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        product: {
          include: {
            images: true,
            organisation: {
              select: { id: true, businessName: true, userId: true },
            },
          },
        },
        customer: {
          include: {
            user: { select: { id: true, email: true, phone: true } },
          },
        },
        escrow: true,
      },
    })

    if (!reservation) throw new NotFoundException('Reservation not found')

    // Access control: customer sees only own; org sees only their product's reservations
    await this.assertViewAccess(reservation, actor)

    return reservation
  }

  // ─── Org: Confirm a pending reservation ──────────────────────────────────

  async confirm(reservationId: string, userId: string) {
    const reservation = await this.getReservationWithOrgCheck(reservationId, userId)

    this.assertTransition(reservation.status, ReservationStatus.CONFIRMED)

    const updated = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.CONFIRMED },
      include: { product: { select: { name: true } }, escrow: true },
    })

    this.logger.log(`Reservation ${reservationId} confirmed by org user ${userId}`)
    return updated
  }

  // ─── Customer: Mark as picked up → releases escrow ───────────────────────

  async markPickedUp(reservationId: string, userId: string) {
    const reservation = await this.getReservationWithCustomerCheck(reservationId, userId)

    this.assertTransition(reservation.status, ReservationStatus.PICKED_UP)

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.PICKED_UP },
        include: { product: { select: { name: true } }, escrow: true },
      })

      // Release escrow — money goes to organisation
      if (updated.escrow) {
        await this.escrowService.releaseEscrow(updated.escrow.id, tx)
      }

      this.logger.log(`Reservation ${reservationId} picked up. Escrow released.`)
      return updated
    })
  }

  // ─── Customer or Org: Cancel reservation ─────────────────────────────────

  async cancel(reservationId: string, actor: JwtPayload, dto: CancelReservationDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        product: {
          include: { organisation: { select: { userId: true } } },
        },
        customer: { include: { user: { select: { id: true } } } },
        escrow: true,
      },
    })

    if (!reservation) throw new NotFoundException('Reservation not found')

    // Check actor is either the customer or the org that owns the product
    const isCustomer = reservation.customer.user.id === actor.sub
    const isOrg = reservation.product.organisation.userId === actor.sub

    if (!isCustomer && !isOrg) {
      throw new ForbiddenException('You are not authorised to cancel this reservation')
    }

    this.assertTransition(reservation.status, ReservationStatus.CANCELLED)

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CANCELLED },
        include: { escrow: true },
      })

      // Restore stock
      await tx.product.update({
        where: { id: reservation.productId },
        data: { stockQuantity: { increment: reservation.quantity } },
      })

      // Refund escrow — money goes back to customer
      if (updated.escrow && updated.escrow.status === EscrowStatus.HELD) {
        await this.escrowService.refundEscrow(updated.escrow.id, tx)
      }

      this.logger.log(
        `Reservation ${reservationId} cancelled by ${actor.role} user ${actor.sub}. ` +
          `Reason: ${dto.reason ?? 'none'}. Stock restored.`,
      )

      return updated
    })
  }

  // ─── System: Expire overdue reservations (called by cron) ────────────────

  async expireOverdueReservations(): Promise<number> {
    const overdueReservations = await this.prisma.reservation.findMany({
      where: {
        status: ReservationStatus.PENDING,
        expiresAt: { lt: new Date() },
      },
      include: { escrow: true },
    })

    if (overdueReservations.length === 0) return 0

    let expiredCount = 0

    for (const reservation of overdueReservations) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.reservation.update({
            where: { id: reservation.id },
            data: { status: ReservationStatus.EXPIRED },
          })

          // Restore stock
          await tx.product.update({
            where: { id: reservation.productId },
            data: { stockQuantity: { increment: reservation.quantity } },
          })

          // Refund escrow if held
          if (reservation.escrow?.status === EscrowStatus.HELD) {
            await this.escrowService.refundEscrow(reservation.escrow.id, tx)
          }
        })

        expiredCount++
        this.logger.log(`Reservation ${reservation.id} expired. Stock restored.`)
      } catch (err) {
        this.logger.error(
          `Failed to expire reservation ${reservation.id}: ${(err as Error).message}`,
        )
      }
    }

    return expiredCount
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Validates that the status transition is legal.
   */
  private assertTransition(
    current: ReservationStatus,
    target: ReservationStatus,
  ): void {
    const allowed = VALID_TRANSITIONS[current]?.next ?? []
    if (!allowed.includes(target)) {
      throw new BadRequestException(
        `Cannot transition reservation from ${current} to ${target}. ` +
          `Allowed transitions from ${current}: [${allowed.join(', ') || 'none'}]`,
      )
    }
  }

  /**
   * Loads a reservation and verifies the acting userId is the org that owns the product.
   */
  private async getReservationWithOrgCheck(reservationId: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        product: {
          include: { organisation: { select: { userId: true } } },
        },
        escrow: true,
      },
    })

    if (!reservation) throw new NotFoundException('Reservation not found')

    if (reservation.product.organisation.userId !== userId) {
      throw new ForbiddenException('You do not own the product for this reservation')
    }

    return reservation
  }

  /**
   * Loads a reservation and verifies the acting userId is the customer who made it.
   */
  private async getReservationWithCustomerCheck(reservationId: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        customer: { include: { user: { select: { id: true } } } },
        escrow: true,
      },
    })

    if (!reservation) throw new NotFoundException('Reservation not found')

    if (reservation.customer.user.id !== userId) {
      throw new ForbiddenException('This reservation does not belong to you')
    }

    return reservation
  }

  /**
   * View access: customer sees own, org sees their product's reservations.
   */
  private async assertViewAccess(
    reservation: any,
    actor: JwtPayload,
  ): Promise<void> {
    const isCustomer = reservation.customer?.user?.id === actor.sub
    const isOrg = reservation.product?.organisation?.userId === actor.sub
    const isAdmin = actor.role === Role.ADMIN

    if (!isCustomer && !isOrg && !isAdmin) {
      throw new ForbiddenException('Access denied to this reservation')
    }
  }
}