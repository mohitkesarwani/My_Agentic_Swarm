import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { PreviewEnvironment, PreviewStatus } from '@agentic-swarm/shared';

/**
 * Preview Service
 * 
 * Manages preview environments for generated applications.
 * In this implementation, we provide a preview URL based on the build artifacts.
 * 
 * For a full production implementation, this would:
 * - Deploy to Docker containers
 * - Manage port allocation
 * - Handle container lifecycle
 * - Provide proper URL routing
 */
export class PreviewService {
  /**
   * Get preview environment for a build
   */
  async getPreview(
    projectId: string,
    buildRequestId: string,
    userId: string
  ): Promise<PreviewEnvironment | null> {
    const buildPath = this.getBuildPath(userId, projectId, buildRequestId);
    
    if (!existsSync(buildPath)) {
      return null;
    }

    // Check if build has completed artifacts
    const hasArtifacts = await this.checkForArtifacts(buildPath);
    
    const preview: PreviewEnvironment = {
      id: `preview-${buildRequestId}`,
      buildRequestId,
      projectId,
      status: hasArtifacts ? PreviewStatus.RUNNING : PreviewStatus.PENDING,
      createdAt: new Date().toISOString(),
    };

    if (hasArtifacts) {
      // In a real implementation, this would be a running container URL
      // For now, we just indicate the artifacts location
      preview.url = `/api/v1/projects/${projectId}/builds/${buildRequestId}/artifacts`;
      preview.startedAt = new Date().toISOString();
    }

    return preview;
  }

  /**
   * Create a new preview environment
   */
  async createPreview(
    projectId: string,
    buildRequestId: string,
    userId: string
  ): Promise<PreviewEnvironment> {
    const buildPath = this.getBuildPath(userId, projectId, buildRequestId);
    
    if (!existsSync(buildPath)) {
      throw new Error('Build artifacts not found');
    }

    const preview: PreviewEnvironment = {
      id: `preview-${buildRequestId}`,
      buildRequestId,
      projectId,
      status: PreviewStatus.BUILDING,
      createdAt: new Date().toISOString(),
    };

    // In a real implementation, this would:
    // 1. Read the generated application code
    // 2. Create a Docker container
    // 3. Expose it on a port
    // 4. Return the preview URL
    
    // For now, we simulate this by checking for artifacts
    const hasArtifacts = await this.checkForArtifacts(buildPath);
    
    if (hasArtifacts) {
      preview.status = PreviewStatus.RUNNING;
      preview.url = `/api/v1/projects/${projectId}/builds/${buildRequestId}/artifacts`;
      preview.startedAt = new Date().toISOString();
    } else {
      preview.status = PreviewStatus.FAILED;
      preview.error = 'No artifacts found to preview';
    }

    return preview;
  }

  /**
   * Stop a preview environment
   */
  async stopPreview(_previewId: string): Promise<void> {
    // In a real implementation, this would stop the Docker container
    // For now, this is a no-op
  }

  /**
   * Get artifact contents for preview
   */
  async getArtifacts(
    projectId: string,
    buildRequestId: string,
    userId: string
  ): Promise<{ name: string; path: string; type: string }[]> {
    const buildPath = this.getBuildPath(userId, projectId, buildRequestId);
    
    if (!existsSync(buildPath)) {
      return [];
    }

    try {
      const artifacts: { name: string; path: string; type: string }[] = [];
      await this.findArtifacts(buildPath, buildPath, artifacts);
      return artifacts;
    } catch (error) {
      return [];
    }
  }

  /**
   * Helper: Get build path
   */
  private getBuildPath(userId: string, projectId: string, buildRequestId: string): string {
    return join(
      process.cwd(),
      'solutions',
      'users',
      userId,
      'projects',
      projectId,
      'builds',
      buildRequestId
    );
  }

  /**
   * Helper: Check for artifacts in build directory
   */
  private async checkForArtifacts(buildPath: string): Promise<boolean> {
    try {
      const entries = await readdir(buildPath, { withFileTypes: true });
      
      // Check for common artifact patterns
      const hasCode = entries.some(
        (e) =>
          e.isDirectory() &&
          (e.name === 'src' ||
            e.name === 'lib' ||
            e.name === 'dist' ||
            e.name === 'build' ||
            e.name === 'components')
      );
      
      const hasConfig = entries.some(
        (e) =>
          e.isFile() &&
          (e.name === 'package.json' ||
            e.name === 'tsconfig.json' ||
            e.name === 'README.md')
      );
      
      return hasCode || hasConfig;
    } catch {
      return false;
    }
  }

  /**
   * Helper: Recursively find artifacts
   */
  private async findArtifacts(
    currentPath: string,
    basePath: string,
    artifacts: { name: string; path: string; type: string }[],
    maxDepth = 3,
    currentDepth = 0
  ): Promise<void> {
    if (currentDepth > maxDepth) return;

    try {
      const entries = await readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip node_modules and hidden directories
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        const fullPath = join(currentPath, entry.name);
        const relativePath = fullPath.replace(basePath, '').replace(/^\//, '');

        if (entry.isFile()) {
          const ext = entry.name.split('.').pop() || '';
          artifacts.push({
            name: entry.name,
            path: relativePath,
            type: this.getFileType(ext),
          });
        } else if (entry.isDirectory() && currentDepth < maxDepth) {
          await this.findArtifacts(fullPath, basePath, artifacts, maxDepth, currentDepth + 1);
        }
      }
    } catch {
      // Ignore errors reading directories
    }
  }

  /**
   * Helper: Get file type from extension
   */
  private getFileType(extension: string): string {
    const typeMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      md: 'markdown',
      css: 'stylesheet',
      html: 'html',
      yml: 'yaml',
      yaml: 'yaml',
    };
    
    return typeMap[extension.toLowerCase()] || 'file';
  }
}
