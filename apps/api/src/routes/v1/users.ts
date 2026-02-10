import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { User } from '../../models/user.model.js';
import { requireAuth } from '../../middleware/auth.js';

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

/**
 * /v1/users routes (admin/user management)
 * Note: For most user operations, use /v1/auth routes instead
 */
export async function userRoutes(app: FastifyInstance) {
  // List users (protected)
  app.get(
    '/',
    {
      onRequest: [requireAuth],
    },
    async () => {
      const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 });
      return {
        data: users.map((u) => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          createdAt: u.createdAt.toISOString(),
        })),
      };
    }
  );

  // Get user by ID (protected)
  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      onRequest: [requireAuth],
    },
    async (request, reply) => {
      const user = await User.findById(request.params.id, { passwordHash: 0 });
      if (!user) {
        return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'User not found' });
      }
      return {
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        },
      };
    }
  );

  // Update user (protected - can only update self)
  app.patch<{ Params: { id: string } }>(
    '/:id',
    {
      onRequest: [requireAuth],
    },
    async (request, reply) => {
      // Ensure user can only update themselves
      if (request.params.id !== request.user.sub) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You can only update your own profile',
        });
      }

      const body = updateUserSchema.parse(request.body);
      const user = await User.findByIdAndUpdate(request.params.id, body, {
        new: true,
        select: { passwordHash: 0 },
      });

      if (!user) {
        return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'User not found' });
      }

      return {
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        },
      };
    }
  );

  // Delete user (protected - can only delete self)
  app.delete<{ Params: { id: string } }>(
    '/:id',
    {
      onRequest: [requireAuth],
    },
    async (request, reply) => {
      // Ensure user can only delete themselves
      if (request.params.id !== request.user.sub) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You can only delete your own account',
        });
      }

      const user = await User.findByIdAndDelete(request.params.id);
      if (!user) {
        return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'User not found' });
      }

      return reply.status(204).send();
    }
  );
}

