# Coding Standards

## TypeScript
- Strict mode enabled
- No `any` types (warn level)
- Explicit return types on public APIs
- Use `zod` for runtime validation

## Naming
- Files: `kebab-case.ts`
- Types/Interfaces: `PascalCase`
- Functions/Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Enums: `PascalCase` with `UPPER_SNAKE_CASE` values

## Error Handling
- Never swallow errors silently
- Use centralized error handler in API
- Log errors with structured context (requestId, userId)
- Never expose stack traces in production

## Testing
- Co-locate tests in `__tests__/` directories
- Use vitest as test runner
- Aim for >80% coverage on business logic
- Integration tests for API routes

## Imports
- Use `.js` extension for local imports (ESM)
- Group: external, internal, relative
