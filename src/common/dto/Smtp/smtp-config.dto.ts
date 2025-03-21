import { SmtpAuth } from './smtp-auth.dto';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

// SMTP Config DTO
export class SmtpConfig {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsNotEmpty()
  @IsNumber()
  port: number;

  @IsOptional()
  @IsBoolean()
  secure: boolean;

  @IsObject()
  @IsNotEmpty()
  auth?: SmtpAuth;
}
