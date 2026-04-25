import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateContactInquiryDto } from './dto/create-contact-inquiry.dto';
import { ContactService } from './contact.service';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('inquiry')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a public contact inquiry from landing page' })
  createInquiry(@Body() dto: CreateContactInquiryDto) {
    return this.contactService.createInquiry(dto);
  }
}
