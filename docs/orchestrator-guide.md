# Orchestrator Documentation

## Overview

The Orchestrator is the central coordinator in the Agentic Swarm. It accepts build requests, parses requirements, assigns tasks to specialist agents, and manages the end-to-end workflow.

## Two Orchestrator Modes

### 1. Basic Orchestrator (Legacy)

The original orchestrator provides simple task generation and planning:

```bash
node tools/orchestrator/src/index.js /path/to/build-request.json
```

**Features**:
- Generates static plan from build request
- Creates ADR (Architecture Decision Record)
- Creates solution workspace
- Logs task dispatch (agents not actually invoked)

### 2. Enhanced Orchestrator (New)

The enhanced orchestrator adds natural language parsing and actual agent execution:

```bash
node tools/orchestrator/src/index.js /path/to/build-request.json --enhanced
```

**Features**:
- Parses natural language requirements into structured modules
- Identifies required agents based on requirement content
- Executes tasks in dependency order
- Manages artifact handoffs between agents
- Enforces security and QA gates

## Build Request Format

### JSON Structure

```json
{
  "title": "User Management System",
  "description": "Build a user management system with authentication, user CRUD operations, and an admin dashboard.",
  "applyToPlatform": false,
  "userId": "user-123",
  "projectId": "proj-456"
}
```

### Fields

- **title** (required) - Short title for the build request
- **description** (required) - Natural language description of what to build
- **applyToPlatform** (optional) - Whether to apply changes to the main platform
- **userId** (optional) - User ID for multi-user mode
- **projectId** (optional) - Project ID for multi-user mode

## Requirement Parsing

The enhanced orchestrator automatically parses natural language requirements:

### Detection Rules

**Frontend Detection**:
- Keywords: ui, interface, frontend, react, component, page, form, button, display, view, screen, dashboard, mobile, web

**Backend Detection**:
- Keywords: api, backend, server, endpoint, rest, graphql, service, authentication, authorization, route, controller, middleware

**Database Detection**:
- Keywords: database, db, mongodb, schema, model, collection, data, store, persist, query, mongoose

### Example Parsing

**Input**:
```
"Build a REST API for user management with MongoDB storage and a React dashboard"
```

**Parsed Modules**:

1. **User Interface Module**
   - Type: frontend
   - Assigned: Frontend Agent
   - Description: Build a user interface that includes a React dashboard

2. **Backend API Module**
   - Type: backend
   - Assigned: Backend Agent
   - Description: Build a backend API that provides REST API for user management

3. **Data Model Module**
   - Type: database
   - Assigned: Data Agent
   - Description: Design database schemas for MongoDB storage

4. **Quality Assurance Module**
   - Type: qa
   - Assigned: QA Agent
   - Dependencies: All development modules

5. **Security Review Module**
   - Type: security
   - Assigned: Security Agent
   - Dependencies: All development modules

## Task Execution Flow

### 1. Parse Requirements

```typescript
const parsedRequirements = this.requirementParser.parseRequirement(request.description);
```

Output:
```typescript
{
  modules: RequirementModule[],
  overallGoal: string,
  constraints?: string[]
}
```

### 2. Generate Plan

```typescript
const plan = this.generateEnhancedPlan(request, requestId, parsedRequirements);
```

Output:
```typescript
{
  requestId: string,
  title: string,
  parsedRequirements: ParsedRequirement,
  tasks: AgentTask[],
  userId?: string,
  projectId?: string
}
```

### 3. Execute Tasks

```typescript
await this.executeTasks(plan.tasks, workspacePath);
```

Tasks are executed in topological order based on dependencies:

```
┌─────────────────────────────────────────┐
│  Dependency Resolution                  │
│  (Topological Sort)                     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Task 1: Data Agent                     │
│  (No dependencies)                      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Task 2: Backend Agent                  │
│  (Depends on Task 1)                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Task 3: Frontend Agent                 │
│  (Depends on Task 1, 2)                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Task 4: Security Agent                 │
│  (Depends on Task 1, 2, 3)              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Task 5: QA Agent                       │
│  (Depends on Task 1, 2, 3)              │
└─────────────────────────────────────────┘
```

### 4. Verify Solution

```typescript
await this.verify();
```

Runs the verification script to ensure code quality.

