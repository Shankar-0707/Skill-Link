import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guards';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { KYC_UPLOAD_MAX_BYTES } from './kyc.constants';
import { KycService } from './kyc.service';
import { UploadKycDocumentDto } from './dto/upload-document.dto';

@ApiTags('KYC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.WORKER)
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('upload-document')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a KYC document (stored on Cloudinary)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'documentType'],
      properties: {
        file: { type: 'string', format: 'binary' },
        documentType: {
          type: 'string',
          enum: [
            'AADHAAR',
            'PAN',
            'DRIVING_LICENSE',
            'PASSPORT',
            'PROFILE_PHOTO',
            'SKILL_CERTIFICATE',
          ],
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: KYC_UPLOAD_MAX_BYTES },
    }),
  )
  uploadDocument(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UploadKycDocumentDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException({
        message: 'file is required',
        code: 'KYC_FILE_REQUIRED',
      });
    }
    return this.kycService.uploadDocument(user.sub, file, dto.documentType);
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit KYC for admin review' })
  submit(@CurrentUser() user: JwtPayload) {
    return this.kycService.submitKyc(user.sub);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Current KYC status, drafts, and submission eligibility',
  })
  status(@CurrentUser() user: JwtPayload) {
    return this.kycService.getStatus(user.sub);
  }
}
