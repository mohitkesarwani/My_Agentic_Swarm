# Agentic Swarm POC - Complete System Guide

## Overview

This is a comprehensive guide to the Agentic Swarm proof-of-concept (POC) platform that enables users to:

1. **Register and authenticate** through a web interface
2. **Create and manage projects**
3. **Submit natural language requirements** to build applications
4. **Track real-time build status** with agent activity monitoring
5. **View and interact with** generated solutions
6. **Submit incremental changes** to evolve applications

## System Architecture

### Backend (Fastify API)

**Location**: `apps/api/`

#### Key Components:

1. **Authentication Routes** (`src/routes/v1/auth.ts`)
   - `POST /v1/auth/register` - Create new user account
   - `POST /v1/auth/login` - Authenticate user and get JWT token
   - `GET /v1/auth/me` - Get current user profile

2. **Project Routes** (`src/routes/v1/projects.ts`)
   - `GET /v1/projects` - List all user's projects
   - `POST /v1/projects` - Create new project
   - `GET /v1/projects/:id` - Get project with build history
   - `DELETE /v1/projects/:id` - Delete project

3. **Build Routes** (`src/routes/v1/build.ts`)
   - `POST /v1/projects/:projectId/build` - Submit new build request
   - `GET /v1/projects/:projectId/builds/:buildId` - Get build status and details

4. **Build Executor Service** (`src/services/build-executor.service.ts`)
   - Integrates with orchestrator to execute builds
   - Tracks agent activities in real-time
   - Parses orchestrator output for structured logging
   - Updates MongoDB with build progress

#### Data Models

**User Model** (`src/models/user.model.ts`)
```typescript
interface User {
  name: string
  email: string
  passwordHash: string
  createdAt: Date
}
```

**Project Model** (`src/models/project.model.ts`)
```typescript
interface Project {
  userId: ObjectId
  name: string
  description: string
  buildRequests: BuildRequest[]
  createdAt: Date
  updatedAt: Date
}

interface BuildRequest {
  requestId: string
  prompt: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  stagingPath?: string
  createdAt: Date
  completedAt?: Date
  error?: string
  agentActivities?: AgentActivity[]
  artifacts?: Artifact[]
  handoffs?: AgentHandoff[]
  logs?: string[]
}
```

### Frontend (React Web App)

**Location**: `apps/web/`

#### Screens:

1. **LoginScreen** (`src/screens/LoginScreen.tsx`)
   - Email/password authentication
   - Redirects to projects after login

2. **RegisterScreen** (`src/screens/RegisterScreen.tsx`)
   - User registration with validation
   - Creates account and logs in

3. **ProjectsScreen** (`src/screens/ProjectsScreen.tsx`)
   - Lists all user projects
   - Create new project functionality
   - Navigate to project details

4. **ProjectDetailScreen** (`src/screens/ProjectDetailScreen.tsx`)
   - View all builds for a project
   - Submit new build requests
   - Auto-refreshes every 5 seconds for updates
   - Navigate to build details

5. **BuildDetailScreen** (`src/screens/BuildDetailScreen.tsx`)
   - Three tabs: Overview, Logs, Agent Activities
   - Real-time polling for running builds
   - Shows detailed agent workflow
   - Displays artifacts and errors

#### Context:

**AuthContext** (`src/contexts/AuthContext.tsx`)
- Manages authentication state
- Stores JWT token in localStorage
- Provides login/register/logout functions
- Protects authenticated routes

### Orchestrator

**Location**: `tools/orchestrator/`

The orchestrator coordinates specialist agents to execute build requests:

1. **Requirement Parser** - Analyzes natural language requirements
2. **Enhanced Orchestrator** - Creates agent tasks with dependencies
3. **Agent Coordination** - Executes tasks in topological order
4. **Artifact Generation** - Produces working code and documentation

### Shared Types

**Location**: `packages/shared/`

Provides TypeScript interfaces shared between frontend and backend:
- API request/response types
- Agent roles and task definitions
- Build status enums
- Error handling types

## Workflow Example

### 1. User Registration and Login

```bash
# User navigates to http://localhost:5173/register
# Fills form:
- Name: "John Doe"
- Email: "john@example.com"
- Password: "securepassword123"

# Frontend calls:
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

# Response includes JWT token:
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-02-12T10:00:00.000Z"
    }
  }
}
```

