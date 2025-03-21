import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { BullModule } from '@nestjs/bull';
import { env } from '@/config/env';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: env.redisHost,
        port: env.redisPort,
        password: env.redisPassword,
      },
    }),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  providers: [EmailService, EmailProcessor],
  controllers: [EmailController],
})
export class EmailModule {}
