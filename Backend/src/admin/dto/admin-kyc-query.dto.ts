import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import {
  KycRequestStatus,
  type KycRequestStatusValue,
} from '../../kyc/kyc-request-status';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * Re-declare page/limit so @Type(() => Number) runs on this class. Inherited
 * PaginationDto fields often stay strings for @Query() (Prisma needs Int).
 */
export class AdminKycListQueryDto extends PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  override page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  override limit: number = 20;

  @ApiPropertyOptional({
    description:
      'When true, returns requests in any status. When false/omitted, defaults to PENDING queue only unless status is set.',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  all?: boolean;

  @ApiPropertyOptional({ enum: KycRequestStatus })
  @IsOptional()
  @IsEnum(KycRequestStatus)
  status?: KycRequestStatusValue;
}
