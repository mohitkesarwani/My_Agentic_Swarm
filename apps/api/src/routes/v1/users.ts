import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(254),
});

const updateUserSchema = createUserSchema.partial();

/**
 * /v1/users CRUD stub
 * Replace in-memory store with Mongo model when ready.
 */
export async function userRoutes(app: FastifyInstance) {
  // In-memory store (stub)
  const users = new Map<string, { id: string; name: string; email: string }>();

  // List users
  app.get('/', async () => {
    return { data: Array.from(users.values()) };
  });

  // Get user by ID
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const user = users.get(request.params.id);
    if (!user) {
      return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'User not found' });
    }
    return { data: user };
  });

  // Create user
  app.post('/', async (request, reply) => {
    const body = createUserSchema.parse(request.body);
    const id = crypto.randomUUID();
    const user = { id, ...body };
    users.set(id, user);
    return reply.status(201).send({ data: user });
  });

  // Update user
  app.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const existing = users.get(request.params.id);
    if (!existing) {
      return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'User not found' });
    }
    const body = updateUserSchema.parse(request.body);
    const updated = { ...existing, ...body };
    users.set(request.params.id, updated);
    return { data: updated };
  });

  // Delete user
  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    if (!users.has(request.params.id)) {
      return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'User not found' });
    }
    users.delete(request.params.id);
    return reply.status(204).send();
  });
}
