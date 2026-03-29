import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  // schema: budget Float?
  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  // schema: scheduledAt DateTime?
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
