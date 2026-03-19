import { Module } from '@nestjs/common'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'
import { OrganisationsModule } from '../organisations/organisations.module'

@Module({
  imports: [OrganisationsModule], // needed for resolveOrgId + ownership checks
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}