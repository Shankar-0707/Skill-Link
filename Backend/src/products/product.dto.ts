import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  MaxLength,
  IsNotEmpty,
  IsBoolean,
  IsArray,
  IsUrl,
  MinLength,
} from 'class-validator'

// ─── Create ──────────────────────────────────────────────────────────────────

export class CreateProductDto {
  @ApiProperty({ example: 'Eco Bricks Pack' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name: string

  @ApiPropertyOptional({ example: 'Recycled construction bricks, pack of 50.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiProperty({ example: 500, description: 'Price in smallest currency unit (paise/cents)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  stockQuantity: number

  @ApiPropertyOptional({
    type: [String],
    example: ['https://cdn.example.com/img1.jpg'],
    description: 'Image URLs to attach on creation',
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls?: string[]
}

// ─── Update ──────────────────────────────────────────────────────────────────

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Eco Bricks Pack - Revised' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({ example: 599 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price?: number

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

// ─── Add image ────────────────────────────────────────────────────────────────

export class AddProductImageDto {
  @ApiProperty({ example: 'https://cdn.example.com/product/img.jpg' })
  @IsUrl()
  imageUrl: string
}

// ─── Query ────────────────────────────────────────────────────────────────────

export class ListProductsDto {
  @ApiPropertyOptional({ description: 'Filter by organisationId' })
  @IsOptional()
  @IsString()
  organisationId?: string

  @ApiPropertyOptional({ description: 'Search by product name (partial match)' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  search?: string

  @ApiPropertyOptional({ description: 'Minimum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number

  @ApiPropertyOptional({ description: 'Maximum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  maxPrice?: number

  @ApiPropertyOptional({ description: 'Sort field', enum: ['price', 'createdAt', 'name'] })
  @IsOptional()
  @IsString()
  sortBy?: 'price' | 'createdAt' | 'name'

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc'
}