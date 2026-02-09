# Approved Dependencies

## Runtime
| Package | Version | Purpose |
|---------|---------|---------|
| fastify | ^5.x | HTTP server |
| @fastify/cors | ^10.x | CORS |
| @fastify/helmet | ^13.x | Security headers |
| @fastify/rate-limit | ^10.x | Rate limiting |
| mongoose | ^8.x | MongoDB ODM |
| pino | ^9.x | Structured logging |
| zod | ^3.x | Schema validation |
| react | ^19.x | UI library |
| react-dom | ^19.x | React DOM |
| react-router-dom | ^7.x | Routing |

## Dev
| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.7 | Type system |
| vitest | ^3.x | Test runner |
| eslint | ^9.x | Linter |
| prettier | ^3.x | Formatter |
| tsx | ^4.x | TS execution |
| vite | ^6.x | Bundler |

## Adding Dependencies
1. Check this list first
2. Run `pnpm audit` after adding
3. Pin major versions
4. Update this document
