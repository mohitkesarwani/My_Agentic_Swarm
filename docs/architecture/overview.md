# Architecture Overview

## Audit Report

The original repository was a single-package TypeScript project using the IBM Bee Agent Framework for multi-agent development automation. It has been upgraded to an enterprise-grade monorepo.

### Gaps Identified & Fixed

| Gap | Resolution |
|-----|-----------|
| No monorepo tooling | Added pnpm workspaces + Turborepo |
| No CI/CD | Added GitHub Actions workflows |
| No Docker setup | Added docker-compose with Mongo + API + Web |
| No API skeleton | Added Fastify app with security baseline |
| No web app | Added React mobile-first app |
| No shared packages | Added @agentic-swarm/shared and @agentic-swarm/config |
| No MCP Server | Created tools/mcp-server with 5 commands |
| No orchestrator platform | Created tools/orchestrator with plan/dispatch/verify |
| Committed API key in .env | Removed; added rotation guidance |
| No security scanning | Added dependabot, security workflow |
| No docs/KB structure | Created full doc tree |
| No linting/formatting configs | Added shared ESLint + Prettier + TS configs |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Monorepo Root                     │
│  pnpm workspaces · Turborepo · GitHub Actions       │
├──────────┬──────────┬──────────┬────────────────────┤
│ apps/    │packages/ │ tools/   │ infrastructure/    │
│ ├─ api   │ ├─shared │ ├─orch  │ └─ docker/         │
│ └─ web   │ └─config │ └─ mcp  │    └─compose.yml   │
├──────────┴──────────┴──────────┴────────────────────┤
│ docs/ · knowledge-base/ · solutions/ · scripts/     │
└─────────────────────────────────────────────────────┘
```

## Stack

- **Runtime**: Node.js 22 LTS
- **Language**: TypeScript 5.x
- **API**: Fastify 5 with Helmet, CORS, rate-limiting, Zod validation, Pino logging
- **Database**: MongoDB 7 via Mongoose
- **Frontend**: React 19, React Router, Vite
- **Orchestrator**: Custom agent coordination engine
- **MCP Server**: Standards and knowledge-base access layer
