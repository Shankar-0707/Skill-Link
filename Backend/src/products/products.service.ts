import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { OrganisationsService } from '../organisations/organisations.service'
import { paginate, PaginationDto } from '../common/dto/pagination.dto'
import {
  CreateProductDto,
  UpdateProductDto,
  ListProductsDto,
  AddProductImageDto,
} from './product.dto'

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly organisationsService: OrganisationsService,
  ) {}

  // ─── Public: List products ────────────────────────────────────────────────

  async findAll(query: ListProductsDto & PaginationDto) {
    const { organisationId, search, skip, limit, page } = query

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null,
      ...(organisationId && { organisationId }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    }

    // Default: newest first
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      createdAt: 'desc',
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: Number(skip) || 0,
        take: Number(limit) || 20,
        orderBy,
        include: {
          images: { take: 1, orderBy: { createdAt: 'asc' } },
          organisation: {
            select: { id: true, businessName: true, businessType: true, ratingAvg: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ])

    return paginate(items, total, { page, limit } as PaginationDto)
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
    })

    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  // ─── Org: Create product ──────────────────────────────────────────────────

  async create(userId: string, dto: CreateProductDto) {
    const orgId = await this.organisationsService.resolveOrgId(userId)

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
      })

      if (dto.imageUrls && dto.imageUrls.length > 0) {
        await tx.productImage.createMany({
          data: dto.imageUrls.map((url) => ({
            productId: created.id,
            imageUrl: url,
          })),
        })
      }

      return tx.product.findUnique({
        where: { id: created.id },
        include: { images: true },
      })
    })

    this.logger.log(`Product ${product!.id} created by org ${orgId}`)
    return product
  }

  // ─── Org: Update product ──────────────────────────────────────────────────

  async update(id: string, userId: string, dto: UpdateProductDto) {
    await this.assertOwnership(id, userId)

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.stockQuantity !== undefined && { stockQuantity: dto.stockQuantity }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { images: true },
    })

    this.logger.log(`Product ${id} updated by user ${userId}`)
    return updated
  }

  // ─── Org: Soft-delete product ─────────────────────────────────────────────

  async remove(id: string, userId: string) {
    await this.assertOwnership(id, userId)

    // Check for active reservations before deleting
    const activeReservations = await this.prisma.reservation.count({
      where: {
        productId: id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    })

    if (activeReservations > 0) {
      throw new BadRequestException(
        `Cannot delete product with ${activeReservations} active reservation(s). Cancel them first.`,
      )
    }

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    })

    this.logger.log(`Product ${id} soft-deleted by user ${userId}`)
    return { message: 'Product deleted successfully' }
  }

  // ─── Org: Add image to product ────────────────────────────────────────────

  async addImage(productId: string, userId: string, dto: AddProductImageDto) {
    await this.assertOwnership(productId, userId)

    const image = await this.prisma.productImage.create({
      data: { productId, imageUrl: dto.imageUrl },
    })

    this.logger.log(`Image added to product ${productId}`)
    return image
  }

  // ─── Org: Remove image from product ──────────────────────────────────────

  async removeImage(productId: string, imageId: string, userId: string) {
    await this.assertOwnership(productId, userId)

    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    })

    if (!image) throw new NotFoundException('Image not found on this product')

    await this.prisma.productImage.delete({ where: { id: imageId } })
    return { message: 'Image removed successfully' }
  }

  // ─── Internal: Get org's own products ────────────────────────────────────

  async findMyProducts(userId: string, query: ListProductsDto & PaginationDto) {
    const orgId = await this.organisationsService.resolveOrgId(userId)
    const { search } = query

    const where: Prisma.ProductWhereInput = {
      organisationId: orgId,
      deletedAt: null,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      createdAt: 'desc',
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: Number(query.skip) || 0,
        take: Number(query.limit) || 20,
        orderBy,
        include: {
          images: true,
          _count: { select: { reservations: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ])

    return paginate(items, total, query as PaginationDto)
  }

  // ─── Private: Ownership guard ─────────────────────────────────────────────

  private async assertOwnership(productId: string, userId: string): Promise<void> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      include: { organisation: { select: { userId: true } } },
    })

    if (!product) throw new NotFoundException('Product not found')

    if (product.organisation.userId !== userId) {
      throw new ForbiddenException('You do not own this product')
    }
  }
}