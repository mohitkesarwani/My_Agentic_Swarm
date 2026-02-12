/**
 * Requirement Parser
 * Parses natural language requirements into structured modules
 */

import { AgentRole } from '@agentic-swarm/shared';

export interface ParsedRequirement {
  modules: RequirementModule[];
  overallGoal: string;
  constraints?: string[];
}

export interface RequirementModule {
  id: string;
  title: string;
  description: string;
  type: 'frontend' | 'backend' | 'database' | 'security' | 'infrastructure' | 'qa';
  assignedAgent: AgentRole;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  acceptanceCriteria: string[];
}

/**
 * Parses natural language requirements into structured modules
 */
export class RequirementParser {
  /**
   * Parse a natural language requirement into modules
   */
  parseRequirement(requirement: string): ParsedRequirement {
    const modules: RequirementModule[] = [];
    let moduleIdCounter = 1;

    // Detect if requirement mentions UI/frontend
    if (this.mentionsUI(requirement)) {
      modules.push({
        id: `mod-${moduleIdCounter++}`,
        title: 'User Interface',
        description: this.extractUIRequirements(requirement),
        type: 'frontend',
        assignedAgent: AgentRole.FRONTEND,
        priority: 'high',
        dependencies: [],
        acceptanceCriteria: this.extractAcceptanceCriteria(requirement, 'frontend'),
      });
    }

    // Detect if requirement mentions API/backend
    if (this.mentionsBackend(requirement)) {
      modules.push({
        id: `mod-${moduleIdCounter++}`,
        title: 'Backend API',
        description: this.extractBackendRequirements(requirement),
        type: 'backend',
        assignedAgent: AgentRole.BACKEND,
        priority: 'high',
        dependencies: [],
        acceptanceCriteria: this.extractAcceptanceCriteria(requirement, 'backend'),
      });
    }

    // Detect if requirement mentions database/data
    if (this.mentionsDatabase(requirement)) {
      const dbModule: RequirementModule = {
        id: `mod-${moduleIdCounter++}`,
        title: 'Data Model',
        description: this.extractDatabaseRequirements(requirement),
        type: 'database',
        assignedAgent: AgentRole.DATA,
        priority: 'high',
        dependencies: [],
        acceptanceCriteria: this.extractAcceptanceCriteria(requirement, 'database'),
      };
      
      // Database should be built before backend
      const backendModule = modules.find((m) => m.type === 'backend');
      if (backendModule) {
        backendModule.dependencies.push(dbModule.id);
      }
      
      modules.push(dbModule);
    }

    // Always add QA
    const qaModule: RequirementModule = {
      id: `mod-${moduleIdCounter++}`,
      title: 'Quality Assurance',
      description: 'Validate and test all generated code',
      type: 'qa',
      assignedAgent: AgentRole.QA,
      priority: 'high',
      dependencies: modules.map((m) => m.id),
      acceptanceCriteria: ['All tests pass', 'Code meets quality standards'],
    };
    modules.push(qaModule);

    // Always add Security
    const securityModule: RequirementModule = {
      id: `mod-${moduleIdCounter++}`,
      title: 'Security Review',
      description: 'Perform security audit on generated code',
      type: 'security',
      assignedAgent: AgentRole.SECURITY,
      priority: 'high',
      dependencies: modules.filter((m) => m.type !== 'qa').map((m) => m.id),
      acceptanceCriteria: ['No critical vulnerabilities', 'Security best practices followed'],
    };
    modules.push(securityModule);

    return {
      modules,
      overallGoal: requirement,
      constraints: this.extractConstraints(requirement),
    };
  }

  private mentionsUI(text: string): boolean {
    const uiKeywords = [
      'ui', 'interface', 'frontend', 'react', 'component', 'page', 'form',
      'button', 'display', 'view', 'screen', 'dashboard', 'mobile', 'web',
    ];
    const lowerText = text.toLowerCase();
    return uiKeywords.some((keyword) => lowerText.includes(keyword));
  }

  private mentionsBackend(text: string): boolean {
    const backendKeywords = [
      'api', 'backend', 'server', 'endpoint', 'rest', 'graphql', 'service',
      'authentication', 'authorization', 'route', 'controller', 'middleware',
    ];
    const lowerText = text.toLowerCase();
    return backendKeywords.some((keyword) => lowerText.includes(keyword));
  }

  private mentionsDatabase(text: string): boolean {
    const dbKeywords = [
      'database', 'db', 'mongodb', 'schema', 'model', 'collection', 'data',
      'store', 'persist', 'query', 'mongoose',
    ];
    const lowerText = text.toLowerCase();
    return dbKeywords.some((keyword) => lowerText.includes(keyword));
  }

  private extractUIRequirements(requirement: string): string {
    // Extract UI-specific portions of the requirement
    const sentences = requirement.split(/[.!?]+/);
    const uiSentences = sentences.filter((s) => this.mentionsUI(s));
    return uiSentences.length > 0
      ? `Build a user interface that: ${uiSentences.join('. ')}`
      : 'Build a user interface for the application';
  }

  private extractBackendRequirements(requirement: string): string {
    // Extract backend-specific portions
    const sentences = requirement.split(/[.!?]+/);
    const backendSentences = sentences.filter((s) => this.mentionsBackend(s));
    return backendSentences.length > 0
      ? `Build a backend API that: ${backendSentences.join('. ')}`
      : 'Build a RESTful API backend';
  }

  private extractDatabaseRequirements(requirement: string): string {
    // Extract database-specific portions
    const sentences = requirement.split(/[.!?]+/);
    const dbSentences = sentences.filter((s) => this.mentionsDatabase(s));
    return dbSentences.length > 0
      ? `Design a database schema that: ${dbSentences.join('. ')}`
      : 'Design appropriate database schemas';
  }

  private extractAcceptanceCriteria(
    requirement: string,
    type: 'frontend' | 'backend' | 'database'
  ): string[] {
    // Extract or infer acceptance criteria
    const criteria: string[] = [];
    
    switch (type) {
      case 'frontend':
        criteria.push('UI components are responsive and mobile-friendly');
        criteria.push('All user interactions work as expected');
        if (requirement.toLowerCase().includes('form')) {
          criteria.push('Form validation works correctly');
        }
        break;
      case 'backend':
        criteria.push('All API endpoints return correct responses');
        criteria.push('Error handling is implemented');
        criteria.push('Authentication and authorization work correctly');
        break;
      case 'database':
        criteria.push('Schema is properly structured and normalized');
        criteria.push('Indexes are created for optimal performance');
        criteria.push('Data validation rules are enforced');
        break;
    }

    return criteria;
  }

  private extractConstraints(requirement: string): string[] {
    const constraints: string[] = [];
    const lowerText = requirement.toLowerCase();

    if (lowerText.includes('mobile')) {
      constraints.push('Must be mobile-friendly');
    }
    if (lowerText.includes('secure') || lowerText.includes('security')) {
      constraints.push('Must follow security best practices');
    }
    if (lowerText.includes('fast') || lowerText.includes('performance')) {
      constraints.push('Must be optimized for performance');
    }

    return constraints;
  }
}
