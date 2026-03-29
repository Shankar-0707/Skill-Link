import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminKycController } from './admin-kyc.controller';
import { AdminKycService } from './admin-kyc.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminKycController],
  providers: [AdminKycService],
})
export class AdminModule {}
