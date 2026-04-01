import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ListProductsDto,
  AddProductImageDto,
} from './product.dto';
import * as common from '../common';
import { RolesGuard } from '../common';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { PRODUCT_IMAGE_MAX_BYTES } from './products.constants';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ─── Public endpoints ─────────────────────────────────────────────────────
  // Admin ke liye h ye bhi
  @Get()
  @ApiOperation({ summary: 'List all active products with filters (public)' })
  @ApiOkResponse({ description: 'Paginated product list' })
  findAll(@Query() query: ListProductsDto & common.PaginationDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID (public)' })
  @ApiOkResponse({ description: 'Product detail with images and org info' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  // ─── Organisation-only endpoints ─────────────────────────────────────────

  @Get('me/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @UseGuards(MockAuthGuard, common.RolesGuard)
  @common.Roles(Role.ORGANISATION)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "List the authenticated org's own products (all states)",
  })
  getMyProducts(
    @common.CurrentUser() user: common.JwtPayload,
    @Query() query: ListProductsDto & common.PaginationDto,
  ) {
    return this.productsService.findMyProducts(user.sub, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @UseGuards(MockAuthGuard, common.RolesGuard)
  @common.Roles(Role.ORGANISATION)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiCreatedResponse({ description: 'Product created successfully' })
  @ApiForbiddenResponse({
    description: 'Only ORGANISATION role can access this',
  })
  create(
    @common.CurrentUser() user: common.JwtPayload,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(user.sub, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @UseGuards(MockAuthGuard, common.RolesGuard)
  @common.Roles(Role.ORGANISATION)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a product (org must own it)' })
  @ApiOkResponse({ description: 'Product updated' })
  @ApiForbiddenResponse({ description: 'You do not own this product' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: common.JwtPayload,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @UseGuards(MockAuthGuard, common.RolesGuard)
  @common.Roles(Role.ORGANISATION)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete a product (fails if active reservations exist)',
  })
  @ApiOkResponse({ description: 'Product deleted' })
  @ApiBadRequestResponse({ description: 'Active reservations exist' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: common.JwtPayload,
  ) {
    return this.productsService.remove(id, user.sub);
  }

  // ─── Product image management ─────────────────────────────────────────────

  @Post(':id/images/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @common.Roles(Role.ORGANISATION)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a product image file to Cloudinary',
    description:
      'Stores the file in Cloudinary and saves the secure HTTPS URL in ProductImage (same as manual URL flow).',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: PRODUCT_IMAGE_MAX_BYTES },
    }),
  )
  uploadProductImage(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException({
        message: 'file is required',
        code: 'PRODUCT_IMAGE_REQUIRED',
      });
    }
    return this.productsService.addImageUpload(id, user.sub, file);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @UseGuards(MockAuthGuard, common.RolesGuard)
  @common.Roles(Role.ORGANISATION)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add an image URL to a product (external or Cloudinary URL)',
  })
  addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: JwtPayload,
    @Body() dto: AddProductImageDto,
  ) {
    return this.productsService.addImage(id, user.sub, dto);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @UseGuards(MockAuthGuard, common.RolesGuard)
  @common.Roles(Role.ORGANISATION)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove an image from a product' })
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @common.CurrentUser() user: common.JwtPayload,
  ) {
    return this.productsService.removeImage(id, imageId, user.sub);
  }
}
