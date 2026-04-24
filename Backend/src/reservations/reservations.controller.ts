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
} from '@nestjs/common';
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
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto,
  CancelReservationDto,
  ListReservationsDto,
  ListIncomingReservationsDto,
  VerifyPickupDto,
  RejectReservationDto,
} from './dto/reservation.dto';
import * as common from '../common';
import { RolesGuard, Roles } from '../common';

@ApiTags('Reservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // ─── Customer endpoints ───────────────────────────────────────────────────

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a reservation for a product',
    description:
      'Atomically: checks stock, decrements it, creates the reservation, and returns a mock checkout URL for payment.',
  })
  @ApiCreatedResponse({
    description: 'Reservation created. Response includes checkoutUrl to redirect customer for payment.',
  })
  @ApiConflictResponse({ description: 'Insufficient stock' })
  @ApiBadRequestResponse({ description: 'Product unavailable' })
  create(
    @common.CurrentUser() user: common.JwtPayload,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.create(user.sub, dto);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: "List the authenticated customer's own reservations" })
  @ApiOkResponse({ description: 'Paginated reservation list' })
  findMy(
    @common.CurrentUser() user: common.JwtPayload,
    @Query() query: ListReservationsDto & common.PaginationDto,
  ) {
    return this.reservationsService.findMyReservations(user.sub, query);
  }

  @Get('my/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Get a single reservation detail (customer view — includes OTP when CONFIRMED)' })
  @ApiNotFoundResponse({ description: 'Reservation not found' })
  findMyById(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: common.JwtPayload,
  ) {
    return this.reservationsService.findMyReservationById(id, user.sub);
  }

  // ─── Organisation endpoints ───────────────────────────────────────────────

  @Get('incoming')
  @UseGuards(RolesGuard)
  @Roles(Role.ORGANISATION)
  @ApiOperation({ summary: "List reservations for the org's products" })
  @ApiOkResponse({ description: 'Paginated incoming reservations' })
  findIncoming(
    @common.CurrentUser() user: common.JwtPayload,
    @Query() query: ListIncomingReservationsDto & common.PaginationDto,
  ) {
    return this.reservationsService.findIncomingReservations(user.sub, query);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(Role.ORGANISATION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm a pending reservation',
    description:
      'Transitions PENDING → CONFIRMED. Generates a 4-digit pickup OTP for the customer. Only the owning org can do this.',
  })
  @ApiOkResponse({ description: 'Reservation confirmed, OTP generated' })
  confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: common.JwtPayload,
  ) {
    return this.reservationsService.confirm(id, user.sub);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.ORGANISATION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a pending reservation',
    description:
      'Org rejects a PENDING reservation. Restores stock and refunds escrow to customer virtual wallet.',
  })
  @ApiOkResponse({ description: 'Reservation rejected, stock restored, escrow refunded' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: common.JwtPayload,
    @Body() dto: RejectReservationDto,
  ) {
    return this.reservationsService.reject(id, user.sub, dto);
  }

  @Patch(':id/verify-pickup')
  @UseGuards(RolesGuard)
  @Roles(Role.ORGANISATION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify customer OTP and mark reservation as picked up',
    description:
      'Org enters the 4-digit OTP provided by the customer. On success: CONFIRMED → PICKED_UP and escrow released to org virtual wallet.',
  })
  @ApiOkResponse({ description: 'Pickup verified, escrow released to org wallet' })
  @ApiBadRequestResponse({ description: 'Invalid or expired OTP' })
  verifyPickup(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: common.JwtPayload,
    @Body() dto: VerifyPickupDto,
  ) {
    return this.reservationsService.verifyOtpAndPickup(id, user.sub, dto);
  }

  // ─── Shared: cancel (customer or org) ────────────────────────────────────

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a reservation',
    description:
      'Either customer or org can cancel. Restores stock and refunds escrow to customer virtual wallet.',
  })
  @ApiOkResponse({ description: 'Reservation cancelled, stock restored, escrow refunded to wallet' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: common.JwtPayload,
    @Body() dto: CancelReservationDto,
  ) {
    return this.reservationsService.cancel(id, user, dto);
  }

  // ─── Shared: get one (customer sees own, org sees their products') ────────

  @Get(':id')
  @ApiOperation({ summary: 'Get a single reservation by ID' })
  @ApiOkResponse({ description: 'Reservation detail with product, customer, escrow, and payment info' })
  @ApiNotFoundResponse({ description: 'Reservation not found' })
  @ApiForbiddenResponse({ description: 'Access denied to this reservation' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @common.CurrentUser() user: common.JwtPayload,
  ) {
    return this.reservationsService.findOne(id, user);
  }
}
