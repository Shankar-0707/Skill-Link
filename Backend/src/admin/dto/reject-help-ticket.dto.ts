import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RejectHelpTicketDto {
  @ApiProperty({
    example:
      'This request was rejected because the ticket does not include enough details to investigate.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(2000)
  rejectionReason: string;
}
