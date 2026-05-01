import { Controller, Get } from '@nestjs/common';

@Controller('ping')
export class PingController {
  @Get()
  ping(): { status: string } {
    return { status: 'ok' };
  }
}
