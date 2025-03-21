import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// MailOptions DTO for sending emails
export class MailOptions {
  @IsString()
  @IsNotEmpty()
  from: string;

  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  html: string;

  @IsString()
  @IsOptional()
  text?: string;
}
