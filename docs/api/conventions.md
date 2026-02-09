# API Conventions

## Base URL
`/v1/` prefix for all versioned endpoints.

## Response Format
All responses use a standard envelope:

```json
{ "data": { ... }, "meta": { ... } }
```

Errors:
```json
{ "statusCode": 400, "error": "Bad Request", "message": "...", "requestId": "..." }
```

## HTTP Methods
| Method | Usage |
|--------|-------|
| GET | Read resources |
| POST | Create resources |
| PATCH | Partial update |
| DELETE | Remove resources |

## Validation
- All request bodies validated with Zod schemas
- Query parameters validated and coerced
- Path parameters validated

## Headers
- `x-request-id` — Correlation ID (generated if not provided)
- `Authorization` — Bearer token (when auth is enabled)

## Pagination
- `?page=1&limit=20` query parameters
- Default limit: 20, max: 100

## Error Codes
Standard HTTP status codes. 5xx errors never expose internal details.
