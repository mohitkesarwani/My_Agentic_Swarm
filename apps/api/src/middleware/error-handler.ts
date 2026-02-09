import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../config/logger.js';
import type { ApiError } from '@agentic-swarm/shared';

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  const requestId = (request.headers['x-request-id'] as string) ?? request.id;

  logger.error({ err: error, requestId }, error.message);

  const statusCode = error.statusCode ?? 500;

  const body: ApiError = {
    statusCode,
    error: statusCode >= 500 ? 'Internal Server Error' : error.name,
    message: statusCode >= 500 ? 'An unexpected error occurred' : error.message,
    requestId,
  };

  reply.status(statusCode).send(body);
}
