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
