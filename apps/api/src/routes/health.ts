import type { FastifyInstance } from 'fastify';
import type { HealthResponse } from '@agentic-swarm/shared';

const startTime = Date.now();
const version = process.env.npm_package_version ?? '0.0.1';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    const res: HealthResponse = {
      status: 'ok',
      version,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
    };
    return res;
  });

  app.get('/ready', async (_req, reply) => {
    // In production, check DB connectivity here
    reply.send({ status: 'ok' });
  });

  app.get('/version', async () => ({ version }));
}
