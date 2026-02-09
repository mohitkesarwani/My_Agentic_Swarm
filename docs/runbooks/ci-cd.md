# CI/CD Runbook

## Workflows

### ci.yml
Runs on all PRs and pushes to main:
1. Install dependencies (pnpm)
2. Lint (ESLint)
3. Type check (tsc --noEmit)
4. Unit tests (vitest)
5. Build all packages

### security.yml
Runs on PRs, pushes to main, and weekly schedule:
1. Dependency audit (pnpm audit)
2. Secret scanning (trufflehog)
3. CodeQL analysis (if available)

### dependabot.yml
- Weekly dependency updates for npm ecosystem
- Targets root, apps, packages, and tools directories

## Adding New Packages

1. Create package in the appropriate directory
2. Add to `pnpm-workspace.yaml` if using a new glob
3. Ensure `build`, `test`, `typecheck`, and `lint` scripts exist
4. CI will automatically pick up the new package via Turborepo
