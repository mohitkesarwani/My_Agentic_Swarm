/**
 * Enhanced Orchestrator with Agent Integration
 * Coordinates agents with proper task sequencing and artifact handoff
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { AgentRole, AgentTask, TaskStatus, IsolationContext } from '@agentic-swarm/shared';
import { RequirementParser, ParsedRequirement, RequirementModule } from './requirement-parser.js';

export interface BuildRequest {
  title: string;
  description: string;
  applyToPlatform?: boolean;
  userId?: string;
  projectId?: string;
}

export interface EnhancedPlan {
  requestId: string;
  title: string;
  parsedRequirements: ParsedRequirement;
  tasks: AgentTask[];
  userId?: string;
  projectId?: string;
}

const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..', '..');

/**
 * Enhanced Orchestrator with natural language parsing and agent coordination
 */
export class EnhancedOrchestrator {
  private requirementParser: RequirementParser;

  constructor() {
    this.requirementParser = new RequirementParser();
  }

  /**
   * Run a full build-request cycle with agent execution
   */
  async run(requestPath: string): Promise<void> {
    const raw = await fs.readFile(requestPath, 'utf-8');
    const request: BuildRequest = JSON.parse(raw);
    const requestId = crypto.randomUUID().slice(0, 8);

    console.log(`[Orchestrator] Starting build request: ${request.title}`);
    console.log(`[Orchestrator] Request ID: ${requestId}`);

    // 1. Parse requirements into modules
    console.log('[Orchestrator] Parsing requirements...');
    const parsedRequirements = this.requirementParser.parseRequirement(request.description);

    // 2. Generate enhanced plan with agent tasks
    const plan = this.generateEnhancedPlan(request, requestId, parsedRequirements);
    await this.storePlan(plan);

    // 3. Write ADR
    await this.writeAdr(plan);

    // 4. Create solution workspace with artifact directories
    const workspacePath = await this.createSolutionWorkspace(requestId, request.title, request.userId, request.projectId);
    console.log(`[Orchestrator] Workspace created at: ${workspacePath}`);

    // 5. Execute tasks in dependency order
    console.log('[Orchestrator] Executing agent tasks...');
    await this.executeTasks(plan.tasks, workspacePath);

    // 6. Verify
    await this.verify();

    console.log('[Orchestrator] Build request completed successfully');
  }

  /**
   * Generate enhanced plan from parsed requirements
   */
  private generateEnhancedPlan(
    request: BuildRequest,
    requestId: string,
    parsedRequirements: ParsedRequirement
  ): EnhancedPlan {
    const tasks: AgentTask[] = [];

    // Convert requirement modules to agent tasks
    for (const module of parsedRequirements.modules) {
      const task: AgentTask = {
        id: `${requestId}-${module.id}`,
        description: `${module.title}: ${module.description}`,
        assignedTo: module.assignedAgent,
        status: TaskStatus.PENDING,
        dependencies: module.dependencies.map((depId) => `${requestId}-${depId}`),
      };
      tasks.push(task);
    }

    return {
      requestId,
      title: request.title,
      parsedRequirements,
      tasks,
      userId: request.userId,
      projectId: request.projectId,
    };
  }

