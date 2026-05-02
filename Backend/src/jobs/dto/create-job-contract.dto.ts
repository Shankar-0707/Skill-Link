import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateJobContractDto {
  @IsNumber()
  @Min(0)
  cost: number;

  @IsString()
  @IsNotEmpty()
  timing: string;

  @IsDateString()
  scheduledAt: string;

  @IsString()
  @IsNotEmpty()
  scope: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

