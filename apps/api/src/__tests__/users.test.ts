import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../app.js';

let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('Users CRUD /v1/users', () => {
  let userId: string;

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
  });

  it('GET /v1/users lists users', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/users' });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.length).toBeGreaterThan(0);
  });

  it('GET /v1/users/:id returns user', async () => {
    const res = await app.inject({ method: 'GET', url: `/v1/users/${userId}` });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.name).toBe('Alice');
  });

  it('PATCH /v1/users/:id updates user', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/v1/users/${userId}`,
      payload: { name: 'Alice Updated' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.name).toBe('Alice Updated');
  });

  it('DELETE /v1/users/:id removes user', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/v1/users/${userId}` });
    expect(res.statusCode).toBe(204);
  });

  it('GET /v1/users/:id returns 404 for missing', async () => {
    const res = await app.inject({ method: 'GET', url: `/v1/users/${userId}` });
    expect(res.statusCode).toBe(404);
  });
});
