import { FastifyInstance } from 'fastify';
import { PreviewService } from '../../services/preview.service.js';
import { requireAuth } from '../../middleware/auth.js';

const previewService = new PreviewService();

export async function previewRoutes(app: FastifyInstance) {
  /**
   * Get preview environment for a build
   * GET /v1/projects/:projectId/builds/:buildId/preview
   */
  app.get<{
    Params: { projectId: string; buildId: string };
  }>(
    '/:projectId/builds/:buildId/preview',
    {
      onRequest: [requireAuth],
    },
    async (request, reply) => {
      const { projectId, buildId } = request.params;
      const userId = request.user.sub; // JWT subject is the user ID

      const preview = await previewService.getPreview(projectId, buildId, userId);

      if (!preview) {
        return reply.code(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Preview not found for this build',
        });
      }

      return reply.send({
        data: preview,
      });
    }
  );

  /**
   * Create preview environment for a build
   * POST /v1/projects/:projectId/builds/:buildId/preview
   */
  app.post<{
    Params: { projectId: string; buildId: string };
  }>(
    '/:projectId/builds/:buildId/preview',
    {
      onRequest: [requireAuth],
    },
    async (request, reply) => {
      const { projectId, buildId } = request.params;
      const userId = request.user.sub; // JWT subject is the user ID

      try {
        const preview = await previewService.createPreview(projectId, buildId, userId);

        return reply.code(201).send({
          data: preview,
        });
      } catch (error) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error instanceof Error ? error.message : 'Failed to create preview',
        });
      }
    }
  );

  /**
   * Get build artifacts for preview
   * GET /v1/projects/:projectId/builds/:buildId/artifacts
   */
  app.get<{
    Params: { projectId: string; buildId: string };
  }>(
    '/:projectId/builds/:buildId/artifacts',
    {
      onRequest: [requireAuth],
    },
    async (request, reply) => {
      const { projectId, buildId } = request.params;
      const userId = request.user.sub; // JWT subject is the user ID

      const artifacts = await previewService.getArtifacts(projectId, buildId, userId);

      return reply.send({
        data: {
          buildId,
          artifacts,
          count: artifacts.length,
        },
      });
    }
  );

  /**
   * Stop preview environment
   * DELETE /v1/projects/:projectId/builds/:buildId/preview/:previewId
   */
  app.delete<{
    Params: { projectId: string; buildId: string; previewId: string };
  }>(
    '/:projectId/builds/:buildId/preview/:previewId',
    {
      onRequest: [requireAuth],
    },
    async (request, reply) => {
      const { previewId } = request.params;

      await previewService.stopPreview(previewId);

      return reply.code(204).send();
    }
  );
}
