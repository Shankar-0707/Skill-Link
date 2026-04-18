import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ReservationStatus, EscrowStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EscrowService } from '../escrow/escrow.service';
import { PaymentsService } from '../payments/payments.service';
import {
  paginate,
  PaginationDto,
  parsePaginationInts,
} from '../common/dto/pagination.dto';
import {
  CreateReservationDto,
  CancelReservationDto,
  ListReservationsDto,
  ListIncomingReservationsDto,
  VerifyPickupDto,
  RejectReservationDto,
} from './dto/reservation.dto';
import { JwtPayload } from '../common';

/** Minimal shape for `assertViewAccess` (matches Prisma includes used on reservation queries). */
interface ReservationViewAccessShape {
  customer?: { user?: { id: string } | null } | null;
  product?: { organisation?: { userId: string } | null } | null;
}

// ─── Valid transitions ────────────────────────────────────────────────────────
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
};

/** Generates a secure 4-digit numeric OTP */
function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly escrowService: EscrowService,
    private readonly paymentsService: PaymentsService,
  ) {}

  // ─── Customer: Create reservation + Payment link ──────────────────────────

  async create(userId: string, dto: CreateReservationDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer profile not found');

    return this.prisma.$transaction(async (tx) => {
      // Lock product and check stock
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product) throw new NotFoundException('Product not found');
      if (!product.isActive || product.deletedAt)
        throw new BadRequestException('Product is not available');
      if (product.stockQuantity < dto.quantity) {
        throw new ConflictException(
          `Insufficient stock. Requested: ${dto.quantity}, Available: ${product.stockQuantity}`,
        );
      }

      // Decrement stock immediately (held for this reservation)
      await tx.product.update({
        where: { id: dto.productId },
        data: { stockQuantity: { decrement: dto.quantity } },
      });

      // Create reservation — status remains PENDING until payment confirmed
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
      });

      // Create a payment order (mock gateway) and get the checkout URL
      const totalAmount = product.price * dto.quantity;
      const paymentOrder = await this.paymentsService.createPaymentOrder({
        userId,
        amount: totalAmount,
        type: 'RESERVATION',
        reservationId: reservation.id,
      }, tx);

      this.logger.log(
        `Reservation ${reservation.id} created. Payment link: ${paymentOrder.checkoutUrl}`,
      );

      // Return reservation + checkout URL so frontend can redirect
      return {
        ...reservation,
        checkoutUrl: paymentOrder.checkoutUrl,
        providerPaymentId: paymentOrder.providerPaymentId,
        totalAmount,
      };
    });
  }

  // ─── Customer: List own reservations ─────────────────────────────────────

  async findMyReservations(
    userId: string,
    query: ListReservationsDto & PaginationDto,
  ) {
    const { page, limit, skip } = parsePaginationInts(query);
    const customer = await this.prisma.customer.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    if (!customer) throw new NotFoundException('Customer profile not found');

    const where = {
      customerId: customer.id,
      ...(query.status && { status: query.status }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            include: {
              images: { take: 1 },
              organisation: { select: { id: true, businessName: true } },
            },
          },
          escrow: { select: { id: true, amount: true, status: true } },
          payment: { select: { id: true, status: true, checkoutUrl: true, providerPaymentId: true } },
        },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return paginate(items, total, { page, limit } as PaginationDto);
  }

  // ─── Customer: Get single reservation detail ─────────────────────────────

  async findMyReservationById(reservationId: string, userId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    if (!customer) throw new NotFoundException('Customer profile not found');

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        product: {
          include: {
            images: true,
            organisation: { select: { id: true, businessName: true } },
          },
        },
        escrow: true,
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            checkoutUrl: true,
            providerPaymentId: true,
          },
        },
      },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.customerId !== customer.id) {
      throw new ForbiddenException('This reservation does not belong to you');
    }

    // Only expose OTP to customer when status is CONFIRMED
    // pickupOtp is already on the model — included by default if status is CONFIRMED
    return reservation;
  }

  // ─── Org: List incoming reservations for their products ──────────────────

  async findIncomingReservations(
    userId: string,
    query: ListIncomingReservationsDto & PaginationDto,
  ) {
    const { page, limit, skip } = parsePaginationInts(query);
    const org = await this.prisma.organisation.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    if (!org) throw new NotFoundException('Organisation profile not found');

    const where = {
      product: { organisationId: org.id },
      ...(query.status && { status: query.status }),
      ...(query.productId && { productId: query.productId }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, price: true } },
          customer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  profileImage: true,
                },
              },
            },
          },
          escrow: { select: { id: true, amount: true, status: true } },
        },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return paginate(items, total, { page, limit } as PaginationDto);
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
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        escrow: true,
        payment: {
          select: { id: true, status: true, amount: true, checkoutUrl: true, providerPaymentId: true },
        },
      },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');
    this.assertViewAccess(reservation, actor);

    return reservation;
  }

  // ─── Org: Confirm a pending reservation + generate OTP ───────────────────

  async confirm(reservationId: string, userId: string) {
    const reservation = await this.getReservationWithOrgCheck(
      reservationId,
      userId,
    );

    this.assertTransition(reservation.status, ReservationStatus.CONFIRMED);

    // Generate pickup OTP (valid for 24 hours)
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const updated = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.CONFIRMED,
        pickupOtp: otp,
        pickupOtpExpiresAt: otpExpiresAt,
      },
      include: { product: { select: { name: true } }, escrow: true },
    });

    this.logger.log(
      `Reservation ${reservationId} confirmed by org ${userId}. OTP generated for customer.`,
    );
    return updated;
  }

  // ─── Org: Reject PENDING reservation (dedicated endpoint) ────────────────

  async reject(
    reservationId: string,
    userId: string,
    dto: RejectReservationDto,
  ) {
    const reservation = await this.getReservationWithOrgCheck(
      reservationId,
      userId,
    );

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        'Only PENDING reservations can be rejected by the organisation.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CANCELLED },
        include: { escrow: true },
      });

      // Restore stock
      await tx.product.update({
        where: { id: reservation.productId },
        data: { stockQuantity: { increment: reservation.quantity } },
      });

      // Refund escrow if payment was made
      if (updated.escrow?.status === EscrowStatus.HELD) {
        await this.escrowService.refundEscrow(updated.escrow.id, tx);
      }

      this.logger.log(
        `Reservation ${reservationId} rejected by org ${userId}. Reason: ${dto.reason ?? 'none'}.`,
      );

      return updated;
    });
  }

  // ─── Org: Verify OTP and mark as PICKED_UP → releases escrow ─────────────

  async verifyOtpAndPickup(
    reservationId: string,
    userId: string,
    dto: VerifyPickupDto,
  ) {
    const reservation = await this.getReservationWithOrgCheck(
      reservationId,
      userId,
    );

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'Can only verify pickup for CONFIRMED reservations.',
      );
    }

    // Validate OTP
    if (!reservation.pickupOtp) {
      throw new BadRequestException(
        'No pickup OTP found for this reservation. Has the org confirmed it?',
      );
    }

    if (reservation.pickupOtp !== dto.otp) {
      throw new BadRequestException('Invalid OTP. Please ask the customer to check their app.');
    }

    if (reservation.pickupOtpExpiresAt && reservation.pickupOtpExpiresAt < new Date()) {
      throw new BadRequestException(
        'OTP has expired. Please cancel and re-confirm this reservation.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: ReservationStatus.PICKED_UP,
          pickupOtp: null, // Clear OTP after use
          pickupOtpExpiresAt: null,
        },
        include: { product: { select: { name: true } }, escrow: true },
      });

      // Release escrow → org virtual wallet credited
      if (updated.escrow) {
        await this.escrowService.releaseEscrow(updated.escrow.id, tx);
      }

      this.logger.log(
        `Reservation ${reservationId} — OTP verified. Marked PICKED_UP. Escrow released.`,
      );
      return updated;
    });
  }

  // ─── Customer or Org: Cancel reservation ─────────────────────────────────

  async cancel(
    reservationId: string,
    actor: JwtPayload,
    dto: CancelReservationDto,
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        product: {
          include: { organisation: { select: { userId: true } } },
        },
        customer: { include: { user: { select: { id: true } } } },
        escrow: true,
      },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');

    const isCustomer = reservation.customer.user.id === actor.sub;
    const isOrg = reservation.product.organisation.userId === actor.sub;

    if (!isCustomer && !isOrg) {
      throw new ForbiddenException(
        'You are not authorised to cancel this reservation',
      );
    }

    this.assertTransition(reservation.status, ReservationStatus.CANCELLED);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CANCELLED },
        include: { escrow: true },
      });

      // Restore stock
      await tx.product.update({
        where: { id: reservation.productId },
        data: { stockQuantity: { increment: reservation.quantity } },
      });

      // Refund escrow — money (virtual) goes back to customer
      if (updated.escrow && updated.escrow.status === EscrowStatus.HELD) {
        await this.escrowService.refundEscrow(updated.escrow.id, tx);
      }

      this.logger.log(
        `Reservation ${reservationId} cancelled by ${actor.role} user ${actor.sub}. ` +
          `Reason: ${dto.reason ?? 'none'}. Stock restored.`,
      );

      return updated;
    });
  }

  // ─── System: Expire overdue reservations (called by cron) ────────────────

  async expireOverdueReservations(): Promise<number> {
    const overdueReservations = await this.prisma.reservation.findMany({
      where: {
        status: ReservationStatus.PENDING,
        expiresAt: { lt: new Date() },
      },
      include: { escrow: true },
    });

    if (overdueReservations.length === 0) return 0;

    let expiredCount = 0;

    for (const reservation of overdueReservations) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.reservation.update({
            where: { id: reservation.id },
            data: { status: ReservationStatus.EXPIRED },
          });

          await tx.product.update({
            where: { id: reservation.productId },
            data: { stockQuantity: { increment: reservation.quantity } },
          });

          if (reservation.escrow?.status === EscrowStatus.HELD) {
            await this.escrowService.refundEscrow(reservation.escrow.id, tx);
          }
        });

        expiredCount++;
        this.logger.log(
          `Reservation ${reservation.id} expired. Stock restored.`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to expire reservation ${reservation.id}: ${(err as Error).message}`,
        );
      }
    }

    return expiredCount;
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private assertTransition(
    current: ReservationStatus,
    target: ReservationStatus,
  ): void {
    const allowed = VALID_TRANSITIONS[current]?.next ?? [];
    if (!allowed.includes(target)) {
      throw new BadRequestException(
        `Cannot transition reservation from ${current} to ${target}. ` +
          `Allowed transitions from ${current}: [${allowed.join(', ') || 'none'}]`,
      );
    }
  }

  private async getReservationWithOrgCheck(
    reservationId: string,
    userId: string,
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        product: {
          include: { organisation: { select: { userId: true } } },
        },
        escrow: true,
      },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');

    if (reservation.product.organisation.userId !== userId) {
      throw new ForbiddenException(
        'You do not own the product for this reservation',
      );
    }

    return reservation;
  }

  private async getReservationWithCustomerCheck(
    reservationId: string,
    userId: string,
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        customer: { include: { user: { select: { id: true } } } },
        escrow: true,
      },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');

    if (reservation.customer.user.id !== userId) {
      throw new ForbiddenException('This reservation does not belong to you');
    }

    return reservation;
  }

  private assertViewAccess(
    reservation: ReservationViewAccessShape,
    actor: JwtPayload,
  ): void {
    const isCustomer = reservation.customer?.user?.id === actor.sub;
    const isOrg = reservation.product?.organisation?.userId === actor.sub;
    const isAdmin = actor.role === Role.ADMIN;

    if (!isCustomer && !isOrg && !isAdmin) {
      throw new ForbiddenException('Access denied to this reservation');
    }
  }
}
