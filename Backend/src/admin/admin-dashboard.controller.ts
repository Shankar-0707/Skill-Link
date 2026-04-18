import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guards';
import { AdminDashboardService } from './admin-dashboard.service';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
  ) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get admin dashboard metrics' })
  getMetrics() {
    return this.adminDashboardService.getDashboardMetrics();
  }

  @Get('active-jobs')
  @ApiOperation({
    summary:
      'Get active jobs for admin dashboard and jobs page (POSTED, ASSIGNED, IN_PROGRESS)',
  })
  getActiveJobs() {
    return this.adminDashboardService.getActiveJobs();
  }

  @Get('reservations')
  @ApiOperation({
    summary: 'Get recent reservations for admin dashboard and reservations page',
  })
  getRecentReservations() {
    return this.adminDashboardService.getRecentReservations();
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Get aggregated admin analytics for charts and leaderboards',
  })
  getAnalytics() {
    return this.adminDashboardService.getAnalytics();
  }
}
