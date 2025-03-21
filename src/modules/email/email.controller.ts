import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmail } from '@/common/dto/Smtp/send-email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED) // Return 202 Accepted status code for async operations
  async sendEmail(@Body() sendEmail: SendEmail) {
    const jobId = await this.emailService.sendEmail(sendEmail);

    return {
      success: true,
      message: '✉️ Email queued successfully',
      data: {
        jobId: jobId,
        status: '🚀 Processing',
      },
      info: {
        timeQueued: new Date().toISOString(),
        note: '⏱️ Your email is being processed and will be sent shortly',
      },
    };
  }
}
