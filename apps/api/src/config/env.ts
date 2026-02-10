import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  API_HOST: z.string().default('0.0.0.0'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/agentic_swarm'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().default('change-me-in-production'),
  JWT_ISSUER: z.string().default('agentic-swarm'),
  JWT_AUDIENCE: z.string().default('agentic-swarm-api'),
  JWT_EXPIRY: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  GROQ_API_KEY: z.string().optional(),
  ARCHITECT_MODEL: z.string().default('llama-3.3-70b-versatile'),
});

const parsed = envSchema.parse(process.env);

// Use test database when NODE_ENV is 'test'
if (parsed.NODE_ENV === 'test' && !process.env.MONGODB_URI) {
  parsed.MONGODB_URI = 'mongodb://localhost:27017/agentic_swarm_test';
}

export const env = parsed;
export type Env = z.infer<typeof envSchema>;
