import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrganisationsService } from '../organisations/organisations.service';
import { paginate, PaginationDto, parsePaginationInts } from '../common/dto/pagination.dto';
import {
  CreateProductDto,
  UpdateProductDto,
  ListProductsDto,
  AddProductImageDto,
} from './product.dto';
import { CloudinaryService } from '../storage/cloudinary.service';
import {
  PRODUCT_IMAGE_ALLOWED_MIMES,
  PRODUCT_IMAGE_MAX_BYTES,
} from './products.constants';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly organisationsService: OrganisationsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ─── Public: List products ────────────────────────────────────────────────

  async findAll(query: ListProductsDto & PaginationDto) {
    const { organisationId, search } = query;
    const { page, limit, skip } = parsePaginationInts(query);

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null,
      ...(organisationId && { organisationId }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    // Default: newest first
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      createdAt: 'desc',
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { take: 1, orderBy: { createdAt: 'asc' } },
          organisation: {
            select: {
              id: true,
              businessName: true,
              businessType: true,
              ratingAvg: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(items, total, { page, limit } as PaginationDto);
  }

  // ─── Public: Get one product ──────────────────────────────────────────────

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true, deletedAt: null },
      include: {
        images: { orderBy: { createdAt: 'asc' } },
        organisation: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            description: true,
            ratingAvg: true,
            ratingCount: true,
          },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // ─── Org: Create product ──────────────────────────────────────────────────

  async create(userId: string, dto: CreateProductDto) {
    const orgId = await this.organisationsService.resolveOrgId(userId);

    // Use a transaction to create product + images atomically
    const product = await this.prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          organisationId: orgId,
          name: dto.name,
          description: dto.description,
          price: dto.price,
          stockQuantity: dto.stockQuantity,
        },
      });

      if (dto.imageUrls && dto.imageUrls.length > 0) {
        await tx.productImage.createMany({
          data: dto.imageUrls.map((url) => ({
            productId: created.id,
            imageUrl: url,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: created.id },
        include: { images: true },
      });
    });

    this.logger.log(`Product ${product!.id} created by org ${orgId}`);
    return product;
  }

  // ─── Org: Update product ──────────────────────────────────────────────────

  async update(id: string, userId: string, dto: UpdateProductDto) {
    await this.assertOwnership(id, userId);

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.stockQuantity !== undefined && {
          stockQuantity: dto.stockQuantity,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { images: true },
    });

    this.logger.log(`Product ${id} updated by user ${userId}`);
    return updated;
  }

  // ─── Org: Soft-delete product ─────────────────────────────────────────────

  async remove(id: string, userId: string) {
    await this.assertOwnership(id, userId);

    // Check for active reservations before deleting
    const activeReservations = await this.prisma.reservation.count({
      where: {
        productId: id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (activeReservations > 0) {
      throw new BadRequestException(
        `Cannot delete product with ${activeReservations} active reservation(s). Cancel them first.`,
      );
    }

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });

    this.logger.log(`Product ${id} soft-deleted by user ${userId}`);
    return { message: 'Product deleted successfully' };
  }

  // ─── Org: Add image to product ────────────────────────────────────────────

  async addImage(productId: string, userId: string, dto: AddProductImageDto) {
    await this.assertOwnership(productId, userId);

    const image = await this.prisma.productImage.create({
      data: { productId, imageUrl: dto.imageUrl },
    });

    this.logger.log(`Image added to product ${productId}`);
    return image;
  }

  /**
   * Uploads an image file to Cloudinary and stores the returned HTTPS URL in ProductImage.imageUrl.
   */
  async addImageUpload(
    productId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    await this.assertOwnership(productId, userId);

    if (!file?.buffer?.length) {
      throw new BadRequestException({
        message: 'file is required',
        code: 'PRODUCT_IMAGE_REQUIRED',
      });
    }
    if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
      throw new BadRequestException({
        message: `Image too large (max ${PRODUCT_IMAGE_MAX_BYTES} bytes)`,
        code: 'PRODUCT_IMAGE_TOO_LARGE',
      });
    }
    const mime = file.mimetype?.toLowerCase() ?? '';
    if (!PRODUCT_IMAGE_ALLOWED_MIMES.has(mime)) {
      throw new BadRequestException({
        message: 'Only JPEG, PNG, WebP, or GIF images are allowed',
        code: 'PRODUCT_IMAGE_TYPE',
      });
    }

    const { secureUrl } = await this.cloudinary.uploadProductImage(file.buffer);
    console.log(secureUrl);

    const image = await this.prisma.productImage.create({
      data: { productId, imageUrl: secureUrl },
    });

    this.logger.log(`Image uploaded to Cloudinary for product ${productId}`);
    return image;
  }

  // ─── Org: Remove image from product ──────────────────────────────────────

  async removeImage(productId: string, imageId: string, userId: string) {
    await this.assertOwnership(productId, userId);

    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) throw new NotFoundException('Image not found on this product');

    await this.prisma.productImage.delete({ where: { id: imageId } });
    return { message: 'Image removed successfully' };
  }

  // ─── Internal: Get org's own products ────────────────────────────────────

  async findMyProducts(userId: string, query: ListProductsDto & PaginationDto) {
    const orgId = await this.organisationsService.resolveOrgId(userId);
    const { search } = query;
    const { page, limit, skip } = parsePaginationInts(query);

    const where: Prisma.ProductWhereInput = {
      organisationId: orgId,
      deletedAt: null,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      createdAt: 'desc',
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: true,
          _count: { select: { reservations: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(items, total, { page, limit } as PaginationDto);
  }

  // ─── Private: Ownership guard ─────────────────────────────────────────────

  private async assertOwnership(
    productId: string,
    userId: string,
  ): Promise<void> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      include: { organisation: { select: { userId: true } } },
    });

    if (!product) throw new NotFoundException('Product not found');

    if (product.organisation.userId !== userId) {
      throw new ForbiddenException('You do not own this product');
    }
  }
}
