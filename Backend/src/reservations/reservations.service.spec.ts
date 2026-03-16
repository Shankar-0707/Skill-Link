import { Test, TestingModule } from '@nestjs/testing'
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common'
import { ReservationStatus, EscrowStatus } from '@prisma/client'
import { ReservationsService } from './reservations.service'
import { PrismaService } from '../prisma/prisma.service'
import { EscrowService } from '../escrow/escrow.service'

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockCustomer = {
  id: 'cust-uuid-1',
  userId: 'user-uuid-cust',
  deletedAt: null,
  user: { id: 'user-uuid-cust' },
}

const mockOrg = {
  id: 'org-uuid-1',
  userId: 'user-uuid-org',
  deletedAt: null,
}

const mockProduct = {
  id: 'prod-uuid-1',
  name: 'Eco Bricks',
  price: 500,
  stockQuantity: 10,
  isActive: true,
  deletedAt: null,
  organisation: { userId: 'user-uuid-org' },
}

const mockReservation = {
  id: 'res-uuid-1',
  productId: 'prod-uuid-1',
  customerId: 'cust-uuid-1',
  quantity: 2,
  status: ReservationStatus.PENDING,
  expiresAt: new Date(Date.now() + 86_400_000),
  product: {
    ...mockProduct,
    images: [],
    organisation: { id: 'org-uuid-1', userId: 'user-uuid-org' },
  },
  customer: { ...mockCustomer },
  escrow: { id: 'escrow-uuid-1', amount: 1000, status: EscrowStatus.HELD },
}

// ─── Prisma mock ──────────────────────────────────────────────────────────────

const mockPrisma = {
  customer: { findFirst: jest.fn() },
  product: { findUnique: jest.fn(), update: jest.fn() },
  reservation: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  organisation: { findFirst: jest.fn() },
  $transaction: jest.fn(),
}

const mockEscrowService = {
  createEscrow: jest.fn(),
  releaseEscrow: jest.fn(),
  refundEscrow: jest.fn(),
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ReservationsService', () => {
  let service: ReservationsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EscrowService, useValue: mockEscrowService },
      ],
    }).compile()

    service = module.get<ReservationsService>(ReservationsService)
    jest.clearAllMocks()
  })

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates reservation, decrements stock, and creates escrow in a transaction', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(mockCustomer)

      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          product: {
            findUnique: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn(),
          },
          reservation: {
            create: jest.fn().mockResolvedValue(mockReservation),
          },
        }
        const result = await cb(tx)
        expect(tx.product.update).toHaveBeenCalledWith(
          expect.objectContaining({ data: { stockQuantity: { decrement: 2 } } }),
        )
        return result
      })

      const dto = { productId: 'prod-uuid-1', quantity: 2 }
      const result = await service.create('user-uuid-cust', dto)

      expect(result).toEqual(mockReservation)
      expect(mockEscrowService.createEscrow).toHaveBeenCalledWith(
        expect.objectContaining({ reservationId: 'res-uuid-1', amount: 1000 }),
        expect.anything(),
      )
    })

    it('throws ConflictException when stock is insufficient', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(mockCustomer)

      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          product: { findUnique: jest.fn().mockResolvedValue({ ...mockProduct, stockQuantity: 1 }) },
          reservation: { create: jest.fn() },
        }
        return cb(tx)
      })

      await expect(service.create('user-uuid-cust', { productId: 'prod-uuid-1', quantity: 5 }))
        .rejects.toThrow(ConflictException)
    })

    it('throws NotFoundException when customer profile not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null)

      await expect(service.create('user-uuid-cust', { productId: 'prod-uuid-1', quantity: 1 }))
        .rejects.toThrow(NotFoundException)
    })
  })

  // ── confirm ────────────────────────────────────────────────────────────────

  describe('confirm', () => {
    it('transitions PENDING → CONFIRMED when org owns the product', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation)
      mockPrisma.reservation.update.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
      })

      const result = await service.confirm('res-uuid-1', 'user-uuid-org')
      expect(result.status).toBe(ReservationStatus.CONFIRMED)
    })

    it('throws ForbiddenException when org does not own the product', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation)

      await expect(service.confirm('res-uuid-1', 'different-user'))
        .rejects.toThrow(ForbiddenException)
    })
  })

  // ── markPickedUp ───────────────────────────────────────────────────────────

  describe('markPickedUp', () => {
    it('transitions CONFIRMED → PICKED_UP and releases escrow', async () => {
      const confirmedReservation = { ...mockReservation, status: ReservationStatus.CONFIRMED }
      mockPrisma.reservation.findUnique.mockResolvedValue(confirmedReservation)

      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          reservation: {
            update: jest.fn().mockResolvedValue({
              ...confirmedReservation,
              status: ReservationStatus.PICKED_UP,
              escrow: confirmedReservation.escrow,
            }),
          },
        }
        return cb(tx)
      })

      const result = await service.markPickedUp('res-uuid-1', 'user-uuid-cust')

      expect(result.status).toBe(ReservationStatus.PICKED_UP)
      expect(mockEscrowService.releaseEscrow).toHaveBeenCalledWith('escrow-uuid-1', expect.anything())
    })

    it('throws BadRequestException when transitioning from PENDING (not CONFIRMED)', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation) // status = PENDING

      await expect(service.markPickedUp('res-uuid-1', 'user-uuid-cust'))
        .rejects.toThrow(BadRequestException)
    })
  })

  // ── cancel ─────────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('cancels reservation, restores stock, and refunds escrow', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation)

      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          reservation: {
            update: jest.fn().mockResolvedValue({
              ...mockReservation,
              status: ReservationStatus.CANCELLED,
              escrow: mockReservation.escrow,
            }),
          },
          product: { update: jest.fn() },
        }
        const result = await cb(tx)
        expect(tx.product.update).toHaveBeenCalledWith(
          expect.objectContaining({ data: { stockQuantity: { increment: 2 } } }),
        )
        return result
      })

      const actor = { sub: 'user-uuid-cust', role: 'CUSTOMER', email: 'c@test.com' }
      const result = await service.cancel('res-uuid-1', actor as any, {})

      expect(result.status).toBe(ReservationStatus.CANCELLED)
      expect(mockEscrowService.refundEscrow).toHaveBeenCalledWith('escrow-uuid-1', expect.anything())
    })

    it('throws BadRequestException when trying to cancel a PICKED_UP reservation', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.PICKED_UP,
      })

      const actor = { sub: 'user-uuid-cust', role: 'CUSTOMER', email: 'c@test.com' }
      await expect(service.cancel('res-uuid-1', actor as any, {}))
        .rejects.toThrow(BadRequestException)
    })

    it('throws ForbiddenException when neither customer nor org tries to cancel', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation)

      const actor = { sub: 'some-random-user', role: 'CUSTOMER', email: 'x@test.com' }
      await expect(service.cancel('res-uuid-1', actor as any, {}))
        .rejects.toThrow(ForbiddenException)
    })
  })
})