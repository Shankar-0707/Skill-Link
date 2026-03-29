import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

// Query

export class ListOrganisationsDto {
  @ApiPropertyOptional({ description: 'Filter by business type' })
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiPropertyOptional({
    description: 'Search by business name (partial match)',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  search?: string;
}

// Update

export class UpdateOrganisationDto {
  @ApiPropertyOptional({ example: 'GreenBuild Materials' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  businessName?: string;

  @ApiPropertyOptional({ example: 'Construction Supplies' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  businessType?: string;

  @ApiPropertyOptional({
    example: 'We supply eco-friendly building materials.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

// Response

export class OrganisationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() businessName: string;
  @ApiProperty() businessType: string;
  @ApiPropertyOptional() description?: string | null;
  @ApiProperty() ratingAvg: number;
  @ApiProperty() ratingCount: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

// ye code NestJS me Organisation related API ke liye DTOs (Data Transfer Objects) define karta hai.
// DTO ka kaam hota hai:

// request data validate karna

// API documentation generate karna (Swagger)

// response ka structure define karna
