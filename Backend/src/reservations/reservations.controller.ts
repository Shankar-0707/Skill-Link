import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { MockAuthGuard } from '../common/guards/mock-auth.guard'

import { ReservationsService } from './reservations.service'
import {
  CreateReservationDto,
  CancelReservationDto,
  ListReservationsDto,
  ListIncomingReservationsDto,
} from './dto/reservation.dto'
import * as common from '../common'

@ApiTags('Reservations')
@ApiBearerAuth()
// @UseGuards(common.JwtAuthGuard) // All reservation endpoints require auth
@UseGuards(MockAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // ─── Customer endpoints ───────────────────────────────────────────────────

  @Post()
  @UseGuards(common.RolesGuard)
  @common.Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a reservation for a product',
    description:
      'Atomically: checks stock, decrements it, creates the reservation, and holds escrow.',
  })
  @ApiCreatedResponse({ description: 'Reservation created, escrow held' })
  @ApiConflictResponse({ description: 'Insufficient stock' })
  @ApiBadRequestResponse({ description: 'Product unavailable' })
  create(@common.CurrentUser() user: common.JwtPayload, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(user.sub, dto)
  }

  @Get('my')
  @UseGuards(common.RolesGuard)
  @common.Roles(Role.CUSTOMER)
  @ApiOperation({ summary: "List the authenticated customer's own reservations" })
  @ApiOkResponse({ description: 'Paginated reservation list' })
  findMy(
    @common.CurrentUser() user: common.JwtPayload,
    @Query() query: ListReservationsDto & common.PaginationDto,
  ) {
    return this.reservationsService.findMyReservations(user.sub, query)
  }

  @Patch(':id/pickup')
  @UseGuards(common.RolesGuard)
  @common.Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark a reservation as picked up',
    description: 'Transitions CONFIRMED → PICKED_UP and releases escrow to the organisation.',
  })
  @ApiOkResponse({ description: 'Reservation marked as picked up, escrow released' })
  @ApiBadRequestResponse({ description: 'Reservation is not in CONFIRMED state' })
  @ApiForbiddenResponse({ description: 'Reservation does not belong to you' })
  markPickedUp(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: common.JwtPayload,
  ) {
    return this.reservationsService.markPickedUp(id, user.sub)
  }

  // ─── Organisation endpoints ───────────────────────────────────────────────

  @Get('incoming')
  @UseGuards(common.RolesGuard)
  @common.Roles(Role.ORGANISATION)
  @ApiOperation({ summary: "List reservations for the org's products" })
  @ApiOkResponse({ description: 'Paginated incoming reservations' })
  findIncoming(
    @common.CurrentUser() user: common.JwtPayload,
    @Query() query: ListIncomingReservationsDto & common.PaginationDto,
  ) {
    return this.reservationsService.findIncomingReservations(user.sub, query)
  }

  @Patch(':id/confirm')
  @UseGuards(common.RolesGuard)
  @common.Roles(Role.ORGANISATION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm a pending reservation',
    description: 'Transitions PENDING → CONFIRMED. Only the owning org can do this.',
  })
  @ApiOkResponse({ description: 'Reservation confirmed' })
  @ApiBadRequestResponse({ description: 'Reservation is not in PENDING state' })
  @ApiForbiddenResponse({ description: 'You do not own the product for this reservation' })
  confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: common.JwtPayload,
  ) {
    return this.reservationsService.confirm(id, user.sub)
  }

  // ─── Shared: cancel (customer or org) ────────────────────────────────────

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a reservation',
    description:
      'Either customer or org can cancel. Restores stock and refunds escrow to customer.',
  })
  @ApiOkResponse({ description: 'Reservation cancelled, stock restored, escrow refunded' })
  @ApiBadRequestResponse({ description: 'Cannot cancel from current state' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: common.JwtPayload,
    @Body() dto: CancelReservationDto,
  ) {
    return this.reservationsService.cancel(id, user, dto)
  }

  // ─── Shared: get one (customer sees own, org sees their products') ────────

  @Get(':id')
  @ApiOperation({ summary: 'Get a single reservation by ID' })
  @ApiOkResponse({ description: 'Reservation detail with product, customer, and escrow info' })
  @ApiNotFoundResponse({ description: 'Reservation not found' })
  @ApiForbiddenResponse({ description: 'Access denied to this reservation' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: common.JwtPayload,
  ) {
    return this.reservationsService.findOne(id, user)
  }
}