### 2. Create Project

```bash
# User clicks "New Project" on Projects screen
# Fills form:
- Name: "My Blog Platform"
- Description: "A modern blogging platform"

# Frontend calls:
POST /api/v1/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
{
  "name": "My Blog Platform",
  "description": "A modern blogging platform"
}

# Response:
{
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "name": "My Blog Platform",
    "description": "A modern blogging platform",
    "buildRequests": [],
    "createdAt": "2026-02-12T10:05:00.000Z",
    "updatedAt": "2026-02-12T10:05:00.000Z"
  }
}
```

### 3. Submit Build Request

```bash
# User clicks on project, then "New Build Request"
# Enters prompt:
"Build me a blog app with user accounts and comments"

# Frontend calls:
POST /api/v1/projects/507f1f77bcf86cd799439012/build
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
{
  "prompt": "Build me a blog app with user accounts and comments"
}

# Response (immediate):
{
  "data": {
    "buildRequestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "pending",
    "message": "Build request accepted and queued for processing"
  }
}
```

### 4. Build Execution (Backend)

The build executor service:

1. Creates workspace: `solutions/users/{userId}/projects/{projectId}/builds/{buildId}/`
2. Writes `build-request.json` with requirements
3. Spawns orchestrator as child process with `--enhanced` flag
4. Captures stdout/stderr in real-time
5. Parses logs for agent activities
6. Updates MongoDB with status, logs, and agent activities

### 5. Orchestrator Process

```bash
# Orchestrator executes:
1. Parses requirements → identifies frontend, backend, database needs
2. Creates agent tasks with dependencies:
   - backend-api-setup (backend agent)
   - database-schema (data agent)
   - frontend-components (frontend agent)
   - security-review (security agent)
   - qa-validation (qa agent)

3. Executes tasks in order:
   [Orchestrator] Executing task: backend-api-setup (backend)
   [Orchestrator] Dispatching to backend agent
   [Orchestrator] Task backend-api-setup completed successfully
   ...

4. Generates artifacts:
   - API endpoints
   - Database schemas
   - React components
   - Security documentation
   - Test suites
```

### 6. Real-Time Monitoring (Frontend)

The Build Detail screen polls every 3 seconds and shows:

**Overview Tab:**
- Build status badge
- Prompt text
- Statistics (agent activities, artifacts, duration)
- Error messages if failed

**Logs Tab:**
- Terminal-style log viewer
- Real-time orchestrator output
- Color-coded messages

**Agents Tab:**
- Timeline of agent activities
- Each activity shows:
  - Agent role
  - Action performed
  - Status (started/progress/completed/failed)
  - Timestamp
  - Details

### 7. View Generated Solution

Once completed, user can:
- Navigate to build's staging path
- Review generated code
- View artifacts produced by each agent
- See handoff data between agents

### 8. Submit Product Increment

User can submit another build request:
"Add categories and post search functionality"

The system should:
- Read existing solution state
- Identify existing features
- Generate tasks that extend (not duplicate) functionality
- Merge new code with existing implementation

## Key Features Implemented

### ✅ Phase 1: Backend Infrastructure
- Extended BuildRequest model with agent activities, artifacts, handoffs, logs
- Created build execution service integrating with orchestrator
- Real-time log capture and agent activity parsing

### ✅ Phase 2: Authentication & Projects UI
- Login/Register screens with validation
- Authentication context with JWT token management
- Projects dashboard (list, create, select)
- Protected routes for authenticated screens

### ✅ Phase 3: Build Tracking UI
- Requirements collection screen
- Build dashboard with status indicators
- Polling for real-time updates (every 5s for projects, 3s for running builds)
- Build detail view with 3 tabs (Overview, Logs, Agents)
- Visual agent workflow timeline

## Pending Features

### ⏳ WebSocket Support
Replace polling with WebSocket connections for true real-time updates

### ⏳ Live Demo Environment
- Sandbox service to run generated solutions
- Iframe integration for in-browser interaction
- Reset/revert controls
- Secure isolation

### ⏳ Product Increments
- Context-aware orchestrator
- Duplicate detection in requirements
- Merge/enhancement strategy
- Feature preservation during extensions

## Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/agentic_swarm

# API Server
API_PORT=3001
API_HOST=0.0.0.0
NODE_ENV=development

# CORS
CORS_ORIGINS=http://localhost:5173

# JWT
JWT_SECRET=change-me-in-production
JWT_ISSUER=agentic-swarm
JWT_AUDIENCE=agentic-swarm-api
JWT_EXPIRY=7d

# Password Hashing
BCRYPT_SALT_ROUNDS=10

# Orchestrator
GROQ_API_KEY=your_groq_api_key_here
```

## Running the System

### Development Mode

```bash
# Terminal 1: Start MongoDB
docker run -d -p 27017:27017 --name mongo mongo:7

# Terminal 2: Start API Server
cd apps/api
pnpm dev
# Runs on http://localhost:3001

# Terminal 3: Start Web App
cd apps/web
pnpm dev
# Runs on http://localhost:5173
```

### Production Mode

```bash
# Using Docker Compose
docker compose -f infrastructure/docker/docker-compose.yml up

# Or build and run manually
pnpm build
pnpm start
```

## API Endpoints Summary

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Projects
- `GET /api/v1/projects` - List projects (requires auth)
- `POST /api/v1/projects` - Create project (requires auth)
- `GET /api/v1/projects/:id` - Get project details (requires auth)
- `DELETE /api/v1/projects/:id` - Delete project (requires auth)

### Builds
- `POST /api/v1/projects/:projectId/build` - Submit build request (requires auth)
- `GET /api/v1/projects/:projectId/builds/:buildId` - Get build details (requires auth)

## Security

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- CORS whitelist
- Rate limiting (100 req/min per IP)
- Input validation with Zod
- PII redaction in logs
- Authorization checks on all protected routes

## Testing the System

### Manual Testing Flow

1. **Start services** (MongoDB, API, Web)

2. **Register user**
   - Navigate to http://localhost:5173/register
   - Create account

3. **Create project**
   - Click "New Project"
   - Name: "Test Blog"
   - Description: "Testing the system"

4. **Submit build**
   - Click on project
   - Click "New Build Request"
   - Prompt: "Build a simple blog with posts and comments"
   - Submit

5. **Monitor progress**
   - Watch build status change: pending → running → completed
   - Click on build to see details
   - Check Logs tab for orchestrator output
   - Check Agents tab for agent activities

6. **Check results**
   - Review staging path
   - Verify artifacts were created
   - Check for any errors

### Automated Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @agentic-swarm/api test
pnpm --filter @agentic-swarm/web test
```

## Troubleshooting

### Build fails immediately
- Check GROQ_API_KEY is set
- Verify orchestrator is accessible
- Check logs in MongoDB or API console

### UI not showing updates
- Verify polling is working (check Network tab)
- Check API is reachable
- Verify JWT token is valid

### Can't login
- Check MongoDB is running
- Verify API_PORT matches
- Check CORS_ORIGINS includes web app URL

## Architecture Decisions

### Why JWT tokens?
- Stateless authentication
- Easy to implement
- Works well with mobile apps
- Standard industry practice

### Why polling instead of WebSocket initially?
- Simpler to implement
- Works with existing infrastructure
- Easy to upgrade to WebSocket later
- Good enough for POC

### Why separate build executor service?
- Decouples API from orchestrator
- Allows async background processing
- Better error handling
- Enables retries and queuing

### Why MongoDB?
- Flexible schema for evolving data
- Good for nested documents (builds within projects)
- Easy to deploy
- Matches existing codebase

## Next Steps

1. **Add WebSocket support** for true real-time updates
2. **Implement preview service** to run generated solutions
3. **Add duplicate detection** for incremental builds
4. **Improve UI/UX** with better styling
5. **Add end-to-end tests** for complete workflow
6. **Security audit** and vulnerability scanning
7. **Performance optimization** for large builds
8. **Comprehensive documentation** for all agents

## Contributing

When adding new features:

1. **Update shared types** first in `packages/shared/`
2. **Implement backend** in `apps/api/`
3. **Create frontend UI** in `apps/web/`
4. **Add tests** in `__tests__` directories
5. **Update this documentation**
6. **Test end-to-end** before committing

## License

MIT
