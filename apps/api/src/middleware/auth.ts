import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * JWT authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verify JWT token (fastify-jwt plugin adds this method)
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token',
    });
  }
}
