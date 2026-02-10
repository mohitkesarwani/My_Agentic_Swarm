import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyJwtPlugin from '@fastify/jwt';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestIdHook } from './middleware/request-id.js';
import { healthRoutes } from './routes/health.js';
import { userRoutes } from './routes/v1/users.js';
import { authRoutes } from './routes/v1/auth.js';
import { projectRoutes } from './routes/v1/projects.js';
import { buildRoutes } from './routes/v1/build.js';

export async function buildApp() {
  const app = Fastify({
    logger: false,
    genReqId: () => crypto.randomUUID(),
  });

  // Request ID propagation
  app.addHook('onRequest', requestIdHook);

  // JWT authentication
  // @ts-expect-error - Type conflict between ESM imports and CommonJS module
  await app.register(fastifyJwtPlugin, {
    secret: env.JWT_SECRET,
    sign: {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    },
    verify: {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    },
  });

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
  await app.register(authRoutes, { prefix: '/v1/auth' });
  await app.register(userRoutes, { prefix: '/v1/users' });
  await app.register(projectRoutes, { prefix: '/v1/projects' });
  await app.register(buildRoutes, { prefix: '/v1/projects' });

  return app;
}

