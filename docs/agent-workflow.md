# Agent Workflow and Communication Protocols

This document describes how agents in the Agentic Swarm coordinate, communicate, and hand off work to each other.

## Overview

The Agentic Swarm uses a multi-agent architecture where specialist agents collaborate to build complete solutions. Each agent has a specific role and expertise, and they communicate through a structured artifact system.

## Agent Roles

### Core Agents

1. **Architect Agent** - Plans and breaks down requirements into tasks
2. **Frontend Agent** - Builds user interfaces with React and Tailwind CSS
3. **Backend Agent** - Creates REST APIs with Fastify/Express
4. **Data Agent** - Designs database schemas and Mongoose models
5. **Security Agent** - Performs security audits and vulnerability assessments
6. **QA Agent** - Validates code quality and generates tests

### Workflow Phases

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: PLANNING                                          │
│  Architect Agent analyzes user requirements                 │
│  → Breaks down into modules and tasks                       │
│  → Assigns tasks to specialist agents                       │
│  → Establishes dependencies between tasks                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: DEVELOPMENT                                       │
│  Agents execute tasks in dependency order:                  │
│  1. Data Agent → Creates schemas                            │
│  2. Backend Agent → Builds APIs using schemas               │
│  3. Frontend Agent → Builds UI using API contracts          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: SECURITY REVIEW                                   │
│  Security Agent audits all generated code                   │
│  → Checks for vulnerabilities                               │
│  → Validates security best practices                        │
│  → Blocks deployment if critical issues found               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: TESTING                                           │
│  QA Agent validates all components                          │
│  → Generates automated tests                                │
│  → Validates functionality                                  │
│  → Reports issues for fixing                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 5: DEPLOYMENT (Optional)                             │
│  Deploy tool publishes the solution                         │
└─────────────────────────────────────────────────────────────┘
```

## Artifact System

### What are Artifacts?

Artifacts are structured data objects that agents produce and consume. They enable contract-driven communication between agents.

### Artifact Types

1. **schema** - Database schema definitions (Data Agent → Backend Agent)
2. **interface** - TypeScript interfaces (Backend Agent → Frontend Agent)
3. **endpoint** - API endpoint specifications (Backend Agent → Frontend Agent)
4. **component** - React components (Frontend Agent)
5. **test** - Test suites (QA Agent)
6. **documentation** - Technical documentation (All agents)

### Artifact Structure

```typescript
interface Artifact {
  id: string;                    // Unique identifier
  type: 'schema' | 'interface' | 'endpoint' | 'component' | 'test' | 'documentation';
  name: string;                  // Artifact name
  path: string;                  // File path
  content: string;               // Artifact content
  metadata: Record<string, any>; // Additional metadata
  producedBy: AgentRole;         // Agent that created it
  consumedBy?: AgentRole[];      // Agents that use it
  timestamp: Date;               // Creation timestamp
}
```

## Agent Communication Patterns

### 1. Data Agent → Backend Agent

**Scenario**: Backend needs database schema to create typed endpoints

```typescript
// Data Agent produces schema artifact
await artifactManager.publishArtifact({
  type: 'schema',
  name: 'User',
  path: 'schemas/User.json',
  content: JSON.stringify(userSchema),
  producedBy: AgentRole.DATA,
  consumedBy: [AgentRole.BACKEND],
  metadata: { collection: 'users', indexes: ['email'] }
});

// Backend Agent consumes schema artifact
const schemas = artifactManager.getArtifactsForConsumer(AgentRole.BACKEND);
// Use schemas to generate typed API endpoints
```

### 2. Backend Agent → Frontend Agent

**Scenario**: Frontend needs API endpoint contracts to make requests

```typescript
// Backend Agent produces endpoint artifact
await artifactManager.publishArtifact({
  type: 'endpoint',
  name: 'UserAPI',
  path: 'contracts/user-api.json',
  content: JSON.stringify({
    endpoints: [
      { method: 'GET', path: '/api/users', response: 'User[]' },
      { method: 'POST', path: '/api/users', body: 'CreateUserDto', response: 'User' }
    ]
  }),
  producedBy: AgentRole.BACKEND,
  consumedBy: [AgentRole.FRONTEND],
  metadata: { baseUrl: '/api' }
});

// Frontend Agent consumes endpoint artifact
const endpoints = artifactManager.getArtifactsByType('endpoint');
// Generate API client hooks based on endpoints
```

### 3. Handoff System

Agents can create explicit handoffs with messages:

```typescript
// Backend Agent hands off to Frontend Agent
await artifactManager.createHandoff(
  AgentRole.BACKEND,
  AgentRole.FRONTEND,
  [endpointArtifactId, interfaceArtifactId],
  'API endpoints are ready. Use the provided interfaces for type safety.'
);

