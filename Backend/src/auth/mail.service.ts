import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

type VerificationMailInput = {
  to: string;
  name?: string;
  token: string;
  verificationUrl?: string;
  expiresInMinutes: number;
};

type ResetMailInput = {
  to: string;
  name?: string;
  token: string;
  resetUrl?: string;
  expiresInMinutes: number;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  async sendEmailVerification(input: VerificationMailInput) {
    const subject = 'Verify your Skill-Link email';
    const greeting = input.name ? `Hi ${input.name},` : 'Hi,';
    const verificationLink = input.verificationUrl
      ? `Verification link: ${input.verificationUrl}`
      : `Verification token: ${input.token}`;

    await this.sendMail({
      to: input.to,
      subject,
      text: `${greeting}\n\nUse the following to verify your email. It expires in ${input.expiresInMinutes} minutes.\n\n${verificationLink}\n\nIf you did not sign up, you can ignore this email.`,
      html: `<p>${greeting}</p><p>Use the following to verify your email. It expires in ${input.expiresInMinutes} minutes.</p><p>${input.verificationUrl ? `<a href="${input.verificationUrl}">Verify email</a>` : `<strong>${input.token}</strong>`}</p><p>If you did not sign up, you can ignore this email.</p>`,
    });
  }

  async sendPasswordReset(input: ResetMailInput) {
    const subject = 'Reset your Skill-Link password';
    const greeting = input.name ? `Hi ${input.name},` : 'Hi,';
    const resetLink = input.resetUrl
      ? `Reset link: ${input.resetUrl}`
      : `Reset token: ${input.token}`;

    await this.sendMail({
      to: input.to,
      subject,
      text: `${greeting}\n\nUse the following to reset your password. It expires in ${input.expiresInMinutes} minutes.\n\n${resetLink}\n\nIf you did not request this, you can ignore this email.`,
      html: `<p>${greeting}</p><p>Use the following to reset your password. It expires in ${input.expiresInMinutes} minutes.</p><p>${input.resetUrl ? `<a href="${input.resetUrl}">Reset password</a>` : `<strong>${input.token}</strong>`}</p><p>If you did not request this, you can ignore this email.</p>`,
    });
  }

  private async sendMail(options: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }) {
    const mode = process.env.MAIL_MODE ?? 'smtp';

    if (mode === 'log') {
      this.logger.log(
        `MAIL_MODE=log | To: ${options.to} | Subject: ${options.subject}`,
      );
      this.logger.log(options.text);
      return;
    }

    const transporter = this.getTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }

  private getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass || !process.env.MAIL_FROM) {
      throw new Error(
        'SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and MAIL_FROM, or use MAIL_MODE=log.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: String(process.env.SMTP_SECURE ?? 'false') === 'true',
      auth: {
        user,
        pass,
      },
    });

    return this.transporter;
  }
}
