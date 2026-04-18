import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../common';
import type { JwtPayload } from '../common';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ─── Mock Checkout — Public (no auth needed before payment) ──────────────

  @Get('checkout/:providerPaymentId')
  @ApiOperation({
    summary: 'Get payment details for the mock checkout page',
    description: 'Returns amount, product/job info for display on checkout screen.',
  })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  @ApiBadRequestResponse({ description: 'Payment already processed' })
  getCheckout(@Param('providerPaymentId') providerPaymentId: string) {
    return this.paymentsService.getPaymentForCheckout(providerPaymentId);
  }

  @Post('confirm/:providerPaymentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm a successful payment',
    description:
      'Called by the frontend after a successful Razorpay checkout. ' +
      'Marks payment as SUCCESS and creates Escrow in HELD state.',
  })
  confirmPayment(@Param('providerPaymentId') providerPaymentId: string) {
    return this.paymentsService.handlePaymentSuccess(providerPaymentId);
  }

  @Post('fail/:providerPaymentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Report a failed payment',
    description: 'Called by the frontend if the Razorpay checkout fails or is cancelled.',
  })
  reportFailure(@Param('providerPaymentId') providerPaymentId: string) {
    return this.paymentsService.handlePaymentFailure(providerPaymentId);
  }

  // ─── Wallet (Authenticated) ───────────────────────────────────────────────

  @Get('wallet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get logged-in user wallet balance and transaction history',
  })
  @ApiOkResponse({ description: 'Wallet with balance and last 50 transactions' })
  getMyWallet(@CurrentUser() user: JwtPayload) {
    return this.paymentsService.getMyWallet(user.sub);
  }
}
