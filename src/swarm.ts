/**
 * Swarm Orchestrator
 * Coordinates multiple agents in the Architect-Worker pattern
 */

import { GroqChatModel } from 'beeai-framework/adapters/groq/backend/chat';
import { ArchitectAgent } from './agents/architect.js';
import { FrontendAgent } from './agents/frontend.js';
import { BackendAgent } from './agents/backend.js';
import { QAAgent } from './agents/qa.js';
import { SecurityAgent } from './agents/security.js';
import { DataAgent } from './agents/data.js';
import { RenderDeployTool } from './tools/render-deploy.js';
import { ArtifactManager } from './tools/artifact-manager.js';
import {
  AgentTask,
  AgentRole,
  TaskStatus,
  SwarmConfig,
  WorkflowState,
  DeploymentConfig,
  IsolationContext,
} from './types/index.js';

/**
 * Main Swarm Class
 */
export class AgenticSwarm {
  private architectAgent: ArchitectAgent;
  private frontendAgent: FrontendAgent;
  private backendAgent: BackendAgent;
  private qaAgent: QAAgent;
  private securityAgent: SecurityAgent;
  private dataAgent: DataAgent;
  private deployTool?: RenderDeployTool;
  private artifactManager: ArtifactManager;
  private workflowState?: WorkflowState;

  constructor(
    private config: SwarmConfig,
    basePath: string = process.cwd(),
    mongoUri?: string,
    deployConfig?: DeploymentConfig,
    private isolation?: IsolationContext
  ) {
    // Initialize Groq LLM
    const llm = new GroqChatModel(config.modelName as any, undefined, {
      apiKey: config.groqApiKey,
    });

    // Initialize artifact manager
    this.artifactManager = new ArtifactManager(basePath, isolation);

    // Initialize all agents with isolation context
    this.architectAgent = new ArchitectAgent(llm);
    this.frontendAgent = new FrontendAgent(llm, basePath, isolation);
    this.backendAgent = new BackendAgent(llm, basePath, mongoUri, isolation);
    this.qaAgent = new QAAgent(llm, basePath, isolation);
    this.securityAgent = new SecurityAgent(llm, basePath, isolation);
    this.dataAgent = new DataAgent(llm, basePath, mongoUri, isolation);

    // Initialize deployment tool if configured
    if (deployConfig) {
      this.deployTool = new RenderDeployTool(deployConfig);
    }

    this.log('info', 'Agentic Swarm initialized successfully with Security and Data agents');
  }

  /**
   * Execute a user prompt through the swarm
   */
  async executePrompt(userPrompt: string): Promise<WorkflowState> {
    this.log('info', `Starting workflow for prompt: "${userPrompt}"`);

    // Initialize workflow state
    this.workflowState = {
      userPrompt,
      tasks: [],
      currentPhase: 'planning',
      startTime: new Date(),
    };

    try {
      // Initialize artifact manager
      await this.artifactManager.initialize();

      // Phase 1: Planning - Architect breaks down the prompt
      this.log('info', 'Phase 1: Planning with Architect Agent');
      this.workflowState.currentPhase = 'planning';
      const tasks = await this.architectAgent.analyzeTasks(userPrompt);
      this.workflowState.tasks = tasks;
      this.log('info', `Architect created ${tasks.length} tasks`);

      // Phase 2: Development - Execute tasks with worker agents
      this.log('info', 'Phase 2: Development with Worker Agents');
      this.workflowState.currentPhase = 'development';
      await this.executeTasks(tasks);

      // Phase 3: Security Review
      this.log('info', 'Phase 3: Security Review with Security Agent');
      this.workflowState.currentPhase = 'testing';
      await this.performSecurityReview(tasks);

      // Phase 4: Testing - QA validates the work
      this.log('info', 'Phase 4: Testing with QA Agent');
      await this.validateTasks(tasks);

      // Phase 5: Deployment (optional)
      if (this.deployTool) {
        this.log('info', 'Phase 5: Deployment');
        this.workflowState.currentPhase = 'deployment';
        await this.deployTool.deploy();
      }

      // Export artifact manifest
      await this.artifactManager.exportManifest();

      // Complete workflow
      this.workflowState.currentPhase = 'completed';
      this.workflowState.endTime = new Date();
      this.log('info', 'Workflow completed successfully');

      return this.workflowState;
    } catch (error) {
      this.log('error', `Workflow failed: ${error}`);
      throw error;
    }
  }

