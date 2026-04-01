import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrganisationsService } from '../organisations/organisations.service';
import { CloudinaryService } from '../storage/cloudinary.service';

// ─── Minimal mock factory ─────────────────────────────────────────────────────

const mockProduct = {
  id: 'prod-uuid-1',
  organisationId: 'org-uuid-1',
  name: 'Eco Bricks',
  description: 'Recycled bricks',
  price: 500,
  stockQuantity: 50,
  isActive: true,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  images: [],
  organisation: { userId: 'user-uuid-org' },
};

const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  productImage: {
    create: jest.fn(),
    createMany: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  reservation: {
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockOrgsService = {
  resolveOrgId: jest.fn(),
};

const mockCloudinary = {
  uploadProductImage: jest.fn(),
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: OrganisationsService, useValue: mockOrgsService },
        { provide: CloudinaryService, useValue: mockCloudinary },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns a product when it exists and is active', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);

      const result = await service.findOne('prod-uuid-1');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findFirst).toHaveBeenCalled();
    });

    it('throws NotFoundException when product does not exist', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a product and images in a transaction', async () => {
      mockOrgsService.resolveOrgId.mockResolvedValue('org-uuid-1');

      const createdProduct = {
        ...mockProduct,
        images: [{ id: 'img-1', imageUrl: 'https://x.com/img.jpg' }],
      };

      // $transaction receives a callback — execute it with a mock tx client
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: unknown) => Promise<unknown>) => {
          const tx = {
            product: {
              create: jest.fn().mockResolvedValue(mockProduct),
              findUnique: jest.fn().mockResolvedValue(createdProduct),
            },
            productImage: {
              createMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
          };
          return cb(tx);
        },
      );

      const dto = {
        name: 'Eco Bricks',
        price: 500,
        stockQuantity: 50,
        imageUrls: ['https://x.com/img.jpg'],
      };

      const result = await service.create('user-uuid-org', dto);

      expect(result).toEqual(createdProduct);
      expect(mockOrgsService.resolveOrgId).toHaveBeenCalledWith(
        'user-uuid-org',
      );
    });
  });

  // ── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('soft-deletes a product when no active reservations exist', async () => {
      // assertOwnership passes
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.reservation.count.mockResolvedValue(0);
      mockPrisma.product.update.mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      const result = await service.remove('prod-uuid-1', 'user-uuid-org');

      expect(result).toEqual({ message: 'Product deleted successfully' });
      expect(mockPrisma.product.update).toHaveBeenCalled();
    });

    it('throws BadRequestException when active reservations exist', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.reservation.count.mockResolvedValue(3);

      await expect(
        service.remove('prod-uuid-1', 'user-uuid-org'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException when user does not own the product', async () => {
      mockPrisma.product.findFirst.mockResolvedValue({
        ...mockProduct,
        organisation: { userId: 'different-user' },
      });

      await expect(
        service.remove('prod-uuid-1', 'user-uuid-org'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
