# Solutions

This directory contains generated output from the orchestrator. It is isolated from the core workspace to avoid conflicts.

## Structure

### Multi-User Mode (API/Web Application)
```
solutions/
├── README.md
└── users/
    └── <userId>/
        └── projects/
            └── <projectId>/
                └── builds/
                    └── <buildRequestId>/
                        ├── frontend/        # React/UI components
                        ├── backend/         # API/server code
                        ├── qa/             # Tests and validation
                        ├── plan.md         # Build plan from architect
                        └── README.md       # Build summary
```

### Legacy CLI Mode (Backward Compatible)
```
solutions/
├── README.md
├── _staging/           # Active solution workspaces (CLI)
│   └── <request-id>/
│       └── README.md
└── deliverables/       # Output organized by agent type (CLI)
    ├── frontend/
    ├── backend/
    └── qa/
```

## Rules
- Multi-user mode: Solutions are scoped by userId → projectId → buildRequestId
- CLI mode: Solutions use flat deliverables/ structure (legacy fallback)
- Each build gets a unique directory to prevent overwrites
- Solutions do NOT participate in pnpm workspace installs
- Apply to platform only when explicitly instructed

## Isolation Benefits
- ✅ Multiple users can build concurrently without conflicts
- ✅ Multiple projects per user are isolated
- ✅ Build history is preserved (each build has its own directory)
- ✅ Easy to track "who built what when"
- ✅ Backward compatible with CLI mode when isolation context is not provided
