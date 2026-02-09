import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestIdHook } from './middleware/request-id.js';
import { healthRoutes } from './routes/health.js';
import { userRoutes } from './routes/v1/users.js';

export async function buildApp() {
  const app = Fastify({
    logger: false,
    genReqId: () => crypto.randomUUID(),
  });

  // Request ID propagation
  app.addHook('onRequest', requestIdHook);

  // Security headers
  await app.register(helmet, { global: true });

  // CORS
  await app.register(cors, {
    origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Routes
  await app.register(healthRoutes);
  await app.register(userRoutes, { prefix: '/v1/users' });

  return app;
}
