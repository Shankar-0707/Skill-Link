import { Module } from '@nestjs/common';
import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';
import { PlatformContractService } from './platform-contract.service';
import { PlatformContractGateService } from './platform-contract-gate.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WorkersController],
  providers: [WorkersService, PlatformContractService, PlatformContractGateService],
  exports: [PlatformContractGateService, PlatformContractService],
})
export class WorkersModule {}
