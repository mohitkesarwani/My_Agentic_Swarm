/**
 * Architect Agent - Supervisor and Orchestrator
 * Breaks down user prompts into actionable tasks and routes to specialized agents
 */

import { ReActAgent } from 'beeai-framework/agents/react/agent';
import { UnconstrainedMemory } from 'beeai-framework/memory/unconstrainedMemory';
import { GroqChatModel } from 'beeai-framework/adapters/groq/backend/chat';
import { AgentTask, AgentRole, TaskStatus } from '../types/index.js';

export class ArchitectAgent {
  private agent: ReActAgent;

  constructor(private llm: GroqChatModel) {
    // Initialize the Architect agent with specific instructions
    this.agent = new ReActAgent({
      llm: this.llm,
      memory: new UnconstrainedMemory(),
      tools: [],
    });
  }

  /**
   * Analyze user prompt and break it down into tasks
   */
  async analyzeTasks(userPrompt: string): Promise<AgentTask[]> {
    const systemPrompt = `You are an Architect Agent responsible for breaking down software development tasks.
    
Your role:
1. Analyze the user's request
2. Break it down into specific, actionable tasks
3. Assign each task to the appropriate agent (frontend, backend, or qa)
4. Define dependencies between tasks
5. Ensure tasks are clear and achievable

Available agents:
- frontend: React, Tailwind CSS, Mobile-First design
- backend: Node.js, Express.js, MongoDB operations
- qa: Testing, verification, Jest test creation

Respond with a JSON array of tasks in this format:
[
  {
    "id": "task-1",
    "description": "Clear description of the task",
    "assignedTo": "frontend|backend|qa",
    "dependencies": []
  }
]

User request: ${userPrompt}`;

    try {
      const response = await this.agent.run(
        { prompt: systemPrompt },
        {
          execution: {
            maxIterations: 5,
          },
        }
      );

      // Parse the agent's response to extract tasks
      const tasks = this.parseTasksFromResponse(response.result.text);
      return tasks;
    } catch (error) {
      console.error('Architect agent error:', error);
      throw error;
    }
  }

  /**
   * Parse tasks from agent response
   */
  private parseTasksFromResponse(responseText: string): AgentTask[] {
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // Fallback: create a single task if parsing fails
        return [
          {
            id: 'task-1',
            description: 'Complete the user request',
            assignedTo: AgentRole.BACKEND,
            status: TaskStatus.PENDING,
          },
        ];
      }

      const parsedTasks = JSON.parse(jsonMatch[0]);
      return parsedTasks.map((task: any, index: number) => ({
        id: task.id || `task-${index + 1}`,
        description: task.description,
        assignedTo: task.assignedTo as AgentRole,
        status: TaskStatus.PENDING,
        dependencies: task.dependencies || [],
        retryCount: 0,
      }));
    } catch (error) {
      console.error('Error parsing tasks:', error);
      // Return a default task if parsing fails
      return [
        {
          id: 'task-1',
          description: 'Complete the user request',
          assignedTo: AgentRole.BACKEND,
          status: TaskStatus.PENDING,
        },
      ];
    }
  }

  /**
   * Validate task completion
   */
  async validateTask(task: AgentTask): Promise<{ valid: boolean; feedback?: string }> {
    const prompt = `Review the following completed task and determine if it meets the requirements:

Task: ${task.description}
Result: ${task.result || 'No result provided'}

Respond with:
- VALID if the task is complete and correct
- INVALID: [reason] if there are issues

Your response:`;

    try {
      const response = await this.agent.run(
        { prompt },
        {
          execution: {
            maxIterations: 3,
          },
        }
      );

      const result = response.result.text;
      const isValid = result.toLowerCase().includes('valid') && !result.toLowerCase().includes('invalid');

      return {
        valid: isValid,
        feedback: isValid ? undefined : result,
      };
    } catch (error) {
      console.error('Validation error:', error);
      return { valid: false, feedback: 'Validation failed due to error' };
    }
  }

  /**
   * Get the underlying ReAct agent
   */
  getAgent(): ReActAgent {
    return this.agent;
  }
}
