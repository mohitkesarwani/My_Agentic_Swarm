# My Agentic Swarm

Enterprise-grade monorepo for an agent-driven build system. An Orchestrator coordinates specialist agents (frontend, backend, infra, security, data, blockchain/DeFi) to process build requests, generate solutions, and maintain platform quality.

## 🚀 Quick Start

**New to the platform?** Get started in under 5 minutes:

1. Read [QUICKSTART.md](./QUICKSTART.md) for rapid setup
2. See [SYSTEM_GUIDE.md](./docs/SYSTEM_GUIDE.md) for comprehensive documentation
3. Check [ONBOARDING.md](./ONBOARDING.md) for detailed step-by-step guide

```bash
# Quick setup
pnpm install
cp .env.example .env
# Edit .env and set GROQ_API_KEY

# Start services
docker run -d -p 27017:27017 mongo:7  # Terminal 1
cd apps/api && pnpm dev              # Terminal 2
cd apps/web && pnpm dev              # Terminal 3

# Open http://localhost:5173 and start building!
```

## ✨ What's New - Enhanced POC System

The platform now includes a **complete proof-of-concept** environment where you can:

- ✅ **Dashboard** - Overview of all projects, builds, and statistics
- ✅ **Register and Login** - Web-based authentication with JWT
- ✅ **Create Projects** - Organize your builds
- ✅ **Submit Requirements** - Natural language build requests
- ✅ **Track Builds** - Real-time agent activity monitoring with polling
- ✅ **View Artifacts** - Browse generated files and code
- ✅ **Preview Builds** - Create preview environments for generated apps
- ✅ **View Details** - Logs, artifacts, and handoff data
- ✅ **Iterate** - Submit incremental feature requests

**New Features:**
- 📊 **Dashboard Screen** - Statistics and recent builds at a glance
- 🔍 **Artifact Viewer** - Browse all generated files by type
- 🚀 **Preview System** - Foundation for deploying generated apps
- 📚 **Comprehensive Documentation** - API docs and feature guides

**Try it now:**
1. Open `http://localhost:5173`
2. Register an account
3. View the dashboard
4. Create a project
5. Submit: "Build me a blog app with user accounts and comments"
6. Watch the agents work!
7. View artifacts and create a preview

## Architecture

```
my-agentic-swarm/
├── apps/
│   ├── api/          # Fastify REST API (Node.js, TypeScript, MongoDB)
│   └── web/          # React mobile-first web app (Vite)
├── packages/
│   ├── shared/       # Shared types, validation schemas, constants
│   └── config/       # ESLint, Prettier, TypeScript configs
├── tools/
│   ├── orchestrator/ # Build-request coordinator + specialist agents
│   └── mcp-server/   # Model Context Protocol server for agent access
├── infrastructure/
│   └── docker/       # Docker Compose (Mongo + API + Web)
├── docs/             # Architecture, API docs, runbooks, ADRs
├── knowledge-base/   # Engineering standards, prompts, product context
├── solutions/        # Generated output (isolated from workspace)
├── scripts/          # Bootstrap, verify, repo-health
└── src/              # Legacy agent code (original swarm implementation)
```

## Quick Start

```bash
# Prerequisites: Node.js 22+, pnpm, Docker

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Start local services (Mongo + API + Web)
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Or run in dev mode (requires local MongoDB)
pnpm dev
```

**📖 New to Agentic Swarm?** See [ONBOARDING.md](./ONBOARDING.md) for a complete step-by-step guide covering:
- Environment setup and prerequisites
- Starting all services (API + Web + MongoDB)
- Registering your first user and obtaining JWT tokens
- Creating projects and submitting build requests
- Troubleshooting common issues

## How the Orchestrator Works

The Orchestrator (`tools/orchestrator`) accepts build requests and coordinates specialist agents. It now supports two modes:

### Basic Mode (Legacy)
1. Parses the request and generates a plan with tasks, owners, and dependencies
2. Proposes architecture options and writes an ADR for the chosen approach
3. Creates solution workspace structure
4. Logs task assignments (agents not invoked)

