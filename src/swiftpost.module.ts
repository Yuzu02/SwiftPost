import { Module } from '@nestjs/common';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [],
  providers: [],
})
export class SwiftPostModule {}
