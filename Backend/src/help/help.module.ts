import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { HelpController } from './help.controller';
import { HelpService } from './help.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HelpController],
  providers: [HelpService],
  exports: [HelpService],
})
export class HelpModule {}
