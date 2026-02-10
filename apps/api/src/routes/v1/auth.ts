import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { User } from '../../models/user.model.js';
import { env } from '../../config/env.js';
import { requireAuth } from '../../middleware/auth.js';
import type { RegisterRequest, LoginRequest, AuthResponse, User as UserType } from '@agentic-swarm/shared';

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
  /**
   * POST /v1/auth/register
   * Register a new user
   */
  app.post<{ Body: RegisterRequest }>(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, maxLength: 100 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // Validate input
        const data = registerSchema.parse(request.body);

        // Check if user already exists
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
          return reply.status(409).send({
            statusCode: 409,
            error: 'Conflict',
            message: 'User with this email already exists',
          });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

        // Create user
        const user = await User.create({
          name: data.name,
          email: data.email,
          passwordHash,
        });

        // Generate JWT
        const token = app.jwt.sign(
          {
            sub: user._id.toString(),
            email: user.email,
          },
          {
            expiresIn: env.JWT_EXPIRY,
          }
        );

        const response: AuthResponse = {
          token,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
          },
        };

        reply.status(201).send({ data: response });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Validation error',
            details: error.issues,
          });
        }
        throw error;
      }
    }
  );

  /**
   * POST /v1/auth/login
   * Login with email and password
   */
  app.post<{ Body: LoginRequest }>(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // Validate input
        const data = loginSchema.parse(request.body);

        // Find user
        const user = await User.findOne({ email: data.email });
        if (!user) {
          return reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Invalid email or password',
          });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValidPassword) {
          return reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Invalid email or password',
          });
        }

        // Generate JWT
        const token = app.jwt.sign(
          {
            sub: user._id.toString(),
            email: user.email,
          },
          {
            expiresIn: env.JWT_EXPIRY,
          }
        );

        const response: AuthResponse = {
          token,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
          },
        };

        reply.send({ data: response });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Validation error',
            details: error.issues,
          });
        }
        throw error;
      }
    }
  );

  /**
   * GET /v1/auth/me
   * Get current user profile
   */
  app.get(
    '/me',
    {
      onRequest: [requireAuth],
    },
    async (request, reply) => {
      const user = await User.findById(request.user.sub);
      if (!user) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
        });
      }

      const userResponse: UserType = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      };

      reply.send({ data: userResponse });
    }
  );
}
