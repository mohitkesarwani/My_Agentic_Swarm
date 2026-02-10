# Security Standards

## Principles
1. **Secure by default**: Safe configurations out of the box
2. **Least privilege**: Minimal permissions at every layer
3. **Defense in depth**: Multiple overlapping controls
4. **Fail securely**: Errors must not weaken security posture

## Authentication & Authorization
- Password-based auth with JWT tokens (ADR-002)
- In-memory token storage for SPA (no localStorage)
- RBAC for authorization
- No token storage in localStorage

## Data Protection
- PII redacted in all logs
- Input validation on every boundary
- Output encoding for XSS prevention
- CORS allowlist (never wildcard in production)
- Secure headers via Helmet

## Supply Chain
- Lockfile committed and enforced
- Dependabot enabled
- `pnpm audit` in CI
- Pin tool versions

## Secrets
- Never commit secrets
- Use environment variables
- Rotate immediately if exposed
- Use `.env.example` for documentation only

## Logging & Observability
- Structured JSON logs (pino)
- Request-ID correlation on all requests
- Health and readiness endpoints
- PII fields redacted automatically
