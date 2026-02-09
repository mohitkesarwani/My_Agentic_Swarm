/**
 * QA Agent - Quality Assurance & Testing
 * Specializes in Jest testing, code verification, and quality checks
 */

import { ReActAgent } from 'beeai-framework/agents/react/agent';
import { UnconstrainedMemory } from 'beeai-framework/memory/unconstrainedMemory';
import { GroqChatModel } from 'beeai-framework/adapters/groq/backend/chat';
import { DynamicTool, StringToolOutput } from 'beeai-framework/tools/base';
import { FileSystemTool } from '../tools/filesystem.js';
import { AgentTask, AgentResponse } from '../types/index.js';

export class QAAgent {
  private agent: ReActAgent;
  private fileSystemTool: FileSystemTool;

  constructor(private llm: GroqChatModel, basePath: string = process.cwd()) {
    this.fileSystemTool = new FileSystemTool(basePath, 'qa');

    // Create Bee-compatible file system tool
    const fsToolWrapper = new DynamicTool({
      name: 'filesystem',
      description: 'Read and write test files. Test files will be saved to solutions/deliverables/qa/ directory.',
      inputSchema: FileSystemTool.getToolDefinition().inputSchema,
      handler: async (input: any) => {
        const result = await this.fileSystemTool.execute(input);
        return new StringToolOutput(JSON.stringify(result));
      },
    });

    // Initialize the QA agent
    this.agent = new ReActAgent({
      llm: this.llm,
      memory: new UnconstrainedMemory(),
      tools: [fsToolWrapper],
    });
  }

  /**
   * Execute a QA task
   */
  async executeTask(task: AgentTask): Promise<AgentResponse> {
    const systemPrompt = `You are a QA Agent specializing in software testing and quality assurance.

Your expertise:
- Jest testing framework
- Unit testing and integration testing
- Test-driven development (TDD)
- Code review and verification
- Bug detection and reporting
- Test coverage analysis

Task to complete: ${task.description}

Instructions:
1. Review the code that was created/modified
2. Create comprehensive test cases using Jest
3. Verify functionality and edge cases
4. Report any issues or bugs found
5. Use the filesystem tool to read code and create test files
6. All test files will be automatically saved to solutions/deliverables/qa/ directory
7. Use relative paths when creating test files (e.g., 'tests/user.test.ts' will be saved to solutions/deliverables/qa/tests/user.test.ts)

Provide a detailed report of:
- Tests created
- Issues found (if any)
- Recommendations for improvement
- Overall quality assessment`;

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
        message: `QA task completed: ${task.description}`,
        data: response.result.text,
      };
    } catch (error) {
      console.error('QA agent error:', error);
      return {
        success: false,
        message: 'QA task failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate test cases for given code
   */
  async generateTests(
    filePath: string,
    codeContent: string
  ): Promise<{ success: boolean; tests?: string; error?: string }> {
    const prompt = `Generate comprehensive Jest test cases for the following code:

File: ${filePath}

Code:
\`\`\`
${codeContent}
\`\`\`

Requirements:
- Use Jest testing framework
- Include unit tests for all functions
- Test edge cases and error conditions
- Use TypeScript
- Include proper test descriptions
- Mock external dependencies if needed

Provide only the test code, no explanations.`;

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
        tests: response.result.text,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate code quality
   */
  async validateCode(filePath: string, codeContent: string): Promise<AgentResponse> {
    const prompt = `Review the following code for quality and best practices:

File: ${filePath}

Code:
\`\`\`
${codeContent}
\`\`\`

Provide feedback on:
1. Code quality and readability
2. Best practices adherence
3. Potential bugs or issues
4. Security concerns
5. Performance considerations

Format your response as:
PASSED or FAILED: [summary]
Issues: [list of issues if any]
Recommendations: [list of recommendations]`;

    try {
      const response = await this.agent.run(
        { prompt },
        {
          execution: {
            maxIterations: 5,
          },
        }
      );

      const result = response.result.text;
      const passed = result.toLowerCase().includes('passed');

      return {
        success: passed,
        message: passed ? 'Code validation passed' : 'Code validation failed',
        data: result,
      };
    } catch (error) {
      console.error('Code validation error:', error);
      return {
        success: false,
        message: 'Code validation failed',
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
