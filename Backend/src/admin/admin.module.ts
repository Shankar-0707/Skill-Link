import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminKycController } from './admin-kyc.controller';
import { AdminKycService } from './admin-kyc.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminKycController, AdminDashboardController],
  providers: [AdminKycService, AdminDashboardService],
})
export class AdminModule {}
