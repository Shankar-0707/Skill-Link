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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guards';
import { AdminHelpService } from './admin-help.service';
import { AdminHelpListQueryDto } from './dto/admin-help-query.dto';
import { RejectHelpTicketDto } from './dto/reject-help-ticket.dto';
import { ResolveHelpTicketDto } from './dto/resolve-help-ticket.dto';

@ApiTags('Admin Help Center')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminHelpController {
  constructor(private readonly adminHelpService: AdminHelpService) {}

  @Get('help-tickets')
  @ApiOperation({
    summary: 'List help-center tickets for the admin dashboard',
  })
  list(@Query() query: AdminHelpListQueryDto) {
    return this.adminHelpService.listTickets(query);
  }

  @Post('help-tickets/:id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve an open help-center ticket' })
  resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ResolveHelpTicketDto,
  ) {
    return this.adminHelpService.resolve(id, user.sub, dto.resolutionNote);
  }

  @Post('help-tickets/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject an open help-center ticket' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RejectHelpTicketDto,
  ) {
    return this.adminHelpService.reject(id, user.sub, dto.rejectionReason);
  }
}
