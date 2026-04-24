import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '@prisma/client';
import {
  IsUUID,
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
} from 'class-validator';

// ─── Create ──────────────────────────────────────────────────────────────────

export class CreateReservationDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

// ─── Cancel ──────────────────────────────────────────────────────────────────

export class CancelReservationDto {
  @ApiPropertyOptional({ example: 'Changed my mind about the order' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

// ─── Query ────────────────────────────────────────────────────────────────────

export class ListReservationsDto {
  @ApiPropertyOptional({
    enum: ReservationStatus,
    description: 'Filter by reservation status',
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}

// ─── Org query (incoming reservations for their products) ────────────────────

export class ListIncomingReservationsDto {
  @ApiPropertyOptional({ enum: ReservationStatus })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({ description: 'Filter by a specific productId' })
  @IsOptional()
  @IsUUID()
  productId?: string;
}

// ─── Org: Verify OTP to confirm pickup ───────────────────────────────────────

export class VerifyPickupDto {
  @ApiProperty({ example: '4821', description: '4-digit OTP shown to customer after org confirms' })
  @IsString()
  otp: string;
}

// ─── Org: Reject a pending reservation ───────────────────────────────────────

export class RejectReservationDto {
  @ApiPropertyOptional({ example: 'Out of stock at this time' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
