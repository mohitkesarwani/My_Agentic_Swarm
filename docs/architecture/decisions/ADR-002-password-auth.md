# ADR-002: Password-Based Authentication

## Status
Accepted

## Context
The Agentic Swarm platform needs user authentication to support multi-user multi-project workflows. Users must be able to register, login, and have their work isolated from other users. 

We need a simple, secure authentication mechanism that:
- Works immediately without external dependencies
- Provides adequate security for development and production
- Supports the user/project/build isolation model
- Can be replaced with OAuth/OIDC in the future if needed

## Decision
We will implement password-based authentication with the following characteristics:

### Authentication Flow
1. **Registration**: Users provide name, email, and password
   - Password is hashed using bcryptjs with 10 salt rounds
   - Email must be unique (enforced at database level)
   - User record stored in MongoDB

2. **Login**: Users provide email and password
   - Password verified against stored hash
   - JWT token issued on successful authentication
   - Token contains userId (sub) and email claims

3. **Authorization**: Protected routes verify JWT
   - @fastify/jwt plugin validates token signature
   - Middleware extracts user info from token payload
   - User context attached to request for downstream use

### Technical Implementation
- **Password Hashing**: bcryptjs (battle-tested, pure JS, no native dependencies)
- **JWT**: @fastify/jwt (Fastify-native, integrates with ecosystem)
- **Token Expiry**: 7 days (configurable via JWT_EXPIRY env var)
- **Token Claims**: `sub` (userId), `email`, `iss`, `aud`, `exp`, `iat`

### Security Measures
- Passwords never stored in plain text
- Minimum password length: 8 characters
- Email validation at API and database layers
- Rate limiting on auth endpoints (inherited from global config)
- JWT secret must be changed in production (validated at startup)
- HTTPS enforced in production (via reverse proxy)

## Alternatives Considered

### OAuth 2.0 / OIDC
**Pros**: Industry standard, supports social login, federated identity
**Cons**: Requires external identity provider, more complex setup, overkill for MVP
**Decision**: Deferred to future. Current auth can coexist with OAuth.

### Session-Based Auth
**Pros**: Stateful, can revoke immediately, simpler token structure
**Cons**: Requires session store (Redis), harder to scale horizontally, no mobile support
**Decision**: Rejected. JWT is stateless and works across multiple API instances.

### Magic Links (Email-Only)
**Pros**: No passwords to manage, good UX for some users
**Cons**: Requires email service, slower UX, not suitable for CLI workflows
**Decision**: Rejected for MVP. Could be added as optional flow later.

## Consequences

### Positive
- ✅ Users can register and login immediately
- ✅ Each user's projects and builds are isolated
- ✅ JWT works across distributed API instances (stateless)
- ✅ No external dependencies (works offline for development)
- ✅ Standard Fastify patterns (onRequest hooks, decorators)

### Negative
- ⚠️ Password reset requires email service (not implemented yet)
- ⚠️ Cannot revoke JWT before expiry (mitigated by short expiry time)
- ⚠️ Users must remember passwords (no social login)

### Migration Path
When OAuth is needed:
1. Keep existing password auth as fallback
2. Add OAuth routes alongside /v1/auth
3. Link OAuth identities to existing user records
4. Users can use either method

### Security Audit Items
Before production:
- [ ] Enforce HTTPS (configure reverse proxy)
- [ ] Rotate JWT_SECRET and store securely (Kubernetes secrets, AWS Secrets Manager)
- [ ] Add password strength requirements (uppercase, numbers, symbols)
- [ ] Implement rate limiting specifically for auth endpoints (stricter than global)
- [ ] Add email verification flow
- [ ] Implement password reset flow
- [ ] Add account lockout after N failed attempts
- [ ] Log authentication events for audit trail

## References
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Fastify Authentication](https://fastify.dev/docs/latest/Guides/Getting-Started/#authentication)
