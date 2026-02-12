/**
 * Security Agent - Security Review and Vulnerability Analysis
 * Specializes in security audits, OWASP guidelines, and vulnerability detection
 */

import { ReActAgent } from 'beeai-framework/agents/react/agent';
import { UnconstrainedMemory } from 'beeai-framework/memory/unconstrainedMemory';
import { GroqChatModel } from 'beeai-framework/adapters/groq/backend/chat';
import { DynamicTool, StringToolOutput } from 'beeai-framework/tools/base';
import { FileSystemTool } from '../tools/filesystem.js';
import { AgentTask, AgentResponse, IsolationContext } from '../types/index.js';

export class SecurityAgent {
  private agent: ReActAgent;
  private fileSystemTool: FileSystemTool;

  constructor(
    private llm: GroqChatModel,
    basePath: string = process.cwd(),
    isolation?: IsolationContext
  ) {
    this.fileSystemTool = new FileSystemTool(basePath, 'security', isolation);

    // Create Bee-compatible file system tool
    const fsToolWrapper = new DynamicTool({
      name: 'filesystem',
      description: 'Read and write security audit reports and findings. Files will be saved to solutions/deliverables/security/ directory.',
      inputSchema: FileSystemTool.getToolDefinition().inputSchema,
      handler: async (input: any) => {
        const result = await this.fileSystemTool.execute(input);
        return new StringToolOutput(JSON.stringify(result));
      },
    });

    // Initialize the Security agent
    this.agent = new ReActAgent({
      llm: this.llm,
      memory: new UnconstrainedMemory(),
      tools: [fsToolWrapper],
    });
  }

  /**
   * Execute a security review task
   */
  async executeTask(task: AgentTask): Promise<AgentResponse> {
    const systemPrompt = `You are a Security Agent specializing in application security and vulnerability analysis.

Your expertise:
- OWASP Top 10 security vulnerabilities
- Authentication and authorization best practices
- Input validation and sanitization
- SQL injection and XSS prevention
- Secure coding practices
- Security audit and code review
- Dependency vulnerability scanning

Task to complete: ${task.description}

Instructions:
1. Review code for security vulnerabilities
2. Check for OWASP Top 10 issues
3. Validate authentication and authorization mechanisms
4. Check input validation and sanitization
5. Review API security (rate limiting, CORS, etc.)
6. Use the filesystem tool to read code files and write security reports
7. All generated files will be saved to solutions/deliverables/security/ directory
8. Create a detailed security audit report with findings and recommendations

Provide a comprehensive security assessment.`;

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
        message: response.result.text || 'Security review completed',
        data: response.result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Security review failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Perform security check on generated code
   */
  async performSecurityCheck(
    codePath: string,
    codeType: 'frontend' | 'backend' | 'database'
  ): Promise<AgentResponse> {
    const checkPrompt = `Perform a security audit on the ${codeType} code at ${codePath}.

Focus areas:
${codeType === 'frontend' ? `
- XSS vulnerabilities
- Client-side data exposure
- Secure API communication
- Input validation
` : codeType === 'backend' ? `
- Authentication vulnerabilities
- SQL injection risks
- API security issues
- Data exposure
- Rate limiting
` : `
- Database access control
- Schema security
- Injection vulnerabilities
- Data encryption
`}

Use the filesystem tool to read the code and create a security-findings.json report.`;

    try {
      const response = await this.agent.run(
        { prompt: checkPrompt },
        {
          execution: {
            maxIterations: 10,
          },
        }
      );

      return {
        success: true,
        message: 'Security check completed',
        data: response.result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Security check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate security compliance for deployment
   */
  async validateForDeployment(workspacePath: string): Promise<boolean> {
    const validationPrompt = `Validate security compliance for deployment from workspace: ${workspacePath}

Check for:
1. No hardcoded secrets or credentials
2. Proper authentication mechanisms
3. Input validation on all endpoints
4. HTTPS/TLS configuration
5. Security headers configured
6. Dependencies have no critical vulnerabilities

Return a JSON object with { compliant: boolean, issues: string[] }`;

    try {
      const response = await this.agent.run(
        { prompt: validationPrompt },
        {
          execution: {
            maxIterations: 5,
          },
        }
      );

      const result = response.result.text || '';
      return result.includes('"compliant":true') || result.includes('"compliant": true');
    } catch (error) {
      console.error('Security validation failed:', error);
      return false;
    }
  }
}
