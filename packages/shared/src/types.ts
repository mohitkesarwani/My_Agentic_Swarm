/**
 * Shared type definitions for the Agentic Swarm monorepo
 */

/** Agent roles across the platform */
export enum AgentRole {
  ARCHITECT = 'architect',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  QA = 'qa',
  SECURITY = 'security',
  INFRA = 'infra',
  DATA = 'data',
  DEFI_PRODUCT = 'defi_product',
  SMART_CONTRACT = 'smart_contract',
  SMART_CONTRACT_SECURITY = 'smart_contract_security',
  FUZZING = 'fuzzing',
  PROTOCOL_RISK = 'protocol_risk',
  WALLET = 'wallet',
  ONCHAIN_OFFCHAIN = 'onchain_offchain',
  ORACLE = 'oracle',
  COMPLIANCE = 'compliance',
}

/** Task status in workflows */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  VALIDATION_REQUIRED = 'validation_required',
}

/** Task definition for agents */
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

/** Standard API error envelope */
export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  requestId?: string;
}

/** Standard API success envelope */
export interface ApiResponse<T = unknown> {
  data: T;
  meta?: Record<string, unknown>;
}

/** Health check response */
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  timestamp: string;
  uptime: number;
}

/** Build status for project builds */
export enum BuildStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/** User profile */
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

/** Build request within a project */
export interface BuildRequest {
  requestId: string;
  prompt: string;
  status: BuildStatus;
  stagingPath?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

/** Project */
export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  buildRequests: BuildRequest[];
  createdAt: string;
  updatedAt: string;
}

/** Auth response with JWT token */
export interface AuthResponse {
  token: string;
  user: User;
}

/** Register request */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/** Login request */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Create project request */
export interface CreateProjectRequest {
  name: string;
  description?: string;
}

/** Create build request */
export interface CreateBuildRequest {
  prompt: string;
}

/** Agent communication contract - defines inputs/outputs for agent handoffs */
export interface AgentContract {
  agentRole: AgentRole;
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
  artifacts?: ArtifactDefinition[];
}

/** Artifact definition for agent outputs */
export interface ArtifactDefinition {
  type: 'schema' | 'interface' | 'endpoint' | 'component' | 'test' | 'documentation';
  name: string;
  path: string;
  content?: string;
  metadata?: Record<string, any>;
}

/** Agent handoff data - shared between agents */
export interface AgentHandoff {
  fromAgent: AgentRole;
  toAgent: AgentRole;
  taskId: string;
  artifacts: ArtifactDefinition[];
  message?: string;
  timestamp: string;
}

/** Requirement module - parsed from user requirements */
export interface RequirementModule {
  id: string;
  title: string;
  description: string;
  type: 'frontend' | 'backend' | 'database' | 'security' | 'infrastructure';
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  acceptanceCriteria?: string[];
}

/** Agent execution context with shared artifacts */
export interface AgentExecutionContext {
  taskId: string;
  agentRole: AgentRole;
  artifacts: Map<string, ArtifactDefinition>;
  handoffs: AgentHandoff[];
  sharedWorkspacePath: string;
}

