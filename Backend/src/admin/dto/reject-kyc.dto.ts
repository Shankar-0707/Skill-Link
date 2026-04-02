import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RejectKycDto {
  @ApiProperty({
    example: 'Aadhaar image is unreadable. Please upload a clearer scan.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(2000)
  rejectionReason: string;
}
