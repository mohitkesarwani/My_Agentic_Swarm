# ADR-001: Authentication Strategy

## Status
Accepted

## Context
The API needs authentication and authorization. We need to choose between session-based auth, JWT, or OIDC.

## Decision
- Use OIDC/JWT-ready architecture with placeholder middleware
- Prefer OIDC flows with PKCE for public clients (web app)
- Tokens transported via Authorization header (Bearer scheme)
- No tokens stored in localStorage (use httpOnly cookies or in-memory for SPA)
- RBAC-ready hooks on route level

## Consequences
- Auth middleware is a placeholder that can be swapped for a real OIDC provider
- Token storage follows best practices (no localStorage)
- PKCE support required in OIDC provider configuration
