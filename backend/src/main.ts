// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // cookie-parser
  app.use(cookieParser());

  // OPTIONAL: if you use a global prefix, remember it for Swagger path:
  // app.setGlobalPrefix('api');

  // --- SWAGGER SETUP ---
  const config = new DocumentBuilder()
    .setTitle('HR System API')
    .setDescription('HR System endpoints')
    .setVersion('1.0')
    .addCookieAuth('token', { type: 'apiKey', in: 'cookie' }) // so Swagger knows about the auth cookie
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // <-- this creates /api-docs

  await app.listen(3000);
}
bootstrap();