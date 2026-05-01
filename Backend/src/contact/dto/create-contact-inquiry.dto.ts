import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactInquiryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName: string;

  @IsEmail()
  @MaxLength(120)
  email: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message: string;
}
