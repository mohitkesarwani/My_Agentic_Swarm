# Local Development Runbook

## Prerequisites

- Node.js 22 (see `.nvmrc`)
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- Docker & Docker Compose

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd My_Agentic_Swarm
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values

# 3. Start all services
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 4. Run in dev mode
pnpm dev
```

## Individual Services

```bash
# API only
pnpm --filter @agentic-swarm/api dev

# Web only
pnpm --filter @agentic-swarm/web dev
```

## Testing

```bash
pnpm test          # All tests
pnpm typecheck     # Type checking
pnpm lint          # Linting
```

## Troubleshooting

- **Port conflict**: Check if 3001, 5173, or 27017 are in use
- **Mongo not connecting**: Ensure Docker is running and mongo container is healthy
- **pnpm install fails**: Run `corepack enable` first
