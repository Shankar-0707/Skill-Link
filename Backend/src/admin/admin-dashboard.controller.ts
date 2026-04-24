import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common';
import { AdminDashboardService } from './admin-dashboard.service';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard metrics (users, trends)' })
  @ApiOkResponse({ description: 'Dashboard metrics' })
  getDashboard() {
    return this.adminDashboardService.getDashboardMetrics();
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get all active jobs' })
  @ApiOkResponse({ description: 'Active jobs list' })
  getActiveJobs() {
    return this.adminDashboardService.getActiveJobs();
  }

  @Get('reservations')
  @ApiOperation({ summary: 'Get recent reservations' })
  @ApiOkResponse({ description: 'Recent reservations list' })
  getRecentReservations() {
    return this.adminDashboardService.getRecentReservations();
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Get aggregated admin analytics for charts and leaderboards',
  })
  @ApiOkResponse({ description: 'Admin analytics data' })
  getAnalytics() {
    return this.adminDashboardService.getAnalytics();
  }

  @Get('escrows')
  @ApiOperation({
    summary: 'List all escrows (HELD, RELEASED, REFUNDED) for admin oversight',
  })
  @ApiOkResponse({ description: 'Array of escrows with transaction context' })
  getEscrows() {
    return this.adminDashboardService.getEscrows();
  }

  @Post('escrows/:id/release')
  @ApiOperation({
    summary: 'Admin releases a HELD escrow',
    description: 'Credits the payee (org or worker) virtual wallet.',
  })
  @ApiOkResponse({ description: 'Escrow released' })
  releaseEscrow(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminDashboardService.adminReleaseEscrow(id);
  }

  @Post('escrows/:id/refund')
  @ApiOperation({
    summary: 'Admin refunds a HELD escrow',
    description: 'Credits the customer virtual wallet (simulated refund).',
  })
  @ApiOkResponse({ description: 'Escrow refunded' })
  refundEscrow(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminDashboardService.adminRefundEscrow(id);
  }
}
