/**
 * Frontend Agent - UI/Mobile-First React Developer
 * Specializes in React, Tailwind CSS, and mobile-first design
 */

import { ReActAgent } from 'beeai-framework/agents/react/agent';
import { UnconstrainedMemory } from 'beeai-framework/memory/unconstrainedMemory';
import { GroqChatModel } from 'beeai-framework/adapters/groq/backend/chat';
import { DynamicTool, StringToolOutput } from 'beeai-framework/tools/base';
import { FileSystemTool } from '../tools/filesystem.js';
import { AgentTask, AgentResponse } from '../types/index.js';

export class FrontendAgent {
  private agent: ReActAgent;
  private fileSystemTool: FileSystemTool;

  constructor(private llm: GroqChatModel, basePath: string = process.cwd()) {
    this.fileSystemTool = new FileSystemTool(basePath, 'frontend');

    // Create Bee-compatible file system tool
    const fsToolWrapper = new DynamicTool({
      name: 'filesystem',
      description: 'Read and write files for React component generation. Files will be saved to solutions/deliverables/frontend/ directory.',
      inputSchema: FileSystemTool.getToolDefinition().inputSchema,
      handler: async (input: any) => {
        const result = await this.fileSystemTool.execute(input);
        return new StringToolOutput(JSON.stringify(result));
      },
    });

    // Initialize the Frontend agent with file system tools
    this.agent = new ReActAgent({
      llm: this.llm,
      memory: new UnconstrainedMemory(),
      tools: [fsToolWrapper],
    });
  }

  /**
   * Execute a frontend development task
   */
  async executeTask(task: AgentTask): Promise<AgentResponse> {
    const systemPrompt = `You are a Frontend Development Agent specializing in React and Tailwind CSS.

Your expertise:
- React functional components with hooks
- Tailwind CSS for styling
- Mobile-first responsive design
- Modern JavaScript/TypeScript practices
- Component composition and reusability

Task to complete: ${task.description}

Instructions:
1. Create or modify React components as needed
2. Use Tailwind CSS for all styling
3. Ensure mobile-first responsive design
4. Follow React best practices
5. Use the filesystem tool to create/update files
6. All generated files will be automatically saved to solutions/deliverables/frontend/ directory
7. Use relative paths when creating files (e.g., 'components/Button.tsx' will be saved to solutions/deliverables/frontend/components/Button.tsx)

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
        message: `Frontend task completed: ${task.description}`,
        data: response.result.text,
      };
    } catch (error) {
      console.error('Frontend agent error:', error);
      return {
        success: false,
        message: 'Frontend task failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate React component code
   */
  async generateComponent(
    componentName: string,
    requirements: string
  ): Promise<{ success: boolean; code?: string; error?: string }> {
    const prompt = `Generate a React functional component named ${componentName} that meets these requirements:

${requirements}

Requirements:
- Use TypeScript
- Use Tailwind CSS for styling
- Include proper TypeScript types
- Add JSDoc comments
- Make it mobile-first responsive

Provide only the component code, no explanations.`;

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
