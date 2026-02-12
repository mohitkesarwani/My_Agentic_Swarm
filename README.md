# My Agentic Swarm

Enterprise-grade monorepo for an agent-driven build system. An Orchestrator coordinates specialist agents (frontend, backend, infra, security, data, blockchain/DeFi) to process build requests, generate solutions, and maintain platform quality.

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

The Orchestrator (`tools/orchestrator`) accepts build requests and:

1. Parses the request and generates a plan with tasks, owners, and dependencies
2. Proposes architecture options and writes an ADR for the chosen approach
3. Dispatches tasks to specialist agents (frontend, backend, security, etc.)
4. Generates code into:
   - Multi-user mode (API/Web): `solutions/users/<userId>/projects/<projectId>/builds/<buildRequestId>/`
   - Legacy CLI mode: `solutions/_staging/<request-id>/`
5. Runs `scripts/verify.mjs` as a Definition of Done gate

### Specialist Agents

**Core**: Frontend, Backend, Infra, Security, Data, QA

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
- Multi-user mode: `solutions/users/<userId>/projects/<projectId>/builds/<buildRequestId>/`
- Legacy CLI mode: `solutions/_staging/<request-id>/`

Solutions are only applied to `apps/` or `packages/` when a build request explicitly says "apply to platform".

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
