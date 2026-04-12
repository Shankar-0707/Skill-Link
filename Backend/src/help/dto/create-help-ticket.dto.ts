import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateHelpTicketDto {
  @ApiProperty({
    example: 'Issue with reservation confirmation',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(150)
  subject: string;

  @ApiProperty({
    example:
      'I completed payment but my reservation is still showing as pending in the dashboard.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({
    example: '2f83bd82-1ca6-434a-a0fb-6b6d3d5d77f9',
    description: 'Optional job connected to this ticket.',
  })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional({
    example: '2f83bd82-1ca6-434a-a0fb-6b6d3d5d77f9',
    description: 'Optional reservation connected to this ticket.',
  })
  @IsOptional()
  @IsUUID()
  reservationId?: string;

  @ApiPropertyOptional({
    example: 'e4cb953d-52b7-4996-97aa-97bbcbdb70fe',
    description: 'Optional worker profile connected to this ticket.',
  })
  @IsOptional()
  @IsUUID()
  workerId?: string;

  @ApiPropertyOptional({
    example: '680dfec8-97b0-44f8-b42a-d359c2bf366f',
    description: 'Optional organisation profile connected to this ticket.',
  })
  @IsOptional()
  @IsUUID()
  organisationId?: string;
}
