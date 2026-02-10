import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';
import { Project, BuildStatus } from '../../models/project.model.js';
import { requireAuth } from '../../middleware/auth.js';
import { env } from '../../config/env.js';
import type { CreateBuildRequest } from '@agentic-swarm/shared';

// Validation schema
const createBuildSchema = z.object({
  prompt: z.string().min(1).max(2000),
});

/**
 * Execute swarm build in background
 * This is a placeholder - actual implementation will spawn swarm process
 */
async function executeBuild(
  projectId: string,
  userId: string,
  buildRequestId: string,
  prompt: string
): Promise<void> {
  // TODO: Implement actual swarm execution
  // For now, this is a stub that simulates build completion
  // Real implementation will spawn a child process or call the swarm module

  console.log(`[Build ${buildRequestId}] Starting build for project ${projectId}`);
  console.log(`[Build ${buildRequestId}] User: ${userId}, Prompt: ${prompt}`);

  // Update to running
  await Project.updateOne(
    {
      _id: projectId,
      'buildRequests.requestId': buildRequestId,
    },
    {
      $set: {
        'buildRequests.$.status': BuildStatus.RUNNING,
      },
    }
  );

  try {
    // Simulate build work (remove this in real implementation)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // In real implementation, this would:
    // 1. Import/spawn AgenticSwarm with isolation context
    // 2. Execute the prompt
    // 3. Monitor progress

    const stagingPath = `solutions/users/${userId}/projects/${projectId}/builds/${buildRequestId}`;

    // Mark as completed
    await Project.updateOne(
      {
        _id: projectId,
        'buildRequests.requestId': buildRequestId,
      },
      {
        $set: {
          'buildRequests.$.status': BuildStatus.COMPLETED,
          'buildRequests.$.completedAt': new Date(),
          'buildRequests.$.stagingPath': stagingPath,
        },
      }
    );

    console.log(`[Build ${buildRequestId}] Completed successfully`);
  } catch (error) {
    // Mark as failed
    await Project.updateOne(
      {
        _id: projectId,
        'buildRequests.requestId': buildRequestId,
      },
      {
        $set: {
          'buildRequests.$.status': BuildStatus.FAILED,
          'buildRequests.$.completedAt': new Date(),
          'buildRequests.$.error': error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    );

    console.error(`[Build ${buildRequestId}] Failed:`, error);
  }
}

export async function buildRoutes(app: FastifyInstance) {
  /**
   * POST /v1/projects/:projectId/build
   * Create a new build request for a project
   */
  app.post<{ Params: { projectId: string }; Body: CreateBuildRequest }>(
    '/:projectId/build',
    {
      onRequest: [requireAuth],
      schema: {
        body: {
          type: 'object',
          required: ['prompt'],
          properties: {
            prompt: { type: 'string', minLength: 1, maxLength: 2000 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // Validate input
        const data = createBuildSchema.parse(request.body);
        const { projectId } = request.params;
        const userId = request.user.sub;

        // Verify project exists and belongs to user
        const project = await Project.findOne({ _id: projectId, userId });
        if (!project) {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Project not found',
          });
        }

        // Check if GROQ_API_KEY is configured
        if (!env.GROQ_API_KEY) {
          return reply.status(503).send({
            statusCode: 503,
            error: 'Service Unavailable',
            message: 'Swarm engine not configured. GROQ_API_KEY is missing.',
          });
        }

        // Generate build request ID
        const buildRequestId = crypto.randomUUID();

        // Add build request to project (mark as pending)
        const buildRequest = {
          requestId: buildRequestId,
          prompt: data.prompt,
          status: BuildStatus.PENDING,
          createdAt: new Date(),
        };

        project.buildRequests.push(buildRequest);
        await project.save();

        // Launch build in background (non-blocking)
        setImmediate(() => {
          executeBuild(projectId, userId, buildRequestId, data.prompt).catch((err) => {
            console.error(`[Build ${buildRequestId}] Execution error:`, err);
          });
        });

        // Return immediately with pending status
        reply.status(202).send({
          data: {
            buildRequestId,
            status: BuildStatus.PENDING,
            message: 'Build request accepted and queued for processing',
          },
        });
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
   * GET /v1/projects/:projectId/builds/:buildId
   * Get status of a specific build
   */
  app.get<{ Params: { projectId: string; buildId: string } }>(
    '/:projectId/builds/:buildId',
    {
      onRequest: [requireAuth],
    },
    async (request, reply) => {
      const { projectId, buildId } = request.params;
      const userId = request.user.sub;

      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Project not found',
        });
      }

      const build = project.buildRequests.find((br) => br.requestId === buildId);
      if (!build) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Build not found',
        });
      }

      reply.send({
        data: {
          requestId: build.requestId,
          prompt: build.prompt,
          status: build.status,
          stagingPath: build.stagingPath,
          createdAt: build.createdAt.toISOString(),
          completedAt: build.completedAt?.toISOString(),
          error: build.error,
        },
      });
    }
  );
}

