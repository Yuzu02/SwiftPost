import { IsString, IsNotEmpty } from 'class-validator';

// Auth Smtp DTO
export class SmtpAuth {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  pass: string;
}
