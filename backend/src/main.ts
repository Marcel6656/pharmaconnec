import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import type { NextFunction, Request, Response } from 'express';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from './app.module';
import { uploadedImageRoute } from './common/uploads';

/** Charge les variables de `.env` sans écraser l'environnement système. */
function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const rawVal = trimmed.slice(eq + 1).trim();
    const val = rawVal.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

async function bootstrap() {
  loadEnvFile();

  const jwtSecret = process.env.JWT_SECRET?.trim() || '';
  const weakSecrets = new Set(['pharmaconnect-dev-secret-change-in-prod', 'change-me-with-a-long-random-secret']);
  if (jwtSecret.length < 32 || weakSecrets.has(jwtSecret)) {
    throw new Error('JWT_SECRET invalide ou manquant : configurez une chaîne aléatoire d’au moins 32 caractères.');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  const trustedProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? (process.env.VERCEL ? 1 : 0));
  if (Number.isInteger(trustedProxyHops) && trustedProxyHops > 0) app.set('trust proxy', trustedProxyHops);
  app.setGlobalPrefix('api', { exclude: [uploadedImageRoute] });
  app.use('/api', (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // Autoriser les payloads JSON jusqu'à 5 Mo pour les images produits compressées en base64
  app.useBodyParser('json', { limit: '5mb' });
  app.useBodyParser('urlencoded', { limit: '5mb', extended: true });

  const origins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('PharmaConnect API')
      .setDescription('API REST complète de PharmaConnect (KAYRA Innovation) — Public, Visiteurs, Pharmacies & Administration.')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const doc = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, doc);
  }

  const port = Number(process.env.PORT || 4000);
  await app.listen(port);
  console.log(`PharmaConnect Backend démarré sur http://localhost:${port}/api`);
}

bootstrap();
