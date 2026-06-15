import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

const expressServer = express();

const createApp = async () => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressServer), { logger: ['error', 'warn'] });
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
};

let appReady: Promise<any>;

export default async function handler(req: express.Request, res: express.Response) {
  if (!appReady) {
    appReady = createApp();
  }
  await appReady;
  expressServer(req, res);
}
