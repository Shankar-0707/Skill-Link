import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guards';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SkipRateLimit } from '../common/decorators/skip-rate-limit.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@SkipRateLimit()
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  /**
   * GET /invoices/job/:jobId
   * Returns the invoice data for a specific completed job.
   */
  @Get('job/:jobId')
  @Roles('CUSTOMER', 'WORKER')
  getInvoiceByJobId(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.invoiceService.getInvoiceByJobId(jobId, userId);
  }

  /**
   * GET /invoices/job/:jobId/download
   * Streams the invoice PDF for download.
   */
  @Get('job/:jobId/download')
  @Roles('CUSTOMER', 'WORKER')
  async downloadInvoice(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser('sub') userId: string,
    @Res() res: Response,
  ) {
    const { buffer, invoiceNumber } =
      await this.invoiceService.downloadInvoicePdf(jobId, userId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoiceNumber}.pdf"`,
      'Content-Length': buffer.length.toString(),
    });

    res.end(buffer);
  }
}
