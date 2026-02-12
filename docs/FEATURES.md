# Agentic Swarm Platform - Complete Feature Documentation

## Table of Contents
1. [Core Features](#core-features)
2. [User Interface](#user-interface)
3. [API Capabilities](#api-capabilities)
4. [Agent System](#agent-system)
5. [Preview & Deployment](#preview--deployment)
6. [Security & Compliance](#security--compliance)
7. [Future Enhancements](#future-enhancements)

---

## Core Features

### 1. User Authentication & Management

**Implemented:**
- ✅ User registration with email and password
- ✅ JWT-based authentication
- ✅ Secure password hashing with bcrypt
- ✅ Session management via JWT tokens
- ✅ Protected routes with authentication middleware

**Endpoints:**
- `POST /api/v1/auth/register` - Create new user account
- `POST /api/v1/auth/login` - Authenticate and receive JWT token
- `GET /api/v1/auth/me` - Get current user profile

**UI Screens:**
- Login Screen (`/login`)
- Registration Screen (`/register`)

### 2. Project Management

**Implemented:**
- ✅ Create projects with name and description
- ✅ List all projects for authenticated user
- ✅ View project details with build history
- ✅ Delete projects
- ✅ Build request tracking per project

**Endpoints:**
- `GET /api/v1/projects` - List user's projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:id` - Get project details
- `DELETE /api/v1/projects/:id` - Delete project

**UI Screens:**
- Dashboard Screen (`/dashboard`) - Overview of all projects and builds
- Projects Screen (`/projects`) - Project list and creation
- Project Detail Screen (`/projects/:id`) - Individual project view

### 3. Build Request & Execution

**Implemented:**
- ✅ Natural language build request submission
- ✅ Asynchronous build execution
- ✅ Real-time status tracking (via polling)
- ✅ Agent activity logging
- ✅ Build artifact generation
- ✅ Error handling and reporting

**Build Workflow:**
1. User submits build request with natural language prompt
2. API creates build record in MongoDB
3. Build executor spawns orchestrator process
4. Orchestrator coordinates specialist agents
5. Agents generate code, tests, documentation
6. Build status updates in real-time
7. Artifacts stored in isolated workspace

**Endpoints:**
- `POST /api/v1/projects/:projectId/build` - Submit build request (returns 202 Accepted)
- `GET /api/v1/projects/:projectId/builds/:buildId` - Get build status and details

**Build Statuses:**
- `pending` - Build queued but not started
- `running` - Build in progress
- `completed` - Build finished successfully
- `failed` - Build encountered errors

### 4. Agent Orchestration

**Implemented:**
- ✅ Requirement parsing from natural language
- ✅ Agent task generation and assignment
- ✅ Dependency-aware task execution
- ✅ Agent handoff and artifact sharing
- ✅ Multiple specialist agents (Frontend, Backend, Data, Security, QA)

**Agent Roles:**
- **Architect** - System design and ADR creation
- **Frontend** - UI/UX component generation
- **Backend** - API and business logic
- **Data** - Database schema and migrations
- **Security** - Security review and vulnerability scanning
- **QA** - Test generation and validation
- **Infrastructure** - DevOps and deployment configuration

**Agent Workflow:**
1. Orchestrator parses requirements into modules
2. Generates task plan with dependencies
3. Executes tasks in topological order
4. Agents share artifacts via handoffs
5. Security and QA gates validate output

### 5. Build Monitoring & Logging

**Implemented:**
- ✅ Real-time build status updates
- ✅ Agent activity timeline
- ✅ Build logs with timestamps
- ✅ Error reporting and stack traces
- ✅ Artifact tracking

**UI Features:**
- Build Detail Screen with tabs:
  - **Overview** - Build summary, status, timing
  - **Logs** - Terminal-style log viewer
  - **Agents** - Agent activity timeline
  - **Artifacts** - Generated files and preview

**Data Captured:**
- Build request prompt
- Start and end timestamps
- Agent activities (role, action, status, details)
- Generated artifacts (type, name, path, content)
- Agent handoffs with metadata
- Error messages and stack traces

---

## User Interface

### Dashboard Screen (`/dashboard`)

**Purpose:** Central hub for monitoring all builds and projects

**Features:**
- Statistics cards showing:
  - Total projects
  - Total builds
  - Running builds
  - Completed builds
  - Failed builds
- Recent builds list with:
  - Project name
  - Build prompt preview
  - Status badge
  - Creation timestamp
  - Agent activity count
- Auto-refresh every 5 seconds for running builds
- Quick navigation to projects

### Projects Screen (`/projects`)

**Purpose:** Manage all projects

**Features:**
- Project list with:
  - Project name and description
  - Build count
  - Creation date
- Create new project form
- Navigate to project details
- Back to dashboard button

### Project Detail Screen (`/projects/:projectId`)

**Purpose:** View project details and submit new builds

**Features:**
- Project information
- Build history list
- Submit new build request form
- Real-time updates (polling every 5s)
- Navigate to individual build details

### Build Detail Screen (`/projects/:projectId/builds/:buildId`)

**Purpose:** Monitor build execution and view results

**Features:**
- Build status badge
- Build prompt display
- Tabbed interface:
  - **Overview**: Summary stats, error display
  - **Logs**: Terminal-style log viewer
  - **Agents**: Activity timeline with status
  - **Artifacts**: File list and preview controls
- Preview environment creation
- Real-time updates (polling every 3s)

---

## API Capabilities

### Authentication & Authorization

**Security Features:**
- JWT-based authentication with HS256 signing
- Token includes user ID (sub), email, and expiration
- Password hashing with bcrypt (10 rounds)
- Protected routes require valid JWT
- Token validation on each request

**Environment Configuration:**
```
JWT_SECRET - Secret key for signing tokens
JWT_ISSUER - Token issuer identifier
JWT_AUDIENCE - Token audience identifier
JWT_EXPIRES_IN - Token expiration time (default: 7d)
```

### Rate Limiting

**Configuration:**
- Max requests per window: 100 (configurable)
- Time window: 60000ms (1 minute)
- Applied globally to all endpoints

### CORS Protection

**Settings:**
- Configurable allowed origins
- Credentials support enabled
- Preflight request handling

### Input Validation

**Using Zod schemas:**
- Request body validation
- Type-safe data handling
- Detailed error messages
- Automatic type inference

---

## Preview & Deployment

### Preview Environments

**Current Implementation:**

The preview system provides a foundation for deploying and testing generated applications:

1. **Artifact Scanning**
   - Scans build directory for generated files
   - Categorizes files by type (TypeScript, JavaScript, JSON, etc.)
   - Excludes `node_modules` and hidden directories
   - Limits scanning to 3 directory levels

2. **Status Tracking**
   - `pending` - Preview being created
   - `building` - Preview being built
   - `running` - Preview active and accessible
   - `stopped` - Preview has been stopped
   - `failed` - Preview creation failed

3. **URL Generation**
   - Generates artifact viewing URLs
   - Foundation for embedded preview

**API Endpoints:**
- `GET /api/v1/projects/:projectId/builds/:buildId/preview` - Get preview status
- `POST /api/v1/projects/:projectId/builds/:buildId/preview` - Create preview
- `GET /api/v1/projects/:projectId/builds/:buildId/artifacts` - List artifacts
- `DELETE /api/v1/projects/:projectId/builds/:buildId/preview/:previewId` - Stop preview

**Planned Enhancements:**

1. **Docker Integration**
   - Containerize generated applications
   - Dynamic port allocation and routing
   - Resource limits and monitoring
   - Automatic cleanup after inactivity

2. **Live Preview**
   - Embedded iframe preview in UI
   - Interactive application testing
   - Real-time code updates
   - Data seeding capabilities

3. **Deployment Pipeline**
   - One-click deployment to staging/production
   - CI/CD integration
   - Custom domain mapping
   - SSL/TLS certificate management

---

## Security & Compliance

### Implemented Security Measures

1. **Authentication Security**
   - Secure password hashing (bcrypt)
   - JWT token validation
   - Token expiration handling
   - Protected route middleware

2. **API Security**
   - Helmet security headers
   - CORS protection
   - Rate limiting
   - Request ID tracking
   - Input validation (Zod)

3. **Data Security**
   - User isolation (workspace per user/project/build)
   - Path traversal prevention
   - PII redaction in logs
   - Secure environment variable handling

4. **Build Isolation**
   - Separate workspace per build
   - No cross-user access
   - Artifact sandboxing
   - Error message sanitization

### Compliance Features

**Current:**
- Request correlation IDs for audit trails
- Structured logging for compliance
- User action tracking
- Build artifact versioning

**Planned:**
- OWASP Top 10 security scanning
- Automated vulnerability detection
- Compliance report generation
- Security gate enforcement
- Test coverage requirements

---

## Agent System

### Orchestrator Architecture

**Components:**

1. **Requirement Parser**
   - Parses natural language into structured modules
   - Identifies frontend, backend, database, security needs
   - Prioritizes requirements
   - Generates acceptance criteria

2. **Task Planner**
   - Creates dependency graph
   - Assigns tasks to appropriate agents
   - Determines execution order
   - Handles task failures and retries

3. **Agent Coordinator**
   - Spawns agent processes
   - Manages agent communication
   - Tracks agent progress
   - Coordinates handoffs

4. **Artifact Manager**
   - Stores generated code and documents
   - Tracks artifact versions
   - Facilitates agent handoffs
   - Maintains artifact metadata

### Agent Communication

**Handoff Protocol:**
```typescript
interface AgentHandoff {
  fromAgent: AgentRole;
  toAgent: AgentRole;
  taskId: string;
  artifacts: ArtifactDefinition[];
  message?: string;
  timestamp: string;
}
```

**Artifact Types:**
- `schema` - Database schemas
- `interface` - TypeScript interfaces
- `endpoint` - API endpoint definitions
- `component` - UI components
- `test` - Test files
- `documentation` - README, API docs

### Workspace Structure

```
solutions/
  users/
    {userId}/
      projects/
        {projectId}/
          builds/
            {buildRequestId}/
              build-request.json
              artifacts/
                src/
                tests/
                docs/
              logs/
```

---

## Future Enhancements

### Phase 1: UI/UX Improvements
- [ ] Modern CSS framework (Tailwind CSS)
- [ ] Dark mode support
- [ ] Responsive mobile design
- [ ] Loading skeletons
- [ ] Toast notifications
- [ ] Progress indicators
- [ ] Keyboard shortcuts

### Phase 2: Real-Time Features
- [ ] WebSocket support for live updates
- [ ] Server-sent events for build logs
- [ ] Live agent activity streaming
- [ ] Collaborative editing

### Phase 3: Advanced Build Features
- [ ] Build comparison (diff view)
- [ ] Build templates and presets
- [ ] Incremental builds (feature detection)
- [ ] Build versioning and rollback
- [ ] Build scheduling
- [ ] Parallel build execution

### Phase 4: Deployment & DevOps
- [ ] Docker container deployment
- [ ] Kubernetes integration
- [ ] Cloud provider integration (AWS, GCP, Azure)
- [ ] Custom domain management
- [ ] SSL/TLS automation
- [ ] CDN integration
- [ ] Performance monitoring

### Phase 5: Collaboration & Teams
- [ ] Team workspaces
- [ ] Role-based access control
- [ ] Build sharing and forking
- [ ] Code review workflows
- [ ] Comments and discussions

### Phase 6: Analytics & Insights
- [ ] Build analytics dashboard
- [ ] Agent performance metrics
- [ ] Cost tracking
- [ ] Usage statistics
- [ ] Error analysis
- [ ] Success rate trends

### Phase 7: Knowledge Base
- [ ] Agent learning from past builds
- [ ] Pattern recognition
- [ ] Best practice suggestions
- [ ] Code snippet library
- [ ] Template marketplace

---

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm 9.15.4+
- MongoDB 7+
- Docker (for preview features)

### Quick Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and set GROQ_API_KEY and other variables
   ```

3. **Start services**
   ```bash
   # Terminal 1: MongoDB
   docker run -d -p 27017:27017 mongo:7
   
   # Terminal 2: API
   cd apps/api && pnpm dev
   
   # Terminal 3: Web
   cd apps/web && pnpm dev
   ```

4. **Access the platform**
   ```
   Open http://localhost:5173
   Register an account
   Create a project
   Submit a build request!
   ```

### Example Build Requests

**Simple Blog:**
```
Build a blog application with user authentication, posts with markdown support, 
comments, and categories. Include an admin panel to manage posts.
```

**E-commerce Site:**
```
Create an e-commerce platform with product catalog, shopping cart, 
checkout flow, order management, and payment integration (Stripe).
```

**Task Manager:**
```
Build a task management app with projects, tasks, subtasks, priorities, 
due dates, assignments, and a kanban board view.
```

---

## API Documentation

For complete API documentation, see:
- [Preview API Documentation](./api/preview-api.md)
- [System Guide](./SYSTEM_GUIDE.md)
- [Quick Start Guide](../QUICKSTART.md)

---

## Support & Contributing

For questions, issues, or contributions:
1. Check the documentation in `docs/`
2. Review example build requests in `examples/`
3. See the knowledge base in `knowledge-base/`
4. Open an issue on GitHub

---

## License

MIT License - See LICENSE file for details
