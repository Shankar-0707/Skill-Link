import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateHelpTicketDto } from './dto/create-help-ticket.dto';
import { HelpService } from './help.service';

@ApiTags('Help Center')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('help')
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Post('tickets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Raise a new help-center ticket' })
  createTicket(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateHelpTicketDto,
  ) {
    return this.helpService.createTicket(userId, dto);
  }

  @Get('tickets/my')
  @ApiOperation({ summary: 'List the logged-in user help-center tickets' })
  getMyTickets(@CurrentUser('sub') userId: string) {
    return this.helpService.getMyTickets(userId);
  }
}
