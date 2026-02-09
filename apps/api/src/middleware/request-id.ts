import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';

export function requestIdHook(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
) {
  const incomingId = request.headers['x-request-id'] as string | undefined;
  const requestId = incomingId ?? request.id;
  reply.header('x-request-id', requestId);
  done();
}
