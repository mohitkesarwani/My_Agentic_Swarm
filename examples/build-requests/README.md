# Build Request Examples

This directory contains example build requests demonstrating the capabilities of the Enhanced Orchestrator.

## Available Examples

### 1. User Management System
**File**: `user-management-system.json`

A comprehensive example that triggers all agent types:
- **Data Agent**: Creates User schema with email, name, role
- **Backend Agent**: Builds REST API with CRUD operations and authentication
- **Frontend Agent**: Creates React dashboard for user management
- **Security Agent**: Reviews authentication and validation
- **QA Agent**: Tests all components

**Run with**:
```bash
# First build the project
pnpm build

# Then run the orchestrator
node tools/orchestrator/dist/index.js examples/build-requests/user-management-system.json --enhanced
```

**Expected Output**:
- MongoDB User schema with validation
- Express REST API with authentication
- React dashboard components
- Security audit report
- Automated test suite

---

### 2. Simple Blog API
**File**: `blog-api.json`

A backend-focused example:
- **Data Agent**: Creates Post and Comment schemas
- **Backend Agent**: Builds blog REST API
- **Security Agent**: Reviews API security
- **QA Agent**: Tests endpoints

**Run with**:
```bash
# First build the project
pnpm build

# Then run the orchestrator
node tools/orchestrator/dist/index.js examples/build-requests/blog-api.json --enhanced
```

**Expected Output**:
- MongoDB schemas for posts and comments
- REST API for blog operations
- Security findings report
- API tests

---

### 3. E-commerce Product Catalog
**File**: `product-catalog.json`

A full-stack example with frontend and backend:
- **Data Agent**: Creates Product schema
- **Backend Agent**: Builds product API with search/filter
- **Frontend Agent**: Creates product catalog UI
- **Security Agent**: Reviews both frontend and backend
- **QA Agent**: Tests integration

**Run with**:
```bash
# First build the project
pnpm build

# Then run the orchestrator
node tools/orchestrator/dist/index.js examples/build-requests/product-catalog.json --enhanced
```

**Expected Output**:
- Product schema with indexes
- Product API with search/filter
- React product catalog components
- Security audit
- Integration tests

---

## Creating Your Own Build Request

### Template

```json
{
  "title": "Your Feature Title",
  "description": "Detailed description including what to build, technologies to use, and key requirements",
  "applyToPlatform": false,
  "userId": "optional-user-id",
  "projectId": "optional-project-id"
}
```

### Tips for Good Descriptions

1. **Be Specific**: Mention specific technologies (React, MongoDB, REST API)
2. **Include Requirements**: Authentication, validation, testing, etc.
3. **Describe Data**: What data needs to be stored and how
4. **Mention UI**: If you need a user interface, describe it
5. **State Constraints**: Security, performance, mobile-first, etc.

### Keywords that Trigger Agents

| Agent | Keywords |
|-------|----------|
| **Data** | database, db, mongodb, schema, model, collection, data, store, persist |
| **Backend** | api, backend, server, endpoint, rest, authentication, route |
| **Frontend** | ui, interface, react, component, page, form, dashboard, mobile, web |
| **Security** | Always included automatically |
| **QA** | Always included automatically |

### Example Descriptions

**Good ✅**:
```
"Build a task management API with MongoDB for storing tasks with title, description, 
due date, and status. Create REST endpoints for CRUD operations with authentication. 
Include a React dashboard for managing tasks with mobile-first design."
```

**Too Vague ❌**:
```
"Build a task app"
```

**Better ✅**:
```
"Create a task management application with backend API and frontend UI"
```

---

## Understanding the Output

After running a build request, you'll find:

### 1. Plan Files
```
knowledge-base/prompts/build-requests/<request-id>/
├── plan.md          # Human-readable plan
└── plan.json        # Machine-readable plan
```

### 2. Solution Workspace
```
solutions/_staging/<request-id>/
├── README.md
├── deliverables/
│   ├── frontend/    # Frontend agent output
│   ├── backend/     # Backend agent output
│   ├── data/        # Data agent output
│   ├── security/    # Security agent reports
│   └── qa/          # QA agent reports
├── artifacts/       # Shared artifacts
│   ├── schemas/
│   ├── interfaces/
│   ├── endpoints/
│   └── manifest.json
└── contracts/       # Inter-agent contracts
```

### 3. ADR (Architecture Decision Record)
```
docs/architecture/decisions/ADR-<request-id>.md
```

---

## Advanced Usage

### Multi-User Mode

Include `userId` and `projectId` to isolate builds:

```json
{
  "title": "My Feature",
  "description": "...",
  "userId": "user-123",
  "projectId": "proj-456"
}
```

Output goes to: `solutions/users/user-123/projects/proj-456/builds/<request-id>/`

### Apply to Platform

Set `applyToPlatform: true` to have the orchestrator apply generated code to the main platform codebase (use with caution):

```json
{
  "title": "New Feature",
  "description": "...",
  "applyToPlatform": true
}
```

---

## Troubleshooting

### No Agents Triggered

**Problem**: Only Security and QA agents run

**Solution**: Make your description more specific. Include keywords like "API", "database", "React", "UI", etc.

### Workspace Not Created

**Problem**: No output in solutions/

**Solution**: Check that you're using the `--enhanced` flag and built files:
```bash
pnpm build
node tools/orchestrator/dist/index.js request.json --enhanced
```

### Task Dependencies Failed

**Problem**: Tasks execute in wrong order

**Solution**: The orchestrator automatically resolves dependencies. Check the plan.json to see the dependency graph.

---

## Next Steps

1. Try running one of the example build requests
2. Check the generated workspace and artifacts
3. Review the agent outputs in deliverables/
4. Create your own custom build request
5. Experiment with different requirement combinations

For more information, see:
- [Agent Workflow Documentation](../../docs/agent-workflow.md)
- [Orchestrator Guide](../../docs/orchestrator-guide.md)
