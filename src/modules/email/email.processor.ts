import { SendEmail } from '@/common/dto/Smtp/send-email.dto';
import { createTransporter } from '@/config/nodemailer';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as sanitizeHtml from 'sanitize-html';

// To log the email processor
export const loggerEmail = new Logger('EmailProcessor');

@Processor('email-queue')
export class EmailProcessor {
  logger = loggerEmail;

  @Process('send-email')
  async sendEmail(job: Job<SendEmail>) {
    const { mailOptions, smtpConfig } = job.data;

    // Sanitize the HTML content to prevent XSS attacks
    let sanitizedHtml = sanitizeHtml(mailOptions.html);
    if (!sanitizedHtml) {
      this.logger.error(
        `\x1B[31m\x1B[1m🚨 ERROR EN EMAIL: No se pudo sanitizar el HTML\x1B[0m`,
      );
      job.log(
        `\x1B[33m❌ Error en el envío: No se pudo sanitizar el HTML\x1B[0m`,
      );
      throw new Error('HTML sanitization failed');
    }

    const transporter = createTransporter(smtpConfig);

    try {
      await transporter.sendMail({ ...mailOptions, html: sanitizedHtml });
    } catch (error) {
      this.logger.error(
        `\x1B[31m\x1B[1m🚨 ERROR EN EMAIL 🚨 ${error.message}\x1B[0m`,
        error.stack,
      );
      job.log(`\x1B[33m❌ Error en el envío: ${error.message}\x1B[0m`);
      throw new Error('Email sending failed');
    }
  }
}
