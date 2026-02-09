# Orchestrator

The Orchestrator coordinates specialist agents for build requests.

## Capabilities

- Accept a build request file path
- Generate a plan (tasks, owners, dependencies)
- Propose 2–3 architecture options, select one, write ADR(s)
- Dispatch tasks to specialist agents and collect outputs
- Generate code into `solutions/_staging/<request-id>/`
- Optionally apply to `apps/` and `packages/` when instructed
- Run `scripts/verify.mjs` as a Definition of Done gate

## Specialist Agents

### Core
| Agent | Responsibility |
|-------|---------------|
| Frontend | React, mobile-first |
| Backend | Node API, TS, Mongo |
| Infra | Docker, CI/CD |
| Security | OWASP API, auth model, logging, scanning |
| Data | Mongo schema, indexes, migrations |

### Blockchain / DeFi
| Agent | Responsibility |
|-------|---------------|
| DeFi Product | Protocol requirements, user journeys |
| Smart Contract Engineer | Contract architecture, upgrades, access control |
| Smart Contract Security | Vuln classes, secure patterns, review checklist |
| Fuzzing & Invariant Testing | Echidna-style invariants, property tests |
| Protocol Risk | Economic attacks, oracle manipulation, governance |
| Wallet & Key Management | Wallet UX, session safety, signing |
| On-chain Off-chain Integration | Indexing, reorg handling, idempotency |
| Oracle & Data Integrity | Oracle sources, fallbacks, manipulation defense |
| Compliance & Monitoring | Pause controls, incident runbooks, signals |
