import { describe, it, expect } from 'vitest';
import { Orchestrator } from '../orchestrator.js';
import { AgentRole } from '@agentic-swarm/shared';

describe('Orchestrator', () => {
  it('generates a plan from a build request', () => {
    const orch = new Orchestrator();
    const plan = orch.generatePlan({ title: 'Test Feature', description: 'desc' }, 'abc123');
    expect(plan.requestId).toBe('abc123');
    expect(plan.tasks.length).toBeGreaterThanOrEqual(3);
    expect(plan.tasks[0].owner).toBe(AgentRole.ARCHITECT);
  });
});
