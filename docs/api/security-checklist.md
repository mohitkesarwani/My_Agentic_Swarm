# API Security Checklist

## Implemented Controls

- [x] Security headers via Helmet (CSP, HSTS, X-Frame-Options, etc.)
- [x] CORS allowlist (not wildcard)
- [x] Rate limiting on all endpoints
- [x] Request body validation (Zod)
- [x] Centralized error handler (no stack traces in production)
- [x] Structured logging with PII redaction
- [x] Request-ID correlation
- [x] Safe MongoDB connection defaults
- [x] JWT authentication middleware (@fastify/jwt, see ADR-002)

## Planned Controls

- [ ] RBAC authorization middleware
- [ ] API key rotation procedure
- [ ] Input sanitization for NoSQL injection

## OWASP API Security Top 10 Mapping

| # | Risk | Mitigation |
|---|------|-----------|
| API1 | Broken Object Level Authorization | RBAC hooks (placeholder) |
| API2 | Broken Authentication | JWT password auth implemented (ADR-002) |
| API3 | Broken Object Property Level Authorization | Zod schema validation |
| API4 | Unrestricted Resource Consumption | Rate limiting, pagination limits |
| API5 | Broken Function Level Authorization | RBAC-ready route guards |
| API6 | Unrestricted Access to Sensitive Business Flows | Rate limiting, future CAPTCHA |
| API7 | Server Side Request Forgery | No proxy endpoints; validate URLs |
| API8 | Security Misconfiguration | Helmet defaults, env validation |
| API9 | Improper Inventory Management | Versioned API (/v1/), OpenAPI planned |
| API10 | Unsafe Consumption of APIs | Input validation on all external data |
