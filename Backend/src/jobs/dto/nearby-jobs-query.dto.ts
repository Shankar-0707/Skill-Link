import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyJobsQueryDto {
  @Type(() => Number)
  @IsNumber()
  lat: number;  // Worker's current latitude

  @Type(() => Number)
  @IsNumber()
  lng: number;  // Worker's current longitude

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  radiusKm?: number;  // Default: 10km

  @IsString()
  @IsOptional()
  category?: string;  // Optional skill category filter
}