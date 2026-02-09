import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.API_PORT, host: env.API_HOST });
    logger.info(`API server listening on ${env.API_HOST}:${env.API_PORT}`);
  } catch (err) {
    logger.fatal(err, 'Failed to start server');
    process.exit(1);
  }
}

start();
