# Threat Model

## Assets

1. **API Server** — Handles user requests, accesses MongoDB
2. **MongoDB** — Stores application data
3. **Web Frontend** — Single-page React app
4. **Agent System** — Orchestrator + specialist agents
5. **Secrets** — API keys, JWT secrets, DB credentials

## Threat Categories (STRIDE)

| Threat | Category | Mitigation |
|--------|----------|-----------|
| Spoofed API requests | Spoofing | JWT/OIDC auth (placeholder), request validation |
| Tampered request bodies | Tampering | Zod schema validation on all inputs |
| Unauthorized data access | Repudiation | Structured logging with request-id correlation |
| Sensitive data exposure | Info Disclosure | PII redaction in logs, secure headers (Helmet) |
| API abuse / DDoS | Denial of Service | Rate limiting, request size limits |
| Privilege escalation | Elevation of Privilege | RBAC-ready hooks, least-privilege defaults |

## Supply Chain

- All dependencies locked via pnpm lockfile
- Dependabot enabled for automated updates
- CI security workflow runs dependency audit

## Secret Management

- `.env` files excluded from git via `.gitignore`
- `.env.example` contains only placeholder values
- **Rotation guidance**: If a secret is ever committed, immediately rotate it at the provider and update all environments

## Network

- CORS allowlist enforced (not wildcard)
- Helmet sets security headers (CSP, HSTS, X-Frame-Options, etc.)
- API binds to configurable host/port
