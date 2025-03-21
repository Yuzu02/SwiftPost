import { NestFactory } from '@nestjs/core';
import { env } from '@/config/env';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { SwiftPostModule } from './swiftpost.module';

async function bootstrap() {
  const app = await NestFactory.create(SwiftPostModule);
  const logger = new Logger('SwiftPost');

  //* Globals

  app.setGlobalPrefix(env.apiPrefix, {
    exclude: [
      {
        path: '/',
        method: RequestMethod.GET,
      },
    ],
  }); // Set global prefix for all routes

  app.enableCors(); // Enable CORS for all routes and origins

  // Enable Global Pipes for Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(env.port, () => {
    const purpleUrl = `\x1b[35mhttp://localhost:${env.port}\x1b[0m`;
    logger.log(`🚀 Server is running on ${purpleUrl}`);
  });
}

bootstrap();
