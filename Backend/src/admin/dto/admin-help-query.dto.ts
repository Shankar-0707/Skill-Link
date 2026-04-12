import { ApiPropertyOptional } from '@nestjs/swagger';
import { HelpTicketStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class AdminHelpListQueryDto extends PaginationDto {
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
      'When true, returns tickets from all statuses. When false/omitted, defaults to OPEN queue unless status is set.',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  all?: boolean;

  @ApiPropertyOptional({ enum: HelpTicketStatus })
  @IsOptional()
  @IsEnum(HelpTicketStatus)
  status?: HelpTicketStatus;
}