## Workspace Structure

The orchestrator creates a structured workspace for each build:

```
solutions/users/<userId>/projects/<projectId>/builds/<requestId>/
├── README.md                  # Build overview
├── plan.md                    # Markdown plan
├── plan.json                  # JSON plan
├── artifacts/                 # Agent artifacts
│   ├── schemas/
│   ├── interfaces/
│   ├── endpoints/
│   ├── components/
│   ├── tests/
│   ├── handoffs/
│   └── manifest.json
├── deliverables/              # Agent outputs
│   ├── frontend/
│   │   ├── task-spec.json
│   │   └── result.md
│   ├── backend/
│   │   ├── task-spec.json
│   │   └── result.md
│   ├── data/
│   │   ├── task-spec.json
│   │   └── result.md
│   ├── security/
│   │   ├── task-spec.json
│   │   └── security-findings.json
│   └── qa/
│       ├── task-spec.json
│       └── test-results.md
├── contracts/                 # Inter-agent contracts
└── docs/                     # Documentation
```

## Generated Artifacts

### 1. Plan (plan.md)

Markdown documentation of the build plan:

```markdown
# Plan: User Management System

Request ID: abc12345

## Overall Goal
Build a user management system with authentication

## Modules
### User Interface (frontend)
Build a user interface for the management system
**Acceptance Criteria:**
- UI components are responsive
- All user interactions work

### Backend API (backend)
Build a backend API with authentication
**Acceptance Criteria:**
- All API endpoints return correct responses
- Error handling is implemented

## Tasks
- [ ] abc12345-mod-1 (frontend): User Interface: ...
- [ ] abc12345-mod-2 (backend): Backend API: ...
  - depends on: abc12345-mod-1
```

### 2. ADR (Architecture Decision Record)

```markdown
# ADR-abc12345: User Management System

## Status
Proposed

## Context
Build request: User Management System

Requirements have been parsed into the following modules:
- User Interface (frontend): Build UI
- Backend API (backend): Build API

## Decision
Use a multi-agent approach with the following specialist agents:
- frontend Agent: User Interface
- backend Agent: Backend API
- security Agent: Security Review
- qa Agent: Quality Assurance

## Consequences
- Modular code generation with clear separation
- Artifacts enable seamless handoff
- Security and QA gates ensure quality
```

## Agent Dispatching

### Basic Dispatch (Current)

Creates placeholder files for agent execution:

```typescript
private async dispatchToAgent(task: AgentTask, workspacePath: string): Promise<void> {
  const agentWorkspace = path.join(workspacePath, 'deliverables', task.assignedTo);
  await fs.mkdir(agentWorkspace, { recursive: true });
  
  // Write task specification
  await fs.writeFile(
    path.join(agentWorkspace, 'task-spec.json'),
    JSON.stringify(task, null, 2)
  );
}
```

### Future: Full Agent Integration

When integrated with AgenticSwarm:

```typescript
private async dispatchToAgent(task: AgentTask, workspacePath: string): Promise<void> {
  // Initialize swarm with isolation context
  const swarm = new AgenticSwarm(config, workspacePath, mongoUri, undefined, {
    userId: this.userId,
    projectId: this.projectId,
    buildRequestId: this.requestId
  });
  
  // Execute task with appropriate agent
  const agent = swarm.getAgentForRole(task.assignedTo);
  const result = await agent.executeTask(task);
  
  // Store result
  task.result = result.data;
}
```

## Extending the Orchestrator

### Adding New Requirement Patterns

Edit `requirement-parser.ts`:

```typescript
private mentionsCustomType(text: string): boolean {
  const keywords = ['custom', 'special', 'unique'];
  return keywords.some(k => text.toLowerCase().includes(k));
}

private extractCustomRequirements(requirement: string): string {
  // Extract custom requirements
  return 'Build custom functionality';
}
```

### Adding New Agent Support

1. Update requirement parser to detect new agent needs
2. Add agent initialization in swarm
3. Update dispatcher to route to new agent
4. Create agent workspace structure

### Custom Verification Steps

Override the verify method:

```typescript
class CustomOrchestrator extends EnhancedOrchestrator {
  protected async verify(): Promise<void> {
    await super.verify();
    // Add custom verification
    await this.customVerification();
  }
}
```

