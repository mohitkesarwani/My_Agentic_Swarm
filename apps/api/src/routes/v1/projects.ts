import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Project } from '../../models/project.model.js';
import { requireAuth } from '../../middleware/auth.js';
import type { CreateProjectRequest, Project as ProjectType } from '@agentic-swarm/shared';

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export async function projectRoutes(app: FastifyInstance) {
  /**
   * GET /v1/projects
   * List all projects for the authenticated user
   */
  app.get(
    '/',
    {
      onRequest: [requireAuth],
    },
    async (request, reply) => {
      const projects = await Project.find({ userId: request.user.sub }).sort({ createdAt: -1 });

      const response: ProjectType[] = projects.map((p) => ({
        id: p._id.toString(),
        userId: p.userId.toString(),
        name: p.name,
        description: p.description || '',
        buildRequests: p.buildRequests.map((br) => ({
          requestId: br.requestId,
          prompt: br.prompt,
          status: br.status,
          stagingPath: br.stagingPath,
          createdAt: br.createdAt.toISOString(),
          completedAt: br.completedAt?.toISOString(),
          error: br.error,
        })),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));

      reply.send({ data: response });
    }
  );

  /**
   * POST /v1/projects
   * Create a new project
   */
  app.post<{ Body: CreateProjectRequest }>(
    '/',
    {
      onRequest: [requireAuth],
      schema: {
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            description: { type: 'string', maxLength: 500 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // Validate input
        const data = createProjectSchema.parse(request.body);

        // Create project
        const project = await Project.create({
          userId: request.user.sub,
          name: data.name,
          description: data.description || '',
          buildRequests: [],
        });

        const response: ProjectType = {
          id: project._id.toString(),
          userId: project.userId.toString(),
          name: project.name,
          description: project.description || '',
          buildRequests: [],
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
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
   * GET /v1/projects/:id
   * Get a specific project with build history
   */
  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      onRequest: [requireAuth],
    },
    async (request, reply) => {
      const project = await Project.findOne({
        _id: request.params.id,
        userId: request.user.sub,
      });

      if (!project) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Project not found',
        });
      }

      const response: ProjectType = {
        id: project._id.toString(),
        userId: project.userId.toString(),
        name: project.name,
        description: project.description || '',
        buildRequests: project.buildRequests.map((br) => ({
          requestId: br.requestId,
          prompt: br.prompt,
          status: br.status,
          stagingPath: br.stagingPath,
          createdAt: br.createdAt.toISOString(),
          completedAt: br.completedAt?.toISOString(),
          error: br.error,
        })),
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      };

      reply.send({ data: response });
    }
  );

  /**
   * DELETE /v1/projects/:id
   * Delete a project
   */
  app.delete<{ Params: { id: string } }>(
    '/:id',
    {
      onRequest: [requireAuth],
    },
    async (request, reply) => {
      const project = await Project.findOneAndDelete({
        _id: request.params.id,
        userId: request.user.sub,
      });

      if (!project) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Project not found',
        });
      }

      reply.status(204).send();
    }
  );
}
