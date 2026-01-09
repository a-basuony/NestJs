import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove extra properties
      forbidNonWhitelisted: true, // Error on extra properties
      transform: true, // Convert to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types
      },
      disableErrorMessages: false, // Show detailed errors
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
