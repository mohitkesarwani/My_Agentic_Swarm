/**
 * Build Executor Service
 * Integrates with the orchestrator to execute builds and track progress
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { Project, BuildStatus } from '../models/project.model.js';
import { logger } from '../config/logger.js';

interface BuildContext {
  projectId: string;
  userId: string;
  buildRequestId: string;
  prompt: string;
}

/**
 * Execute a build request using the orchestrator
 */
export async function executeBuild(context: BuildContext): Promise<void> {
  const { projectId, userId, buildRequestId, prompt } = context;
  const logPrefix = `[Build ${buildRequestId}]`;

  logger.info(`${logPrefix} Starting build for project ${projectId}`);

  // Update status to running
  await updateBuildStatus(projectId, buildRequestId, BuildStatus.RUNNING);
  await addBuildLog(projectId, buildRequestId, `Build started at ${new Date().toISOString()}`);

  try {
    // Create build request file for orchestrator
    const stagingPath = path.join(
      process.cwd(),
      'solutions',
      'users',
      userId,
      'projects',
      projectId,
      'builds',
      buildRequestId
    );

    await fs.mkdir(stagingPath, { recursive: true });

    const buildRequestPath = path.join(stagingPath, 'build-request.json');
    const buildRequest = {
      title: `Build ${buildRequestId}`,
      description: prompt,
      applyToPlatform: false,
      userId,
      projectId,
    };

    await fs.writeFile(buildRequestPath, JSON.stringify(buildRequest, null, 2), 'utf-8');
    await addBuildLog(projectId, buildRequestId, `Created build request at ${buildRequestPath}`);

    // Execute orchestrator
    await executeOrchestrator(buildRequestPath, projectId, buildRequestId);

    // Mark as completed
    await Project.updateOne(
      {
        _id: projectId,
        'buildRequests.requestId': buildRequestId,
      },
      {
        $set: {
          'buildRequests.$.status': BuildStatus.COMPLETED,
          'buildRequests.$.completedAt': new Date(),
          'buildRequests.$.stagingPath': stagingPath,
        },
      }
    );

    await addBuildLog(projectId, buildRequestId, `Build completed successfully at ${new Date().toISOString()}`);
    logger.info(`${logPrefix} Completed successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Mark as failed
    await Project.updateOne(
      {
        _id: projectId,
        'buildRequests.requestId': buildRequestId,
      },
      {
        $set: {
          'buildRequests.$.status': BuildStatus.FAILED,
          'buildRequests.$.completedAt': new Date(),
          'buildRequests.$.error': errorMessage,
        },
      }
    );

    await addBuildLog(projectId, buildRequestId, `Build failed: ${errorMessage}`);
    logger.error({ err: error }, `${logPrefix} Failed`);
  }
}

/**
 * Execute the orchestrator as a child process
 */
async function executeOrchestrator(
  buildRequestPath: string,
  projectId: string,
  buildRequestId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const orchestratorPath = path.join(process.cwd(), 'tools', 'orchestrator', 'src', 'index.ts');
    
    // Use tsx to run TypeScript directly
    const child = spawn('npx', ['tsx', orchestratorPath, buildRequestPath, '--enhanced'], {
      cwd: process.cwd(),
      env: { ...process.env },
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', async (data) => {
      const output = data.toString();
      stdout += output;
      
      // Log output in real-time
      const lines = output.split('\n').filter((l: string) => l.trim());
      for (const line of lines) {
        await addBuildLog(projectId, buildRequestId, line);
        
        // Parse for agent activities
        await parseAgentActivity(line, projectId, buildRequestId);
      }
    });

    child.stderr?.on('data', async (data) => {
      const output = data.toString();
      stderr += output;
      await addBuildLog(projectId, buildRequestId, `ERROR: ${output}`);
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to start orchestrator: ${error.message}`));
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Orchestrator exited with code ${code}\n${stderr}`));
      }
    });
  });
}

/**
 * Parse orchestrator output for agent activities
 */
async function parseAgentActivity(
  logLine: string,
  projectId: string,
  buildRequestId: string
): Promise<void> {
  // Look for patterns like "[Orchestrator] Executing task: xxx (agent_name)"
  const executingMatch = logLine.match(/\[Orchestrator\] Executing task: ([^\(]+) \(([^)]+)\)/);
  if (executingMatch) {
    const [, taskId, agentRole] = executingMatch;
    await addAgentActivity(projectId, buildRequestId, {
      timestamp: new Date(),
      agentRole: agentRole.trim(),
      taskId: taskId.trim(),
      action: 'Executing task',
      status: 'started',
    });
    return;
  }

  // Look for task completion
  const completedMatch = logLine.match(/\[Orchestrator\] Task ([^\s]+) completed successfully/);
  if (completedMatch) {
    const [, taskId] = completedMatch;
    await addAgentActivity(projectId, buildRequestId, {
      timestamp: new Date(),
      agentRole: 'orchestrator',
      taskId: taskId.trim(),
      action: 'Task completed',
      status: 'completed',
    });
    return;
  }

  // Look for dispatching to agent
  const dispatchMatch = logLine.match(/\[Orchestrator\] Dispatching to ([^\s]+) agent/);
  if (dispatchMatch) {
    const [, agentRole] = dispatchMatch;
    await addAgentActivity(projectId, buildRequestId, {
      timestamp: new Date(),
      agentRole: agentRole.trim(),
      taskId: buildRequestId,
      action: 'Agent dispatched',
      status: 'progress',
    });
  }
}

/**
 * Update build status
 */
async function updateBuildStatus(
  projectId: string,
  buildRequestId: string,
  status: BuildStatus
): Promise<void> {
  await Project.updateOne(
    {
      _id: projectId,
      'buildRequests.requestId': buildRequestId,
    },
    {
      $set: {
        'buildRequests.$.status': status,
      },
    }
  );
}

/**
 * Add a log entry to the build
 */
async function addBuildLog(
  projectId: string,
  buildRequestId: string,
  logEntry: string
): Promise<void> {
  await Project.updateOne(
    {
      _id: projectId,
      'buildRequests.requestId': buildRequestId,
    },
    {
      $push: {
        'buildRequests.$.logs': logEntry,
      },
    }
  );
}

/**
 * Add an agent activity entry
 */
async function addAgentActivity(
  projectId: string,
  buildRequestId: string,
  activity: {
    timestamp: Date;
    agentRole: string;
    taskId: string;
    action: string;
    status: 'started' | 'progress' | 'completed' | 'failed';
    details?: string;
  }
): Promise<void> {
  await Project.updateOne(
    {
      _id: projectId,
      'buildRequests.requestId': buildRequestId,
    },
    {
      $push: {
        'buildRequests.$.agentActivities': activity,
      },
    }
  );
}
