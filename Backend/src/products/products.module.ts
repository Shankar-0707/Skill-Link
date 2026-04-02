import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { OrganisationsModule } from '../organisations/organisations.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [OrganisationsModule, AuthModule], // needed for resolveOrgId + ownership checks
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
