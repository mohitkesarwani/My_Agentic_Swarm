/**
 * File System Tool for Bee Agent Framework
 * Provides file operations for code generation and manipulation
 */

import fs from 'fs/promises';
import path from 'path';
import { FileOperation } from '../types/index.js';

/**
 * File System Tool Class
 */
export class FileSystemTool {
  private solutionsBasePath: string;

  constructor(private basePath: string = process.cwd(), agentType?: string) {
    // Set up solutions directory structure based on agent type
    if (agentType) {
      this.solutionsBasePath = path.join(this.basePath, 'solutions', 'deliverables', agentType);
    } else {
      this.solutionsBasePath = path.join(this.basePath, 'solutions', 'deliverables');
    }
  }

  /**
   * Get the solutions base path for this agent
   */
  getSolutionsPath(): string {
    return this.solutionsBasePath;
  }

  /**
   * Execute a file operation
   */
  async execute(operation: FileOperation): Promise<{ success: boolean; message: string; data?: string }> {
    try {
      // For create operations, use solutions path by default unless path is absolute
      let fullPath: string;
      let usesSolutionsPath = false;
      if (operation.type === 'create' && !path.isAbsolute(operation.path)) {
        fullPath = path.resolve(this.solutionsBasePath, operation.path);
        usesSolutionsPath = true;
      } else {
        fullPath = path.resolve(this.basePath, operation.path);
      }

      // Security check: ensure path is within base directory or solutions directory
      const allowedPath = usesSolutionsPath ? this.solutionsBasePath : this.basePath;
      if (!fullPath.startsWith(allowedPath)) {
        throw new Error('Path traversal not allowed');
      }

      switch (operation.type) {
        case 'read':
          return await this.readFile(fullPath);

        case 'create':
          return await this.createFile(fullPath, operation.content || '');

        case 'update':
          return await this.updateFile(fullPath, operation.content || '');

        case 'delete':
          return await this.deleteFile(fullPath);

        default:
          throw new Error(`Unsupported operation: ${operation.type}`);
      }
    } catch (error) {
      console.error('File system error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown file system error',
      };
    }
  }

  /**
   * Read a file
   */
  private async readFile(filePath: string): Promise<{ success: boolean; message: string; data: string }> {
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      success: true,
      message: `File read successfully: ${filePath}`,
      data: content,
    };
  }

  /**
   * Create a new file
   */
  private async createFile(filePath: string, content: string): Promise<{ success: boolean; message: string }> {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(filePath, content, 'utf-8');
    return {
      success: true,
      message: `File created successfully: ${filePath}`,
    };
  }

  /**
   * Update an existing file
   */
  private async updateFile(filePath: string, content: string): Promise<{ success: boolean; message: string }> {
    await fs.writeFile(filePath, content, 'utf-8');
    return {
      success: true,
      message: `File updated successfully: ${filePath}`,
    };
  }

  /**
   * Delete a file
   */
  private async deleteFile(filePath: string): Promise<{ success: boolean; message: string }> {
    await fs.unlink(filePath);
    return {
      success: true,
      message: `File deleted successfully: ${filePath}`,
    };
  }

  /**
   * Create a tool definition for Bee Agent Framework
   */
  static getToolDefinition() {
    return {
      name: 'filesystem',
      description: 'Perform file system operations (read, create, update, delete)',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['read', 'create', 'update', 'delete'],
            description: 'The file operation to perform',
          },
          path: {
            type: 'string',
            description: 'File path relative to the project root',
          },
          content: {
            type: 'string',
            description: 'File content (for create/update operations)',
          },
        },
        required: ['type', 'path'],
      },
    };
  }
}
