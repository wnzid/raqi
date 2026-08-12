import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const prefix = 'api';

  app.setGlobalPrefix(prefix);
  app.enableCors({ origin: config.getOrThrow<string>('WEB_URL'), credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  if (config.get<string>('NODE_ENV') !== 'production') {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Footwear Commerce API').setVersion('0.1').build());
    SwaggerModule.setup(`${prefix}/docs`, app, document);
  }

  await app.listen(config.get<number>('API_PORT') ?? 4000);
}

void bootstrap();
