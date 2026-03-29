import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guards';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { AdminKycService } from './admin-kyc.service';
import { AdminKycListQueryDto } from './dto/admin-kyc-query.dto';
import { RejectKycDto } from './dto/reject-kyc.dto';
@ApiTags('Admin — KYC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminKycController {
  constructor(private readonly adminKycService: AdminKycService) {}

  @Get('kyc-requests')
  @ApiOperation({
    summary: 'List KYC requests (paginated, optional status filter)',
  })
  list(@Query() query: AdminKycListQueryDto) {
    return this.adminKycService.listRequests(query);
  }

  @Post('kyc/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a pending KYC request' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.adminKycService.approve(id, user.sub);
  }

  @Post('kyc/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a pending KYC request' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RejectKycDto,
  ) {
    return this.adminKycService.reject(id, user.sub, dto.rejectionReason);
  }
}
