import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../app.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

// Set NODE_ENV to 'test' for test database
process.env.NODE_ENV = 'test';

let app: Awaited<ReturnType<typeof buildApp>>;
let authToken: string;
let testUserId: string;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();

  // Connect to database
  await mongoose.connect('mongodb://localhost:27017/agentic_swarm_test');

  // Clean up any existing data first
  await User.deleteMany({});

  // Create a test user and get auth token for protected endpoints
  const testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'test-hash',
  });
  testUserId = testUser._id.toString();

  // Generate JWT token for the test user
  authToken = app.jwt.sign({
    sub: testUserId,
    email: testUser.email,
  });
});

afterAll(async () => {
  // Clean up all test data
  await User.deleteMany({});
  await app.close();
  await mongoose.disconnect();
});

describe('Users CRUD /v1/users', () => {
  let userId: string;
  let userToken: string;

  it('POST /v1/users creates a user', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/users',
      payload: { name: 'Alice', email: 'alice@example.com' },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.name).toBe('Alice');
    userId = body.data.id;

    // Generate a token for this user for subsequent tests
    userToken = app.jwt.sign({
      sub: userId,
      email: 'alice@example.com',
    });
  });

  it('GET /v1/users lists users', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/users',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.length).toBeGreaterThan(0);
  });

  it('GET /v1/users/:id returns user', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/v1/users/${userId}`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.name).toBe('Alice');
  });

  it('PATCH /v1/users/:id updates user', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/v1/users/${userId}`,
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      payload: { name: 'Alice Updated' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.name).toBe('Alice Updated');
  });

  it('DELETE /v1/users/:id removes user', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/v1/users/${userId}`,
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.statusCode).toBe(204);
  });

  it('GET /v1/users/:id returns 404 for missing', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/v1/users/${userId}`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    expect(res.statusCode).toBe(404);
  });
});
