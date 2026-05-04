import { IsOptional, IsString, MaxLength } from 'class-validator';

export class BlacklistUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
