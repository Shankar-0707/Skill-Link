import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UploadKycDocumentDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.AADHAAR })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  documentType: DocumentType;
}
