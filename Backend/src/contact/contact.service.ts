import { Injectable } from '@nestjs/common';
import { MailService } from '../auth/mail.service';
import { CreateContactInquiryDto } from './dto/create-contact-inquiry.dto';

@Injectable()
export class ContactService {
  constructor(private readonly mailService: MailService) {}

  async createInquiry(dto: CreateContactInquiryDto) {
    await this.mailService.sendContactInquiry({
      fullName: dto.fullName.trim(),
      email: dto.email.trim().toLowerCase(),
      message: dto.message.trim(),
    });

    return {
      message:
        'Thanks for reaching out. Our team has received your inquiry and will contact you soon.',
    };
  }
}
