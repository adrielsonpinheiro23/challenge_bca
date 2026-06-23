import { expect, test } from '@playwright/test';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { ReqresClient, UserPayload } from '../clients/ReqresClient';
import { userListSchema } from '../schemas/userList.schema';
import { getRequiredEnv } from '../../utils/env';

const VALID_USER_ID = 2;
const MISSING_USER_ID = 23;
const VALID_AUTH = {
  email: 'eve.holt@reqres.in',
  password: 'pistol',
};

test.describe('ReqRes API', () => {
  test.beforeAll(() => {
    // Missing API key is a configuration error. Do not skip required API coverage.
    getRequiredEnv('REQRES_API_KEY');
  });

  test('GET /api/users?page=2 returns pagination and users', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.getUsers(2);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.page).toBe(2);
    expect(body.per_page).toBeGreaterThan(0);
    expect(body.total).toBeGreaterThan(0);
    expect(body.total_pages).toBeGreaterThan(0);
    expect(body.data).toBeInstanceOf(Array);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/users/{id} returns one user with expected fields', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.getUser(VALID_USER_ID);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data).toMatchObject({
      id: VALID_USER_ID,
      email: expect.stringContaining('@reqres.in'),
      first_name: expect.any(String),
      last_name: expect.any(String),
    });
    expect(body.data.first_name.length).toBeGreaterThan(0);
    expect(body.data.last_name.length).toBeGreaterThan(0);
  });

  const userPayloads: UserPayload[] = [
    { name: 'morpheus', job: 'leader' },
    { name: 'trinity', job: 'zion resident' },
  ];

  for (const payload of userPayloads) {
    test(`POST /api/users creates ${payload.name}`, async ({ request }) => {
      const api = new ReqresClient(request);
      const response = await api.createUser(payload);

      expect(response.status()).toBe(201);

      const body = await response.json();
      expect(body).toMatchObject(payload);
      expect(body.id).toEqual(expect.any(String));
      expect(body.createdAt).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/));
    });
  }

  test('PUT /api/users/{id} updates user data', async ({ request }) => {
    const api = new ReqresClient(request);
    const payload = { name: 'morpheus', job: 'zion manager' };
    const response = await api.updateUser(VALID_USER_ID, payload);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject(payload);
    expect(body.updatedAt).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/));
  });

  test('DELETE /api/users/{id} returns 204', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.deleteUser(VALID_USER_ID);

    expect(response.status()).toBe(204);
    expect(await response.text()).toBe('');
  });

  test('POST /api/register returns token for valid payload', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.register(VALID_AUTH);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toEqual(expect.any(Number));
    expect(body.token).toEqual(expect.any(String));
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('POST /api/register returns error when password is missing', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.register({ email: VALID_AUTH.email });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Missing password');
  });

  test('POST /api/login returns token for valid credentials', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.login(VALID_AUTH);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('POST /api/login returns error for missing credentials', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.login({});

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toEqual(expect.any(String));
    expect(body.error.length).toBeGreaterThan(0);
  });

  test('GET /api/users/{id} returns 404 for missing user', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.getUser(MISSING_USER_ID);

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({});
  });

  test('GET /api/users?delay=3 returns valid data within timeout', async ({ request }) => {
    const api = new ReqresClient(request);
    // Keep timeout generous enough for a public demo API but still bounded.
    const startedAt = Date.now();
    const response = await api.getDelayedUsers(3);
    const durationMs = Date.now() - startedAt;

    expect(response.status()).toBe(200);
    expect(durationMs).toBeLessThan(10_000);

    const body = await response.json();
    expect(body.data).toBeInstanceOf(Array);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/users?page=2 matches response schema', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.getUsers(2);
    const body = await response.json();

    // Schema validation covers the response contract beyond status-code checks.
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(userListSchema);

    expect(response.status()).toBe(200);
    expect(validate(body), JSON.stringify(validate.errors, null, 2)).toBe(true);
  });
});
