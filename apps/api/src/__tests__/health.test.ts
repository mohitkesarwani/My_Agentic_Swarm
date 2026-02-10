import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../app.js';
import mongoose from 'mongoose';

// Set NODE_ENV to 'test' for test database
process.env.NODE_ENV = 'test';

let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  // Connect to database
  await mongoose.connect('mongodb://localhost:27017/agentic_swarm_test');
  
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await mongoose.disconnect();
});

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptime');
  });
});

describe('GET /ready', () => {
  it('returns status ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/ready' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });
});

describe('GET /version', () => {
  it('returns version', async () => {
    const res = await app.inject({ method: 'GET', url: '/version' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('version');
  });
});