// Frontend Agent retrieves handoffs
const handoffs = artifactManager.getHandoffsForAgent(AgentRole.FRONTEND);
for (const handoff of handoffs) {
  console.log(`From ${handoff.fromAgent}: ${handoff.message}`);
  // Process artifacts from handoff
}
```

## Workspace Structure

Each build request gets an isolated workspace:

```
solutions/
├── users/
│   └── <userId>/
│       └── projects/
│           └── <projectId>/
│               └── builds/
│                   └── <buildRequestId>/
│                       ├── README.md
│                       ├── artifacts/
│                       │   ├── schemas/
│                       │   ├── interfaces/
│                       │   ├── endpoints/
│                       │   ├── components/
│                       │   ├── tests/
│                       │   └── manifest.json
│                       ├── deliverables/
│                       │   ├── frontend/
│                       │   ├── backend/
│                       │   ├── data/
│                       │   ├── security/
│                       │   └── qa/
│                       └── contracts/
└── _staging/              # Legacy CLI mode
    └── <requestId>/
```

## Agent Input/Output Contracts

### Agent Input

```typescript
interface AgentTask {
  id: string;
  description: string;
  assignedTo: AgentRole;
  status: TaskStatus;
  dependencies?: string[];  // Must complete before this task
  result?: string;
  error?: string;
  retryCount?: number;
}
```

### Agent Output

```typescript
interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}
```

## Security Gates

### Pre-Deployment Security Check

Before any code can be deployed, it must pass security review:

```typescript
const securityPassed = await securityAgent.validateForDeployment(workspacePath);
if (!securityPassed) {
  throw new Error('Security review failed - deployment blocked');
}
```

### Security Checklist

The Security Agent verifies:
- ✅ No hardcoded secrets or credentials
- ✅ Proper authentication mechanisms
- ✅ Input validation on all endpoints
- ✅ HTTPS/TLS configuration
- ✅ Security headers configured
- ✅ No critical dependency vulnerabilities

## QA Gates

### Testing Requirements

All code must pass QA validation before promotion:

```typescript
const qaResult = await qaAgent.executeTask(qaTask);
if (!qaResult.success) {
  task.status = TaskStatus.VALIDATION_REQUIRED;
  // Code requires fixes before promotion
}
```

### QA Checklist

The QA Agent verifies:
- ✅ All unit tests pass
- ✅ Integration tests pass
- ✅ Code meets quality standards
- ✅ Test coverage is adequate
- ✅ No critical bugs or issues

## Extension Points

### Adding New Agents

1. Create agent class implementing the agent interface:

```typescript
export class MyCustomAgent {
  async executeTask(task: AgentTask): Promise<AgentResponse> {
    // Agent implementation
  }
}
```

2. Register agent in swarm.ts:

```typescript
this.myCustomAgent = new MyCustomAgent(llm, basePath, isolation);
```

3. Update getAgentForRole() method:

```typescript
case AgentRole.MY_CUSTOM:
  return this.myCustomAgent;
```

### Adding New Artifact Types

1. Update Artifact type union in artifact-manager.ts
2. Create artifact type-specific handler if needed
3. Document the new artifact type contract

## Best Practices

### For Agent Developers

1. **Always publish artifacts** - Other agents depend on them
2. **Check for handoffs** - Process artifacts from upstream agents
3. **Validate inputs** - Don't assume artifacts are perfect
4. **Clear error messages** - Help orchestrator understand failures
5. **Idempotent operations** - Tasks may be retried

### For Orchestrator Users

1. **Clear requirements** - Be specific about what you want
2. **Trust the process** - Let agents coordinate automatically
3. **Review security reports** - Don't ignore security warnings
4. **Check QA feedback** - Address issues before deployment

## Troubleshooting

### Agent Task Failed

```bash
# Check task logs
cat solutions/users/<userId>/projects/<projectId>/builds/<buildRequestId>/deliverables/<agent>/task-spec.json

# Review agent output
cat solutions/users/<userId>/projects/<projectId>/builds/<buildRequestId>/deliverables/<agent>/result.md
```

### Missing Artifacts

```bash
# Check artifact manifest
cat solutions/users/<userId>/projects/<projectId>/builds/<buildRequestId>/artifacts/manifest.json
```

### Security Review Failed

```bash
# Check security report
cat solutions/users/<userId>/projects/<projectId>/builds/<buildRequestId>/deliverables/security/security-findings.json
```

## Examples

### Example 1: Build a User Management API

**User Requirement**: "Build a user management API with authentication"

**Agent Workflow**:

1. **Architect** - Creates tasks for data model, backend API, and security
2. **Data Agent** - Designs User schema with email, password, role
3. **Backend Agent** - Creates REST endpoints using User schema
4. **Security Agent** - Audits authentication implementation
5. **QA Agent** - Tests all API endpoints

**Artifacts Produced**:
- User.schema.json (Data → Backend)
- user-api-contract.json (Backend → Frontend)
- auth-security-report.md (Security)
- user-api.test.ts (QA)

### Example 2: Build a Dashboard UI

**User Requirement**: "Build a dashboard to display user analytics"

**Agent Workflow**:

1. **Architect** - Creates tasks for backend API and frontend UI
2. **Backend Agent** - Creates analytics endpoint
3. **Frontend Agent** - Builds dashboard using endpoint contract
4. **QA Agent** - Tests UI components and API integration

**Artifacts Produced**:
- analytics-api-contract.json (Backend → Frontend)
- Dashboard.tsx (Frontend)
- dashboard.test.tsx (QA)

## References

- [Architecture Decision Records](../../docs/architecture/decisions/)
- [API Conventions](../../knowledge-base/engineering/coding-standards.md)
- [Security Standards](../../knowledge-base/engineering/security-standards.md)
