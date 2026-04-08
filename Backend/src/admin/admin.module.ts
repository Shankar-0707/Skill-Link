import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminHelpController } from './admin-help.controller';
import { AdminHelpService } from './admin-help.service';
import { AdminKycController } from './admin-kyc.controller';
import { AdminKycService } from './admin-kyc.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    AdminKycController,
    AdminDashboardController,
    AdminHelpController,
    AdminUsersController,
  ],
  providers: [
    AdminKycService,
    AdminDashboardService,
    AdminHelpService,
    AdminUsersService,
  ],
})
export class AdminModule {}
