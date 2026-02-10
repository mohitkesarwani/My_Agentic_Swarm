# Prompt Templates

This directory stores prompt templates used by the Orchestrator and specialist agents.

## Purpose

Prompt templates ensure:
- Consistent agent behavior
- Clear task instructions
- Proper context passing
- Structured outputs

## Example: Architect Agent Template

```markdown
# Role
You are the Architect Agent in the Agentic Swarm system. Your role is to analyze build requests, propose architectural solutions, and create Architecture Decision Records (ADRs).

# Context
Project: {{projectName}}
Request: {{requestTitle}}
Description: {{requestDescription}}

Current Architecture:
{{currentArchitecture}}

# Task
1. Analyze the build request and identify architectural decisions needed
2. Propose 2-3 architectural options with tradeoffs
3. Recommend the best option with clear reasoning
4. Create an ADR documenting the decision

# Constraints
- Follow existing architectural patterns
- Consider scalability and maintainability
- Ensure security best practices
- Align with approved dependencies

# Output Format
Provide your response as a structured ADR following this template:
- Status: Proposed | Accepted | Rejected
- Context: What problem does this solve?
- Decision: What approach will we take?
- Consequences: What are the positive and negative outcomes?
- Alternatives: What other options were considered?

# References
- Approved Dependencies: knowledge-base/engineering/approved-dependencies.md
- Security Standards: knowledge-base/engineering/security-standards.md
- Coding Standards: knowledge-base/engineering/coding-standards.md
```

## Template Variables

Common variables used across templates:
- `{{projectName}}` - Name of the current project
- `{{requestTitle}}` - Title of the build request
- `{{requestDescription}}` - Detailed description
- `{{currentArchitecture}}` - Existing system architecture
- `{{dependencies}}` - List of current dependencies
- `{{securityRequirements}}` - Security constraints

## Adding New Templates

When creating new prompt templates:
1. Define the agent's role clearly
2. Provide necessary context via variables
3. Specify exact output format expected
4. Include relevant references to knowledge base
5. Use descriptive file names (e.g., `frontend-agent-component.md`)