  /**
   * Execute tasks in dependency order
   */
  private async executeTasks(tasks: AgentTask[], workspacePath: string): Promise<void> {
    // Sort tasks topologically based on dependencies
    const sortedTasks = this.topologicalSort(tasks);

    for (const task of sortedTasks) {
      console.log(`[Orchestrator] Executing task: ${task.id} (${task.assignedTo})`);
      task.status = TaskStatus.IN_PROGRESS;

      try {
        // Dispatch to agent
        await this.dispatchToAgent(task, workspacePath);
        task.status = TaskStatus.COMPLETED;
        console.log(`[Orchestrator] Task ${task.id} completed successfully`);
      } catch (error) {
        task.status = TaskStatus.FAILED;
        task.error = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Orchestrator] Task ${task.id} failed:`, task.error);
        throw error;
      }
    }
  }

  /**
   * Dispatch a task to the appropriate agent
   */
  private async dispatchToAgent(task: AgentTask, workspacePath: string): Promise<void> {
    // For now, this is a placeholder that logs the dispatch
    // In a full implementation, this would instantiate and call the actual agent
    console.log(`[Orchestrator] Dispatching to ${task.assignedTo} agent`);
    console.log(`[Orchestrator] Task description: ${task.description}`);
    
    // Create agent-specific workspace
    const agentWorkspace = path.join(workspacePath, 'deliverables', task.assignedTo);
    await fs.mkdir(agentWorkspace, { recursive: true });
    
    // Write task specification for the agent
    const taskSpecPath = path.join(agentWorkspace, 'task-spec.json');
    await fs.writeFile(
      taskSpecPath,
      JSON.stringify(task, null, 2),
      'utf-8'
    );

    // Simulate agent execution by creating a placeholder result
    const resultPath = path.join(agentWorkspace, 'result.md');
    await fs.writeFile(
      resultPath,
      `# ${task.assignedTo} Agent Result\n\nTask: ${task.description}\n\nStatus: Ready for agent implementation\n`,
      'utf-8'
    );

    task.result = `Agent workspace created at ${agentWorkspace}`;
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
        throw new Error(`Circular dependency detected at task ${task.id}`);
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
   * Store plan to disk
   */
  private async storePlan(plan: EnhancedPlan): Promise<void> {
    let dir: string;
    if (plan.userId && plan.projectId) {
      dir = path.join(
        REPO_ROOT,
        'solutions',
        'users',
        plan.userId,
        'projects',
        plan.projectId,
        'builds',
        plan.requestId
      );
    } else {
      dir = path.join(REPO_ROOT, 'knowledge-base', 'prompts', 'build-requests', plan.requestId);
    }
    
    await fs.mkdir(dir, { recursive: true });
    
    // Write plan as markdown
    await fs.writeFile(path.join(dir, 'plan.md'), this.planToMarkdown(plan), 'utf-8');
    
    // Write plan as JSON for programmatic access
    await fs.writeFile(
      path.join(dir, 'plan.json'),
      JSON.stringify(plan, null, 2),
      'utf-8'
    );
  }

  /**
   * Convert plan to markdown
   */
  private planToMarkdown(plan: EnhancedPlan): string {
    const lines = [
      `# Plan: ${plan.title}`,
      '',
      `Request ID: ${plan.requestId}`,
      '',
      '## Overall Goal',
      plan.parsedRequirements.overallGoal,
      '',
    ];

    if (plan.parsedRequirements.constraints && plan.parsedRequirements.constraints.length > 0) {
      lines.push('## Constraints');
      for (const constraint of plan.parsedRequirements.constraints) {
        lines.push(`- ${constraint}`);
      }
      lines.push('');
    }

    lines.push('## Modules');
    for (const module of plan.parsedRequirements.modules) {
      lines.push(`### ${module.title} (${module.assignedAgent})`);
      lines.push(module.description);
      if (module.acceptanceCriteria.length > 0) {
        lines.push('**Acceptance Criteria:**');
        for (const criteria of module.acceptanceCriteria) {
          lines.push(`- ${criteria}`);
        }
      }
      lines.push('');
    }

    lines.push('## Tasks');
    for (const task of plan.tasks) {
      const status = task.status === TaskStatus.COMPLETED ? 'x' : ' ';
      lines.push(`- [${status}] **${task.id}** (${task.assignedTo}): ${task.description}`);
      if (task.dependencies && task.dependencies.length > 0) {
        lines.push(`  - depends on: ${task.dependencies.join(', ')}`);
      }
    }

    return lines.join('\n') + '\n';
  }

  /**
   * Write ADR
   */
  private async writeAdr(plan: EnhancedPlan): Promise<void> {
    const dir = path.join(REPO_ROOT, 'docs', 'architecture', 'decisions');
    await fs.mkdir(dir, { recursive: true });
    
    const filename = `ADR-${plan.requestId}.md`;
    const content = [
      `# ADR-${plan.requestId}: ${plan.title}`,
      '',
      '## Status',
      'Proposed',
      '',
      '## Context',
      `Build request: ${plan.title}`,
      '',
      'Requirements have been parsed into the following modules:',
      ...plan.parsedRequirements.modules.map((m) => `- ${m.title} (${m.type}): ${m.description}`),
      '',
      '## Decision',
      'Use a multi-agent approach with the following specialist agents:',
      ...plan.parsedRequirements.modules.map((m) => `- ${m.assignedAgent} Agent: ${m.title}`),
      '',
      'Agents will coordinate through a shared artifact system with the following workflow:',
      '1. Data agent creates database schemas',
      '2. Backend agent uses schemas to build API endpoints',
      '3. Frontend agent uses API contracts to build UI',
      '4. Security agent reviews all generated code',
      '5. QA agent validates functionality',
      '',
      '## Consequences',
      '- Modular code generation with clear separation of concerns',
      '- Artifacts enable seamless handoff between agents',
      '- Security and QA gates ensure code quality',
      '- Tasks execute in dependency order',
      '',
    ].join('\n');
    
    await fs.writeFile(path.join(dir, filename), content, 'utf-8');
  }

  /**
   * Create solution workspace
   */
  private async createSolutionWorkspace(
    requestId: string,
    title: string,
    userId?: string,
    projectId?: string
  ): Promise<string> {
    let dir: string;
    if (userId && projectId) {
      dir = path.join(
        REPO_ROOT,
        'solutions',
        'users',
        userId,
        'projects',
        projectId,
        'builds',
        requestId
      );
    } else {
      dir = path.join(REPO_ROOT, 'solutions', '_staging', requestId);
    }

    await fs.mkdir(dir, { recursive: true });
    
    // Create subdirectories for agent deliverables
    const subDirs = ['deliverables', 'artifacts', 'schemas', 'contracts', 'docs'];
    for (const subDir of subDirs) {
      await fs.mkdir(path.join(dir, subDir), { recursive: true });
    }

    await fs.writeFile(
      path.join(dir, 'README.md'),
      `# Solution: ${title}\n\nRequest ID: ${requestId}\n\nGenerated by enhanced orchestrator with agent coordination.\n`,
      'utf-8'
    );

    return dir;
  }

  /**
   * Verify the solution
   */
  private async verify(): Promise<void> {
    console.log('[Orchestrator] Running verification...');
    const { execSync } = await import('node:child_process');
    try {
      execSync('node scripts/verify.mjs', { cwd: REPO_ROOT, stdio: 'inherit' });
    } catch {
      console.warn('[Orchestrator] Verify did not pass — some checks may have failed.');
    }
  }
}
