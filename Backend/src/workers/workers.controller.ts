import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.workersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workersService.findOne(id);
  }
}