  /**
   * Execute tasks with appropriate worker agents
   */
  private async executeTasks(tasks: AgentTask[]): Promise<void> {
    // Sort tasks by dependencies
    const sortedTasks = this.topologicalSort(tasks);

    for (const task of sortedTasks) {
      await this.executeTask(task);
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: AgentTask): Promise<void> {
    this.log('info', `Executing task: ${task.id} - ${task.description}`);

    let retryCount = 0;
    const maxRetries = this.config.maxRetries;

    while (retryCount <= maxRetries) {
      try {
        task.status = TaskStatus.IN_PROGRESS;

        // Route to appropriate agent
        const agent = this.getAgentForRole(task.assignedTo);
        const response = await agent.executeTask(task);

        if (response.success) {
          task.status = TaskStatus.COMPLETED;
          task.result = response.data || response.message;
          this.log('info', `Task ${task.id} completed successfully`);
          return;
        } else {
          throw new Error(response.error || 'Task execution failed');
        }
      } catch (error) {
        retryCount++;
        task.retryCount = retryCount;

        if (retryCount <= maxRetries) {
          this.log('warn', `Task ${task.id} failed, retrying (${retryCount}/${maxRetries})`);
          await this.delay(1000 * retryCount); // Exponential backoff
        } else {
          task.status = TaskStatus.FAILED;
          task.error = error instanceof Error ? error.message : 'Unknown error';
          this.log('error', `Task ${task.id} failed after ${maxRetries} retries`);
          throw error;
        }
      }
    }
  }

  /**
   * Validate tasks with QA agent
   */
  private async validateTasks(tasks: AgentTask[]): Promise<void> {
    for (const task of tasks) {
      if (task.status === TaskStatus.COMPLETED) {
        this.log('info', `Validating task: ${task.id}`);

        const qaTask: AgentTask = {
          id: `qa-${task.id}`,
          description: `Validate and test: ${task.description}`,
          assignedTo: AgentRole.QA,
          status: TaskStatus.PENDING,
        };

        const response = await this.qaAgent.executeTask(qaTask);

        if (!response.success) {
          task.status = TaskStatus.VALIDATION_REQUIRED;
          this.log('warn', `Task ${task.id} requires fixes based on QA feedback`);
        } else {
          this.log('info', `Task ${task.id} validated successfully`);
        }
      }
    }
  }

  /**
   * Perform security review on completed tasks
   */
  private async performSecurityReview(tasks: AgentTask[]): Promise<void> {
    this.log('info', 'Performing security review on generated code');

    const securityTask: AgentTask = {
      id: 'security-review',
      description: 'Perform comprehensive security audit on all generated code',
      assignedTo: AgentRole.SECURITY,
      status: TaskStatus.PENDING,
    };

    const response = await this.securityAgent.executeTask(securityTask);

    if (!response.success) {
      this.log('error', 'Security review failed - deployment blocked');
      throw new Error('Security review failed: ' + response.error);
    } else {
      this.log('info', 'Security review passed');
    }
  }

  /**
   * Get agent for specific role
   */
  private getAgentForRole(role: AgentRole): FrontendAgent | BackendAgent | QAAgent | SecurityAgent | DataAgent {
    switch (role) {
      case AgentRole.FRONTEND:
        return this.frontendAgent;
      case AgentRole.BACKEND:
        return this.backendAgent;
      case AgentRole.QA:
        return this.qaAgent;
      case AgentRole.SECURITY:
        return this.securityAgent;
      case AgentRole.DATA:
        return this.dataAgent;
      default:
        throw new Error(`Unknown agent role: ${role}`);
    }
  }

  /**
   * Topological sort for task dependencies
   */
  private topologicalSort(tasks: AgentTask[]): AgentTask[] {
    const sorted: AgentTask[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (task: AgentTask) => {
      if (temp.has(task.id)) {
        throw new Error('Circular dependency detected');
      }
      if (visited.has(task.id)) {
        return;
      }

      temp.add(task.id);

      // Visit dependencies first
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          const depTask = tasks.find((t) => t.id === depId);
          if (depTask) {
            visit(depTask);
          }
        }
      }

      temp.delete(task.id);
      visited.add(task.id);
      sorted.push(task);
    };

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        visit(task);
      }
    }

    return sorted;
  }

  /**
   * Logging utility
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevel = levels.indexOf(this.config.logLevel);
    const messageLevel = levels.indexOf(level);

    if (messageLevel >= configLevel) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current workflow state
   */
  getWorkflowState(): WorkflowState | undefined {
    return this.workflowState;
  }

  /**
   * Get artifact manager
   */
  getArtifactManager(): ArtifactManager {
    return this.artifactManager;
  }
}
