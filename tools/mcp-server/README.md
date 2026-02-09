# MCP Server

Model Context Protocol server that provides agent-accessible commands for retrieving repo context, standards, and knowledge-base data.

## Commands

| Command | Description |
|---------|-------------|
| `getRepoMap` | Returns the directory tree of the repository |
| `getStandards` | Reads conventions, security checklist, and engineering standards |
| `getKnowledgeBaseIndex` | Lists all documents in the knowledge base |
| `writeADR` | Creates a new ADR file from template |
| `createSolutionWorkspace` | Scaffolds a solution workspace in `solutions/_staging/` |
