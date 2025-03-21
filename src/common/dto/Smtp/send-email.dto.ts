import { MailOptions } from '@/dto/Smtp/mail-options.dto';
import { SmtpConfig } from '@/dto/Smtp/smtp-config.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';

export class SendEmail {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MailOptions)
  mailOptions: MailOptions;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SmtpConfig)
  smtpConfig: SmtpConfig;
}
