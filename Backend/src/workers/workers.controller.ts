import { Controller, Get, Param, Patch, Body, UseGuards, Post } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { PlatformContractService } from './platform-contract.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guards';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workers')
export class WorkersController {
  constructor(
    private readonly workersService: WorkersService,
    private readonly platformContractService: PlatformContractService,
  ) {}

  @Get('profile/me')
  @Roles('WORKER')
  async getMe(@CurrentUser('sub') userId: string) {
    return this.workersService.getProfileByUserId(userId);
  }

  @Patch('profile/me')
  @Roles('WORKER')
  async updateMe(
    @CurrentUser('sub') userId: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.workersService.updateProfileByUserId(userId, data);
  }

  @Get('platform-contract/status')
  @Roles('WORKER')
  getPlatformContractStatus(@CurrentUser('sub') userId: string) {
    return this.platformContractService.getStatusByUserId(userId);
  }

  @Post('platform-contract/sign')
  @Roles('WORKER')
  signPlatformContract(@CurrentUser('sub') userId: string) {
    return this.platformContractService.signByUserId(userId);
  }

  @Get()
  async findAll() {
    return this.workersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workersService.findOne(id);
  }
}
