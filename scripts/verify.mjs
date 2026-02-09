#!/usr/bin/env node
/**
 * Verify script — runs all checks as a Definition of Done gate.
 */
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const steps = [
  { name: 'Install', cmd: 'pnpm install --frozen-lockfile' },
  { name: 'Build', cmd: 'pnpm -r build' },
  { name: 'Typecheck', cmd: 'pnpm -r typecheck' },
  { name: 'Test', cmd: 'pnpm -r test' },
];

let failed = false;

for (const step of steps) {
  console.log(`\n▶ ${step.name}...`);
  try {
    execSync(step.cmd, { cwd: ROOT, stdio: 'inherit' });
    console.log(`✅ ${step.name} passed`);
  } catch {
    console.error(`❌ ${step.name} failed`);
    failed = true;
  }
}

if (failed) {
  console.error('\n❌ Verification FAILED');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed');
}
