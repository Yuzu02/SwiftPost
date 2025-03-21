import { MailOptions } from '@/dto/Smtp/mail-options.dto';
import { SmtpConfig } from '@/dto/Smtp/smtp-config.dto';
import { IsNotEmpty, IsObject } from 'class-validator';

export class SendEmail {
  @IsObject()
  @IsNotEmpty()
  mailOptions: MailOptions;

  @IsObject()
  @IsNotEmpty()
  smtpConfig: SmtpConfig;
}
