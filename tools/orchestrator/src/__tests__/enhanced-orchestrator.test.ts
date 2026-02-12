/**
 * Integration tests for Enhanced Orchestrator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedOrchestrator } from '../src/enhanced-orchestrator.js';
import { RequirementParser } from '../src/requirement-parser.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

describe('EnhancedOrchestrator', () => {
  let tempDir: string;
  let requestPath: string;

  beforeEach(async () => {
    // Create temporary directory for tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'orchestrator-test-'));
    requestPath = path.join(tempDir, 'build-request.json');
  });

  afterEach(async () => {
    // Clean up
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('RequirementParser', () => {
    let parser: RequirementParser;

    beforeEach(() => {
      parser = new RequirementParser();
    });

    it('should detect frontend requirements', () => {
      const requirement = 'Build a React dashboard with mobile-first design';
      const parsed = parser.parseRequirement(requirement);

      const frontendModule = parsed.modules.find((m) => m.type === 'frontend');
      expect(frontendModule).toBeDefined();
      expect(frontendModule?.assignedAgent).toBe('frontend');
    });

    it('should detect backend requirements', () => {
      const requirement = 'Create a REST API with authentication';
      const parsed = parser.parseRequirement(requirement);

      const backendModule = parsed.modules.find((m) => m.type === 'backend');
      expect(backendModule).toBeDefined();
      expect(backendModule?.assignedAgent).toBe('backend');
    });

    it('should detect database requirements', () => {
      const requirement = 'Store user data in MongoDB with proper schema';
      const parsed = parser.parseRequirement(requirement);

      const dataModule = parsed.modules.find((m) => m.type === 'database');
      expect(dataModule).toBeDefined();
      expect(dataModule?.assignedAgent).toBe('data');
    });

    it('should always add QA and Security modules', () => {
      const requirement = 'Build a simple API';
      const parsed = parser.parseRequirement(requirement);

      const qaModule = parsed.modules.find((m) => m.type === 'qa');
      const securityModule = parsed.modules.find((m) => m.type === 'security');

      expect(qaModule).toBeDefined();
      expect(securityModule).toBeDefined();
    });

    it('should set correct dependencies', () => {
      const requirement = 'Build a REST API with MongoDB and React frontend';
      const parsed = parser.parseRequirement(requirement);

      const dataModule = parsed.modules.find((m) => m.type === 'database');
      const backendModule = parsed.modules.find((m) => m.type === 'backend');
      const qaModule = parsed.modules.find((m) => m.type === 'qa');

      // Backend should depend on database
      expect(backendModule?.dependencies).toContain(dataModule?.id);

      // QA should depend on all development modules
      expect(qaModule?.dependencies.length).toBeGreaterThan(0);
    });

    it('should extract constraints', () => {
      const requirement = 'Build a secure mobile-first API with high performance';
      const parsed = parser.parseRequirement(requirement);

      expect(parsed.constraints).toBeDefined();
      expect(parsed.constraints?.length).toBeGreaterThan(0);
    });
  });

  describe('EnhancedOrchestrator Integration', () => {
    it('should create proper workspace structure', async () => {
      const orchestrator = new EnhancedOrchestrator();
      const buildRequest = {
        title: 'Test Feature',
        description: 'Build a REST API with React frontend',
      };

      await fs.writeFile(requestPath, JSON.stringify(buildRequest), 'utf-8');

      // Run orchestrator
      await orchestrator.run(requestPath);

      // Check that workspace was created
      const stagingPath = path.resolve(
        import.meta.dirname,
        '..',
        '..',
        '..',
        'solutions',
        '_staging'
      );
      const dirs = await fs.readdir(stagingPath);
      expect(dirs.length).toBeGreaterThan(0);

      // Check workspace structure
      const workspacePath = path.join(stagingPath, dirs[0]);
      const workspaceContents = await fs.readdir(workspacePath);
      
      expect(workspaceContents).toContain('README.md');
      expect(workspaceContents).toContain('deliverables');
      expect(workspaceContents).toContain('artifacts');

      // Clean up
      await fs.rm(workspacePath, { recursive: true });
    });

    it('should generate plan.md and plan.json', async () => {
      const orchestrator = new EnhancedOrchestrator();
      const buildRequest = {
        title: 'User Management',
        description: 'Build user CRUD API with authentication',
      };

      await fs.writeFile(requestPath, JSON.stringify(buildRequest), 'utf-8');

      await orchestrator.run(requestPath);

      // Check that plan files were created
      const knowledgeBasePath = path.resolve(
        import.meta.dirname,
        '..',
        '..',
        '..',
        'knowledge-base',
        'prompts',
        'build-requests'
      );
      
      const dirs = await fs.readdir(knowledgeBasePath);
      const planDir = path.join(knowledgeBasePath, dirs[dirs.length - 1]);
      const planFiles = await fs.readdir(planDir);

      expect(planFiles).toContain('plan.md');
      expect(planFiles).toContain('plan.json');

      // Verify plan content
      const planJson = JSON.parse(
        await fs.readFile(path.join(planDir, 'plan.json'), 'utf-8')
      );
      expect(planJson.title).toBe('User Management');
      expect(planJson.tasks.length).toBeGreaterThan(0);

      // Clean up
      await fs.rm(planDir, { recursive: true });
    });

    it('should create ADR', async () => {
      const orchestrator = new EnhancedOrchestrator();
      const buildRequest = {
        title: 'Dashboard Feature',
        description: 'Build analytics dashboard',
      };

      await fs.writeFile(requestPath, JSON.stringify(buildRequest), 'utf-8');

      await orchestrator.run(requestPath);

      // Check ADR was created
      const adrPath = path.resolve(
        import.meta.dirname,
        '..',
        '..',
        '..',
        'docs',
        'architecture',
        'decisions'
      );
      
      const adrs = await fs.readdir(adrPath);
      const newAdrs = adrs.filter((f) => f.startsWith('ADR-') && f.endsWith('.md'));
      expect(newAdrs.length).toBeGreaterThan(0);

      // Clean up newest ADR
      const newestAdr = newAdrs[newAdrs.length - 1];
      await fs.rm(path.join(adrPath, newestAdr));
    });
  });
});
