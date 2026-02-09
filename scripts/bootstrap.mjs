#!/usr/bin/env node
/**
 * Bootstrap script — sets up env files and starts dev environment.
 */
import { existsSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function main() {
  console.log('🚀 Bootstrapping Agentic Swarm...\n');

  // Copy .env.example to .env if not present
  const envFile = resolve(ROOT, '.env');
  const envExample = resolve(ROOT, '.env.example');
  if (!existsSync(envFile) && existsSync(envExample)) {
    copyFileSync(envExample, envFile);
    console.log('✅ Created .env from .env.example');
  } else if (existsSync(envFile)) {
    console.log('ℹ️  .env already exists, skipping');
  }

  // Install dependencies
  console.log('\n📦 Installing dependencies...');
  execSync('pnpm install', { cwd: ROOT, stdio: 'inherit' });

  // Build shared packages
  console.log('\n🔨 Building shared packages...');
  execSync('pnpm -r build', { cwd: ROOT, stdio: 'inherit' });

  console.log('\n✅ Bootstrap complete!');
  console.log('Run: pnpm dev  (or docker compose up)');
}

main();