### Enhanced Mode (New) 🆕
1. **Natural Language Parsing** - Automatically identifies frontend, backend, database, security, and QA requirements
2. **Agent Coordination** - Dispatches tasks to appropriate specialist agents
3. **Dependency Management** - Executes tasks in topological order respecting dependencies
4. **Artifact Handoffs** - Agents share schemas, interfaces, and contracts through structured artifacts
5. **Security & QA Gates** - Code must pass security review and QA validation before promotion
6. **Workspace Isolation** - Each build gets isolated workspace with artifact tracking
7. **Real-Time Tracking** - All agent activities logged and tracked in MongoDB

Run enhanced mode with:
```bash
node tools/orchestrator/src/index.js <build-request.json> --enhanced
```

Or submit via the web UI for automatic orchestration!

See [Orchestrator Guide](./docs/orchestrator-guide.md) and [Agent Workflow](./docs/agent-workflow.md) for details.

### Specialist Agents

**Core**: Frontend, Backend, Data, Security, QA, Infra

**Blockchain/DeFi**: DeFi Product, Smart Contract Engineer, Smart Contract Security, Fuzzing & Invariant Testing, Protocol Risk, Wallet & Key Management, On-chain Off-chain Integration, Oracle & Data Integrity, Compliance & Monitoring

## How the MCP Server Works

The MCP Server (`tools/mcp-server`) provides agent-accessible commands:

| Command | Description |
|---------|-------------|
| `getRepoMap` | Returns the repository directory tree |
| `getStandards` | Reads API conventions and security standards |
| `getKnowledgeBaseIndex` | Lists all knowledge-base documents |
| `writeADR` | Creates a new Architecture Decision Record |
| `createSolutionWorkspace` | Scaffolds a solution workspace |

## Knowledge Base

Located at `knowledge-base/`, it contains:

- **Engineering standards**: Coding standards, security standards, approved dependencies, blockchain standards
- **Prompts**: Build request plans and prompt templates
- **Product context**: Product requirements and references

## Where Solutions Are Generated

Solutions are generated in isolated directories to avoid workspace conflicts:
- **Multi-user mode (POC)**: `solutions/users/<userId>/projects/<projectId>/builds/<buildRequestId>/`
- Legacy CLI mode: `solutions/_staging/<request-id>/`

Solutions are only applied to `apps/` or `packages/` when a build request explicitly says "apply to platform".

## API Endpoints

The platform provides a comprehensive REST API:

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user profile

### Projects
- `GET /api/v1/projects` - List all projects (requires auth)
- `POST /api/v1/projects` - Create new project (requires auth)
- `GET /api/v1/projects/:id` - Get project details (requires auth)
- `DELETE /api/v1/projects/:id` - Delete project (requires auth)

### Builds
- `POST /api/v1/projects/:projectId/build` - Submit build request (requires auth)
- `GET /api/v1/projects/:projectId/builds/:buildId` - Get build details (requires auth)

### Preview & Artifacts (New!)
- `GET /api/v1/projects/:projectId/builds/:buildId/preview` - Get preview status
- `POST /api/v1/projects/:projectId/builds/:buildId/preview` - Create preview environment
- `GET /api/v1/projects/:projectId/builds/:buildId/artifacts` - List generated artifacts
- `DELETE /api/v1/projects/:projectId/builds/:buildId/preview/:previewId` - Stop preview

All endpoints return JSON and follow standard HTTP status codes. See [Complete Feature Documentation](./docs/FEATURES.md) and [Preview API Documentation](./docs/api/preview-api.md) for details.

## Verification Commands

```bash
pnpm install               # Install all workspace dependencies
pnpm build                 # Build all packages
pnpm test                  # Run all tests
pnpm typecheck             # Type-check all packages
pnpm verify                # Run full verification (install, build, typecheck, test)
pnpm repo-health           # Check that all required files exist
```

## Docker Compose

```bash
docker compose -f infrastructure/docker/docker-compose.yml up
```

Starts: MongoDB 7, API server (port 3001), Web app (port 5173).

## CI/CD

- **ci.yml**: Install → Build → Typecheck → Test on all PRs
- **security.yml**: Dependency audit, secret scanning on PRs + weekly schedule
- **dependabot.yml**: Weekly dependency updates

## Security

- Helmet security headers
- CORS allowlist
- Rate limiting
- Zod input validation
- PII redaction in logs
- Request-ID correlation
- Password-based auth with JWT (see ADR-002)
- OWASP API Security Top 10 mapped in `docs/api/security-checklist.md`

## License

MIT
