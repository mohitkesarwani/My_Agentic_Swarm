#!/usr/bin/env node
/**
 * Repo health check — verifies required pieces exist.
 */
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const required = [
  'pnpm-workspace.yaml',
  'turbo.json',
  'package.json',
  '.editorconfig',
  '.gitattributes',
  '.nvmrc',
  '.env.example',
  '.gitignore',
  'apps/api/package.json',
  'apps/api/src/app.ts',
  'apps/web/package.json',
  'apps/web/src/App.tsx',
  'packages/shared/package.json',
  'packages/config/package.json',
  'tools/orchestrator/package.json',
  'tools/orchestrator/README.md',
  'tools/mcp-server/package.json',
  'tools/mcp-server/README.md',
  'infrastructure/docker/docker-compose.yml',
  'docs/architecture/overview.md',
  'docs/architecture/threat-model.md',
  'docs/api/conventions.md',
  'docs/api/security-checklist.md',
  'docs/runbooks/local-dev.md',
  'docs/runbooks/ci-cd.md',
  'knowledge-base/README.md',
  'knowledge-base/engineering/approved-dependencies.md',
  'knowledge-base/engineering/coding-standards.md',
  'knowledge-base/engineering/security-standards.md',
  'knowledge-base/engineering/blockchain-standards.md',
  'solutions/README.md',
  'solutions/_staging/.gitkeep',
  'scripts/bootstrap.mjs',
  'scripts/verify.mjs',
  'scripts/repo-health.mjs',
  '.github/workflows/ci.yml',
  '.github/workflows/security.yml',
  '.github/dependabot.yml',
];

let missing = 0;

console.log('🏥 Repo Health Check\n');

for (const file of required) {
  const full = resolve(ROOT, file);
  if (existsSync(full)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} MISSING`);
    missing++;
  }
}

console.log(`\n${missing === 0 ? '✅ All required files present' : `❌ ${missing} file(s) missing`}`);
process.exit(missing > 0 ? 1 : 0);
