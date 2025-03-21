import { SendEmail } from '@/common/dto/Smtp/send-email.dto';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { loggerEmail } from './email.processor';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email-queue') private readonly emailQueue: Queue) {}
  
  async sendEmail(sendEmail: SendEmail) {
    const { smtpConfig, mailOptions } = sendEmail;
    const startTime = Date.now();

    loggerEmail.log(`📨 Attempting to queue email to: ${mailOptions.to}`);

    try {
      const job = await this.emailQueue.add(
        'send-email',
        {
          smtpConfig,
          mailOptions,
        },
        {
          attempts: 3, // Retry sending the email up to 3 times in case of failure
          backoff: {
            type: 'exponential',
            delay: 5000, // Wait 5 seconds before retrying
          },
        },
      );

      // Set up event listeners for the job
      this.emailQueue.on('completed', (completedJob, result) => {
        if (completedJob.id === job.id) {
          const processingTime = Date.now() - startTime;
          loggerEmail.log(`✅ Email to ${mailOptions.to} sent successfully! Processing time: ${processingTime}ms`);
        }
      });

      this.emailQueue.on('failed', (failedJob, error) => {
        if (failedJob.id === job.id) {
          loggerEmail.error(`❌ Attempt ${job.attemptsMade} failed for email to ${mailOptions.to}: ${error.message}`);
          
          if (job.attemptsMade < 3) {
            loggerEmail.warn(`🔄 Retry ${job.attemptsMade} of 3 scheduled in ${5000 * Math.pow(2, job.attemptsMade - 1)}ms`);
          } else {
            loggerEmail.error(`⛔ All retries exhausted for email to ${mailOptions.to}`);
          }
        }
      });

      loggerEmail.log(`📋 Email to ${mailOptions.to} queued successfully with job ID: ${job.id}`);
      return job.id;
      
    } catch (error) {
      loggerEmail.error(
        `\x1B[31m\x1B[1m🚨 ERROR EN EMAIL: ${error.message}\x1B[0m`,
        error.stack,
      );
      throw new Error('Email queue addition failed');
    }
  }
}
