import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guards';
import { BlacklistUserDto } from './dto/blacklist-user.dto';
import { AdminUsersService } from './admin-users.service';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users for admin console' })
  getUsers() {
    return this.adminUsersService.getUsers();
  }

  @Post(':id/blacklist')
  @ApiOperation({ summary: 'Blacklist a user and revoke active sessions' })
  blacklistUser(
    @Param('id') id: string,
    @CurrentUser() admin: JwtPayload,
    @Body() dto: BlacklistUserDto,
  ) {
    return this.adminUsersService.blacklistUser(id, admin.sub, dto.reason);
  }

  @Delete(':id/blacklist')
  @ApiOperation({ summary: 'Remove blacklist from a user' })
  unblacklistUser(@Param('id') id: string) {
    return this.adminUsersService.unblacklistUser(id);
  }
}
