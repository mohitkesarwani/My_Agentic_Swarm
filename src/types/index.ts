/**
 * Type definitions for My Agentic Swarm
 */

/**
 * Isolation context for multi-user/project support
 */
export interface IsolationContext {
  userId: string;
  projectId: string;
  buildRequestId: string;
}

/**
 * Supported agent roles in the swarm
 */
export enum AgentRole {
  ARCHITECT = 'architect',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  QA = 'qa',
  SECURITY = 'security',
  DATA = 'data',
}

/**
 * Task status in the workflow
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  VALIDATION_REQUIRED = 'validation_required',
}

/**
 * Task definition for agents
 */
export interface AgentTask {
  id: string;
  description: string;
  assignedTo: AgentRole;
  status: TaskStatus;
  dependencies?: string[];
  result?: string;
  error?: string;
  retryCount?: number;
}

/**
 * Swarm configuration
 */
export interface SwarmConfig {
  maxRetries: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  groqApiKey: string;
  modelName: string;
  mcpApiUrl?: string;
  mcpApiKey?: string;
}

/**
 * Agent response structure
 */
export interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * File operation types
 */
export interface FileOperation {
  type: 'create' | 'update' | 'delete' | 'read';
  path: string;
  content?: string;
}

/**
 * MongoDB operation parameters
 */
export interface MongoOperation {
  operation: 'find' | 'findOne' | 'insert' | 'update' | 'delete';
  collection: string;
  query?: Record<string, any>;
  data?: Record<string, any>;
}

/**
 * Deployment configuration
 */
export interface DeploymentConfig {
  webhookUrl: string;
  environment: 'development' | 'staging' | 'production';
}

/**
 * Workflow state
 */
export interface WorkflowState {
  userPrompt: string;
  tasks: AgentTask[];
  currentPhase: 'planning' | 'development' | 'testing' | 'deployment' | 'completed';
  startTime: Date;
  endTime?: Date;
}
