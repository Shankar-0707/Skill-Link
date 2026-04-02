import {
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateBidDto {
  @IsNumber()
  @Min(1)
  bidAmount: number;

  @IsNumber()
  @Min(0.5)
  @Max(999)
  @IsOptional()
  estimatedHours?: number;

  @IsString()
  @IsOptional()
  coverNote?: string;

  @IsDateString()
  @IsOptional()
  availableFrom?: string;
}
