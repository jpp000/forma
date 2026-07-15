import cors from '@fastify/cors';
import { ValidationPipe } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function resolveCorsOrigin(): boolean | string[] | undefined {
  const configured = process.env.CORS_ORIGIN?.trim();
  if (configured) {
    return configured
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  return undefined;
}

export async function configureApp(app: NestFastifyApplication): Promise<void> {
  const origin = resolveCorsOrigin();
  if (origin !== undefined) {
    await app.register(cors, {
      origin,
      credentials: true,
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
  }

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Forma API')
    .setDescription('Forma platform REST API')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
