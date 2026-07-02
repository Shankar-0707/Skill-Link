import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../auth/mail.service';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

/** Shape of the data we snapshot into an Invoice row. */
interface InvoiceData {
  id: string;
  invoiceNumber: string;
  jobId: string;
  amount: number;
  workerPayout: number;
  platformFee: number;
  jobTitle: string;
  jobDescription: string;
  jobCategory: string;
  jobScope: string | null;
  scheduledAt: Date | null;
  completedAt: Date;
  customerName: string | null;
  customerEmail: string;
  customerPhone: string | null;
  workerName: string | null;
  workerEmail: string;
  workerPhone: string | null;
  workerSkills: string[];
}

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────

  /**
   * Called inside confirmJobCompletion *before* contract cleanup.
   * Accepts an optional Prisma transaction client so the Invoice
   * row is created atomically with the rest of the confirmation logic.
   */
  async generateInvoice(jobId: string, tx?: any): Promise<void> {
    const db = tx ?? this.prisma;

    // ── 1. Fetch all required data ──────────────────────────────
    const job = await db.job.findUnique({
      where: { id: jobId },
      include: {
        customer: {
          include: { user: { select: { name: true, email: true, phone: true } } },
        },
        worker: {
          include: { user: { select: { name: true, email: true, phone: true } } },
        },
        contracts: {
          where: { status: 'ACCEPTED' },
          orderBy: { createdAt: 'desc' as const },
          take: 1,
        },
        escrow: true,
      },
    });

    if (!job || !job.worker || !job.customer) {
      this.logger.warn(`Cannot generate invoice for job ${jobId}: missing data`);
      return;
    }

    const contract = job.contracts?.[0];
    const escrow = job.escrow;

    // Financial figures
    const totalAmount = escrow?.amount ?? contract?.cost ?? job.budget ?? 0;
    const platformFee = escrow?.platformFee ?? totalAmount * 0.05;
    const workerPayout = escrow?.originalAmount ?? totalAmount - platformFee;

    // ── 2. Generate invoice number ──────────────────────────────
    const invoiceNumber = await this.generateInvoiceNumber(db);

    // ── 3. Create Invoice record ────────────────────────────────
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        jobId,
        customerId: job.customer.id,
        workerId: job.worker.id,
        amount: totalAmount,
        workerPayout,
        platformFee,
        jobTitle: job.title,
        jobDescription: job.description,
        jobCategory: job.category,
        jobScope: contract?.scope ?? null,
        scheduledAt: job.scheduledAt,
        completedAt: new Date(),
        customerName: job.customer.user.name,
        customerEmail: job.customer.user.email,
        customerPhone: job.customer.user.phone,
        workerName: job.worker.user.name,
        workerEmail: job.worker.user.email,
        workerPhone: job.worker.user.phone,
        workerSkills: job.worker.skills ?? [],
      },
    });

    // ── 4. Generate PDF & send emails (async, non-blocking) ─────
    // We intentionally do NOT await this so the transaction can commit
    // quickly. Email failures are logged but don't roll back the invoice.
    this.generateAndSendInvoice(invoice).catch((err) => {
      this.logger.error(
        `Failed to generate/send invoice PDF for ${invoiceNumber}: ${(err as Error).message}`,
      );
    });
  }

  /**
   * Fetch invoice data for a specific job — used by the controller.
   */
  async getInvoiceByJobId(jobId: string, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { jobId },
    });

    if (!invoice) throw new NotFoundException('Invoice not found for this job');

    // Access control: only the customer or worker involved can view
    const customer = await this.prisma.customer.findFirst({
      where: { id: invoice.customerId },
      select: { userId: true },
    });
    const worker = await this.prisma.worker.findFirst({
      where: { id: invoice.workerId },
      select: { userId: true },
    });

    if (customer?.userId !== userId && worker?.userId !== userId) {
      throw new ForbiddenException('You do not have access to this invoice');
    }

    return invoice;
  }

  /**
   * Generate and return the PDF buffer for download.
   */
  async downloadInvoicePdf(jobId: string, userId: string): Promise<{ buffer: Buffer; invoiceNumber: string }> {
    const invoice = await this.getInvoiceByJobId(jobId, userId);
    const buffer = await this.buildPdf(invoice as InvoiceData);
    return { buffer, invoiceNumber: invoice.invoiceNumber };
  }

  // ─────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────

  private async generateInvoiceNumber(db: any): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SL-INV-${year}-`;

    // Find the latest invoice for this year
    const latest = await db.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    });

    let seq = 1;
    if (latest) {
      const lastSeq = parseInt(latest.invoiceNumber.replace(prefix, ''), 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `${prefix}${String(seq).padStart(4, '0')}`;
  }

  private async generateAndSendInvoice(invoice: InvoiceData): Promise<void> {
    const pdfBuffer = await this.buildPdf(invoice);

    // Send to customer
    await this.sendInvoiceEmail({
      to: invoice.customerEmail,
      recipientName: invoice.customerName,
      invoice,
      pdfBuffer,
    });

    // Send to worker
    await this.sendInvoiceEmail({
      to: invoice.workerEmail,
      recipientName: invoice.workerName,
      invoice,
      pdfBuffer,
    });

    this.logger.log(
      `Invoice ${invoice.invoiceNumber} sent to ${invoice.customerEmail} and ${invoice.workerEmail}`,
    );
  }

  // ─────────────────────────────────────────────
  // PDF GENERATION (PDFKit)
  // ─────────────────────────────────────────────

  private async buildPdf(invoice: InvoiceData): Promise<Buffer> {
    // Generate QR code as a data URL pointing to the job detail page
    const frontendUrl = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
    const jobUrl = `${frontendUrl}/customer/jobs/${invoice.jobId}`;
    const qrDataUrl = await QRCode.toDataURL(jobUrl, {
      width: 120,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 50, right: 50 },
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: 'Skill-Link',
          Subject: `Invoice for ${invoice.jobTitle}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - 100; // 50px margins on each side
      const leftMargin = 50;
      const rightEdge = pageWidth - 50;

      // ── HEADER ──────────────────────────────────────────────
      // Dark header bar
      doc.rect(0, 0, pageWidth, 90).fill('#1a1a1a');

      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .fillColor('#ffffff')
        .text('SKILL-LINK', leftMargin, 25);

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#cccccc')
        .text('Service Marketplace Platform', leftMargin, 52);

      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .fillColor('#ffffff')
        .text('INVOICE', rightEdge - 120, 25, { width: 120, align: 'right' });

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#cccccc')
        .text(invoice.invoiceNumber, rightEdge - 160, 50, { width: 160, align: 'right' });

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#cccccc')
        .text(`Date: ${this.formatDate(invoice.completedAt)}`, rightEdge - 160, 63, {
          width: 160,
          align: 'right',
        });

      // ── CUSTOMER & WORKER DETAILS ───────────────────────────
      let y = 110;
      doc.fillColor('#000000');

      // Customer column (left)
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#666666').text('BILL TO', leftMargin, y);
      y += 14;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#1a1a1a')
        .text(invoice.customerName || 'Customer', leftMargin, y);
      y += 16;
      doc.font('Helvetica').fontSize(9).fillColor('#444444').text(invoice.customerEmail, leftMargin, y);
      y += 13;
      if (invoice.customerPhone) {
        doc.text(invoice.customerPhone, leftMargin, y);
        y += 13;
      }

      // Worker column (right)
      const rightCol = leftMargin + contentWidth / 2 + 20;
      let ry = 110;
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#666666').text('SERVICE PROVIDER', rightCol, ry);
      ry += 14;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#1a1a1a')
        .text(invoice.workerName || 'Worker', rightCol, ry);
      ry += 16;
      doc.font('Helvetica').fontSize(9).fillColor('#444444').text(invoice.workerEmail, rightCol, ry);
      ry += 13;
      if (invoice.workerPhone) {
        doc.text(invoice.workerPhone, rightCol, ry);
        ry += 13;
      }
      if (invoice.workerSkills.length > 0) {
        doc.text(`Skills: ${invoice.workerSkills.join(', ')}`, rightCol, ry);
        ry += 13;
      }

      // Separator line
      y = Math.max(y, ry) + 16;
      doc
        .moveTo(leftMargin, y)
        .lineTo(rightEdge, y)
        .strokeColor('#e0e0e0')
        .lineWidth(1)
        .stroke();

      // ── JOB DETAILS SECTION ─────────────────────────────────
      y += 18;
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#1a1a1a')
        .text('JOB DETAILS', leftMargin, y);

      y += 20;
      // Job details table
      const jobFields: Array<[string, string]> = [
        ['Title', invoice.jobTitle],
        ['Category', invoice.jobCategory],
        ['Description', this.truncate(invoice.jobDescription, 200)],
      ];
      if (invoice.scheduledAt) {
        jobFields.push(['Scheduled', this.formatDateTime(invoice.scheduledAt)]);
      }
      jobFields.push(['Completed', this.formatDate(invoice.completedAt)]);

      for (const [label, value] of jobFields) {
        // Label cell background
        doc.rect(leftMargin, y, 110, 20).fill('#f5f5f5').stroke();
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#333333')
          .text(label, leftMargin + 8, y + 5, { width: 94 });

        // Value cell
        doc.rect(leftMargin + 110, y, contentWidth - 110, 20).fill('#ffffff').stroke();
        doc.rect(leftMargin + 110, y, contentWidth - 110, 20).strokeColor('#eeeeee').stroke();
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#1a1a1a')
          .text(value, leftMargin + 118, y + 5, { width: contentWidth - 126 });

        const textHeight = doc.heightOfString(value, { width: contentWidth - 126 });
        y += Math.max(20, textHeight + 10);
      }

      // ── SCOPE OF WORK ───────────────────────────────────────
      if (invoice.jobScope) {
        y += 14;
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#1a1a1a')
          .text('SCOPE OF WORK', leftMargin, y);
        y += 16;
        doc.rect(leftMargin, y, contentWidth, 2).fill('#1a1a1a');
        y += 8;
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#333333')
          .text(invoice.jobScope, leftMargin, y, { width: contentWidth });
        y += doc.heightOfString(invoice.jobScope, { width: contentWidth }) + 10;
      }

      // ── FINANCIAL SUMMARY TABLE ─────────────────────────────
      y += 14;
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#1a1a1a')
        .text('FINANCIAL SUMMARY', leftMargin, y);
      y += 16;

      const tableLeft = rightEdge - 280;
      const labelColW = 180;
      const amountColW = 100;

      // Table header
      doc.rect(tableLeft, y, labelColW + amountColW, 22).fill('#1a1a1a');
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#ffffff')
        .text('Description', tableLeft + 10, y + 6, { width: labelColW - 20 });
      doc.text('Amount (₹)', tableLeft + labelColW + 10, y + 6, {
        width: amountColW - 20,
        align: 'right',
      });
      y += 22;

      // Rows
      const rows: Array<[string, string, boolean]> = [
        ['Service Cost', this.formatCurrency(invoice.amount), false],
        ['Platform Fee (5%)', `- ${this.formatCurrency(invoice.platformFee)}`, false],
        ['Worker Payout', this.formatCurrency(invoice.workerPayout), false],
        ['TOTAL CHARGED', this.formatCurrency(invoice.amount), true],
      ];

      for (const [label, amount, isBold] of rows) {
        const bgColor = isBold ? '#f0f0f0' : '#ffffff';
        doc.rect(tableLeft, y, labelColW, 22).fill(bgColor);
        doc.rect(tableLeft + labelColW, y, amountColW, 22).fill(bgColor);

        // Borders
        doc.rect(tableLeft, y, labelColW + amountColW, 22).strokeColor('#e0e0e0').stroke();

        doc
          .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(9)
          .fillColor('#1a1a1a')
          .text(label, tableLeft + 10, y + 6, { width: labelColW - 20 });
        doc
          .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
          .text(amount, tableLeft + labelColW + 10, y + 6, {
            width: amountColW - 20,
            align: 'right',
          });
        y += 22;
      }

      // ── SIGNATURE & QR CODE ─────────────────────────────────
      y += 30;

      // Check if we need a new page
      if (y > doc.page.height - 180) {
        doc.addPage();
        y = 50;
      }

      // Signature section (left)
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#666666')
        .text('AUTHORIZED SIGNATURE', leftMargin, y);
      y += 40;
      doc
        .moveTo(leftMargin, y)
        .lineTo(leftMargin + 200, y)
        .strokeColor('#999999')
        .lineWidth(0.8)
        .stroke();
      y += 8;
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#1a1a1a')
        .text('Skill-Link Platform', leftMargin, y);
      y += 14;
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#666666')
        .text('Digital Authorization', leftMargin, y);

      // QR Code (right side)
      const qrSize = 100;
      const qrX = rightEdge - qrSize - 10;
      const qrY = y - 62;

      try {
        // Convert data URL to buffer for PDFKit
        const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
        const qrBuffer = Buffer.from(base64Data, 'base64');
        doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

        doc
          .font('Helvetica')
          .fontSize(7)
          .fillColor('#888888')
          .text('Scan to view job details', qrX - 5, qrY + qrSize + 4, {
            width: qrSize + 10,
            align: 'center',
          });
      } catch (err) {
        this.logger.warn(`Failed to embed QR code: ${(err as Error).message}`);
      }

      // ── FOOTER ──────────────────────────────────────────────
      const footerY = doc.page.height - 60;
      doc
        .moveTo(leftMargin, footerY)
        .lineTo(rightEdge, footerY)
        .strokeColor('#e0e0e0')
        .lineWidth(0.5)
        .stroke();

      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#999999')
        .text(
          'This is a computer-generated invoice and does not require a physical signature.',
          leftMargin,
          footerY + 8,
          { width: contentWidth, align: 'center' },
        );
      doc.text(
        `© ${new Date().getFullYear()} Skill-Link. All rights reserved.`,
        leftMargin,
        footerY + 20,
        { width: contentWidth, align: 'center' },
      );

      doc.end();
    });
  }

  // ─────────────────────────────────────────────
  // EMAIL
  // ─────────────────────────────────────────────

  private async sendInvoiceEmail(params: {
    to: string;
    recipientName: string | null;
    invoice: InvoiceData;
    pdfBuffer: Buffer;
  }) {
    const { to, recipientName, invoice, pdfBuffer } = params;
    const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,';

    const subject = `Skill-Link Invoice ${invoice.invoiceNumber} — ${invoice.jobTitle}`;

    const text = [
      `${greeting}`,
      '',
      `Your job "${invoice.jobTitle}" has been completed successfully.`,
      '',
      `Invoice Number: ${invoice.invoiceNumber}`,
      `Total Amount: Rs ${invoice.amount.toLocaleString('en-IN')}`,
      `Date: ${this.formatDate(invoice.completedAt)}`,
      '',
      'Please find the detailed invoice attached as a PDF.',
      '',
      'Thank you for using Skill-Link!',
    ].join('\n');

    const html = this.buildInvoiceEmailHtml({ greeting, invoice });

    await this.mailService.sendMailWithAttachments({
      to,
      subject,
      text,
      html,
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  private buildInvoiceEmailHtml(params: { greeting: string; invoice: InvoiceData }): string {
    const { greeting, invoice } = params;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Skill-Link Invoice</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:28px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Skill-Link</h1>
              <p style="margin:6px 0 0;color:#aaaaaa;font-size:12px;">Invoice ${this.escapeHtml(invoice.invoiceNumber)}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;color:#1f2937;font-size:15px;line-height:1.6;">
              <p style="margin:0 0 16px;">${greeting}</p>
              <p>Your job <strong>"${this.escapeHtml(invoice.jobTitle)}"</strong> has been completed successfully! Here's a summary:</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 14px;border:1px solid #e5e7eb;font-size:13px;color:#666;font-weight:600;">Invoice Number</td>
                  <td style="padding:10px 14px;border:1px solid #e5e7eb;font-size:13px;">${this.escapeHtml(invoice.invoiceNumber)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;border:1px solid #e5e7eb;font-size:13px;color:#666;font-weight:600;">Job Title</td>
                  <td style="padding:10px 14px;border:1px solid #e5e7eb;font-size:13px;">${this.escapeHtml(invoice.jobTitle)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;border:1px solid #e5e7eb;font-size:13px;color:#666;font-weight:600;">Total Amount</td>
                  <td style="padding:10px 14px;border:1px solid #e5e7eb;font-size:13px;font-weight:700;">₹ ${invoice.amount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;border:1px solid #e5e7eb;font-size:13px;color:#666;font-weight:600;">Date</td>
                  <td style="padding:10px 14px;border:1px solid #e5e7eb;font-size:13px;">${this.formatDate(invoice.completedAt)}</td>
                </tr>
              </table>

              <p>Please find the detailed invoice attached as a PDF.</p>
              <p style="color:#6b7280;font-size:13px;margin-top:24px;">Thank you for using Skill-Link!</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                &copy; ${new Date().getFullYear()} Skill-Link. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
  }

  // ─────────────────────────────────────────────
  // FORMATTING UTILITIES
  // ─────────────────────────────────────────────

  private formatDate(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private formatDateTime(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private formatCurrency(amount: number): string {
    return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen - 3) + '...';
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
