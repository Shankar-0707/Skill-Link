import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ResolveHelpTicketDto {
  @ApiPropertyOptional({
    example: 'Payment issue confirmed and reservation status synced manually.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resolutionNote?: string;
}
