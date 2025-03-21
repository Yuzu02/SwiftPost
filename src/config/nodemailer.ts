import * as nodemailer from 'nodemailer';
import { SmtpConfig } from '@/dto/Smtp/smtp-config.dto';

export const createTransporter = (smtpConfig: SmtpConfig) => {
  return nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure || false, // true for 465, false for other ports
    auth: smtpConfig.auth
      ? {
          user: smtpConfig.auth.user,
          pass: smtpConfig.auth.pass,
        }
      : undefined,
  });
};
