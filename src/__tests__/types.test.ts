/**
 * Basic tests for type definitions
 */

import { AgentRole, TaskStatus, AgentTask } from '../types/index.js';

describe('Type Definitions', () => {
  describe('AgentRole', () => {
    it('should have all expected roles', () => {
      expect(AgentRole.ARCHITECT).toBe('architect');
      expect(AgentRole.FRONTEND).toBe('frontend');
      expect(AgentRole.BACKEND).toBe('backend');
      expect(AgentRole.QA).toBe('qa');
    });
  });

  describe('TaskStatus', () => {
    it('should have all expected statuses', () => {
      expect(TaskStatus.PENDING).toBe('pending');
      expect(TaskStatus.IN_PROGRESS).toBe('in_progress');
      expect(TaskStatus.COMPLETED).toBe('completed');
      expect(TaskStatus.FAILED).toBe('failed');
      expect(TaskStatus.VALIDATION_REQUIRED).toBe('validation_required');
    });
  });

  describe('AgentTask', () => {
    it('should create a valid task object', () => {
      const task: AgentTask = {
        id: 'test-1',
        description: 'Test task',
        assignedTo: AgentRole.BACKEND,
        status: TaskStatus.PENDING,
      };

      expect(task.id).toBe('test-1');
      expect(task.description).toBe('Test task');
      expect(task.assignedTo).toBe(AgentRole.BACKEND);
      expect(task.status).toBe(TaskStatus.PENDING);
    });

    it('should support optional fields', () => {
      const task: AgentTask = {
        id: 'test-2',
        description: 'Test task with dependencies',
        assignedTo: AgentRole.FRONTEND,
        status: TaskStatus.IN_PROGRESS,
        dependencies: ['test-1'],
        result: 'Task completed successfully',
        retryCount: 0,
      };

      expect(task.dependencies).toEqual(['test-1']);
      expect(task.result).toBe('Task completed successfully');
      expect(task.retryCount).toBe(0);
    });
  });
});
