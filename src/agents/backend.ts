/**
 * Backend Agent - Node.js/Express Developer
 * Specializes in API design, Express.js, and database operations
 */

import { ReActAgent } from 'beeai-framework/agents/react/agent';
import { UnconstrainedMemory } from 'beeai-framework/memory/unconstrainedMemory';
import { GroqChatModel } from 'beeai-framework/adapters/groq/backend/chat';
import { DynamicTool, StringToolOutput } from 'beeai-framework/tools/base';
import { FileSystemTool } from '../tools/filesystem.js';
import { MongoDBTool } from '../tools/mongodb.js';
import { AgentTask, AgentResponse } from '../types/index.js';

export class BackendAgent {
  private agent: ReActAgent;
  private fileSystemTool: FileSystemTool;
  private mongoTool?: MongoDBTool;

  constructor(
    private llm: GroqChatModel,
    basePath: string = process.cwd(),
    mongoUri?: string
  ) {
    this.fileSystemTool = new FileSystemTool(basePath, 'backend');
    if (mongoUri) {
      this.mongoTool = new MongoDBTool(mongoUri);
    }

    const tools = [];

    // File system tool
    const fsToolWrapper = new DynamicTool({
      name: 'filesystem',
      description: 'Read and write files for backend code generation. Files will be saved to solutions/deliverables/backend/ directory.',
      inputSchema: FileSystemTool.getToolDefinition().inputSchema,
      handler: async (input: any) => {
        const result = await this.fileSystemTool.execute(input);
        return new StringToolOutput(JSON.stringify(result));
      },
    });
    tools.push(fsToolWrapper);

    // MongoDB tool (if configured)
    if (this.mongoTool) {
      const mongoToolWrapper = new DynamicTool({
        name: 'mongodb',
        description: 'Execute MongoDB operations',
        inputSchema: MongoDBTool.getToolDefinition().inputSchema,
        handler: async (input: any) => {
          const result = await this.mongoTool!.execute(input);
          return new StringToolOutput(JSON.stringify(result));
        },
      });
      tools.push(mongoToolWrapper);
    }

    // Initialize the Backend agent
    this.agent = new ReActAgent({
      llm: this.llm,
      memory: new UnconstrainedMemory(),
      tools,
    });
  }

  /**
   * Execute a backend development task
   */
  async executeTask(task: AgentTask): Promise<AgentResponse> {
    const systemPrompt = `You are a Backend Development Agent specializing in Node.js and Express.

Your expertise:
- RESTful API design
- Express.js middleware and routing
- MongoDB and Mongoose ODM
- Authentication and authorization
- Error handling and validation
- TypeScript for backend development

Task to complete: ${task.description}

Instructions:
1. Create or modify backend code as needed
2. Use Express.js for API endpoints
3. Implement proper error handling
4. Use Mongoose for database operations (if needed)
5. Follow REST best practices
6. Use the filesystem tool to create/update files
7. All generated files will be automatically saved to solutions/deliverables/backend/ directory
8. Use relative paths when creating files (e.g., 'routes/users.ts' will be saved to solutions/deliverables/backend/routes/users.ts)

Provide a detailed description of what you created or modified.`;

    try {
      const response = await this.agent.run(
        { prompt: systemPrompt },
        {
          execution: {
            maxIterations: 10,
          },
        }
      );

      return {
        success: true,
        message: `Backend task completed: ${task.description}`,
        data: response.result.text,
      };
    } catch (error) {
      console.error('Backend agent error:', error);
      return {
        success: false,
        message: 'Backend task failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate API endpoint code
   */
  async generateEndpoint(
    endpoint: string,
    method: string,
    requirements: string
  ): Promise<{ success: boolean; code?: string; error?: string }> {
    const prompt = `Generate an Express.js API endpoint for ${method} ${endpoint} that meets these requirements:

${requirements}

Requirements:
- Use TypeScript
- Include proper error handling
- Add input validation
- Include JSDoc comments
- Follow REST best practices

Provide only the endpoint code, no explanations.`;

    try {
      const response = await this.agent.run(
        { prompt },
        {
          execution: {
            maxIterations: 5,
          },
        }
      );

      return {
        success: true,
        code: response.result.text,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get the underlying ReAct agent
   */
  getAgent(): ReActAgent {
    return this.agent;
  }
}
