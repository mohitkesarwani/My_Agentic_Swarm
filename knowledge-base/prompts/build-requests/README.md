# Build Request Plans

This directory stores example build request plans that demonstrate the expected format and structure for the Orchestrator.

## Purpose

Build request plans help the Orchestrator understand:
- What to build
- Which agents to involve
- Task dependencies and ordering
- Success criteria

## Example Build Request Template

```json
{
  "requestId": "req-2026-02-10-001",
  "title": "Add User Profile Management",
  "description": "Implement user profile viewing and editing functionality",
  "type": "feature",
  "scope": {
    "frontend": true,
    "backend": true,
    "database": true
  },
  "tasks": [
    {
      "id": "task-1",
      "title": "Design database schema for user profiles",
      "owner": "data",
      "dependencies": [],
      "estimatedEffort": "small"
    },
    {
      "id": "task-2",
      "title": "Create API endpoints for profile CRUD",
      "owner": "backend",
      "dependencies": ["task-1"],
      "estimatedEffort": "medium"
    },
    {
      "id": "task-3",
      "title": "Build profile UI components",
      "owner": "frontend",
      "dependencies": ["task-2"],
      "estimatedEffort": "medium"
    },
    {
      "id": "task-4",
      "title": "Security review of profile endpoints",
      "owner": "security",
      "dependencies": ["task-2"],
      "estimatedEffort": "small"
    }
  ],
  "successCriteria": [
    "Users can view their profile",
    "Users can edit name and email",
    "Changes are persisted to database",
    "Security review passes"
  ]
}
```

## Adding New Examples

When adding new build request examples:
1. Use descriptive file names (e.g., `user-profile-management.json`)
2. Include all required fields
3. Demonstrate realistic task breakdown
4. Show clear dependencies between tasks