## CLI Usage

### Basic Mode

```bash
# Create build request
cat > build-request.json << EOF
{
  "title": "My Feature",
  "description": "Build a REST API with MongoDB"
}
EOF

# Run orchestrator
node tools/orchestrator/src/index.js build-request.json

# Output:
# - knowledge-base/prompts/build-requests/<id>/plan.md
# - solutions/_staging/<id>/
# - docs/architecture/decisions/ADR-<id>.md
```

### Enhanced Mode

```bash
# Run with enhanced orchestrator
node tools/orchestrator/src/index.js build-request.json --enhanced

# Output:
# - All basic mode outputs
# - Agent task execution
# - Artifact generation
# - Security and QA reports
```

### Multi-User Mode

```bash
# Include user and project IDs
cat > build-request.json << EOF
{
  "title": "My Feature",
  "description": "Build a feature",
  "userId": "user-123",
  "projectId": "proj-456"
}
EOF

node tools/orchestrator/src/index.js build-request.json --enhanced

# Output:
# - solutions/users/user-123/projects/proj-456/builds/<id>/
```

## Configuration

### Environment Variables

```bash
# Groq API key for LLM agents
export GROQ_API_KEY=your-api-key

# MongoDB URI for data agent
export MONGODB_URI=mongodb://localhost:27017/mydb

# MCP Server URL (optional)
export MCP_API_URL=http://localhost:3000
```

### Orchestrator Config

```typescript
const config = {
  maxRetries: 3,
  logLevel: 'info',
  groqApiKey: process.env.GROQ_API_KEY,
  modelName: 'llama-3.3-70b-versatile',
};
```

## Error Handling

### Task Failure

When a task fails:

1. Task status set to `TaskStatus.FAILED`
2. Error message stored in `task.error`
3. Orchestrator stops execution
4. Error logged to console

### Circular Dependencies

Detected during topological sort:

```
Error: Circular dependency detected at task abc12345-mod-2
```

### Agent Not Found

```
Error: Unknown agent role: custom_agent
```

## Monitoring

### Log Output

```
[Orchestrator] Starting build request: User Management System
[Orchestrator] Request ID: abc12345
[Orchestrator] Parsing requirements...
[Orchestrator] Workspace created at: /path/to/workspace
[Orchestrator] Executing agent tasks...
[Orchestrator] Executing task: abc12345-mod-1 (frontend)
[Orchestrator] Dispatching to frontend agent
[Orchestrator] Task abc12345-mod-1 completed successfully
...
[Orchestrator] Build request completed successfully
```

### Progress Tracking

Check plan.md for task status:

```markdown
## Tasks
- [x] abc12345-mod-1 (frontend): User Interface
- [ ] abc12345-mod-2 (backend): Backend API
  - depends on: abc12345-mod-1
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Orchestrator Build

on:
  issue_comment:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Create build request
        run: |
          echo '{"title":"${{ github.event.issue.title }}","description":"${{ github.event.comment.body }}"}' > request.json
      - name: Run orchestrator
        run: node tools/orchestrator/src/index.js request.json --enhanced
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: solutions/
```

## Best Practices

1. **Clear Requirements** - Be specific in the description field
2. **Logical Dependencies** - Ensure task dependencies make sense
3. **Test Incrementally** - Start with basic mode, then use enhanced
4. **Monitor Logs** - Watch orchestrator output for issues
5. **Review Plans** - Check generated plan.md before proceeding
6. **Use Isolation** - Always provide userId and projectId in production

## Troubleshooting

### Orchestrator Won't Start

```bash
# Check Node.js version
node --version  # Should be >=22.0.0

# Install dependencies
pnpm install

# Check orchestrator
node tools/orchestrator/src/index.js
```

### Tasks Not Executing

- Check if `--enhanced` flag is used
- Verify GROQ_API_KEY is set
- Check agent initialization in swarm.ts

### Workspace Not Created

- Check file permissions
- Verify solutions/ directory exists
- Check userId/projectId are valid

## See Also

- [Agent Workflow Documentation](../agent-workflow.md)
- [Architecture Decision Records](../architecture/decisions/)
- [Coding Standards](../../knowledge-base/engineering/coding-standards.md)
