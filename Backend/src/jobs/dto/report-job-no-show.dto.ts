import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReportJobNoShowDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
