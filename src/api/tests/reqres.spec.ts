import { expect, test } from '@playwright/test';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { ReqresClient } from '../clients/ReqresClient';
import {
  reqresUsers,
  updatedUserPayload,
  userPayloads,
  validAuthPayload,
} from '../fixtures/reqresData';
import { userListSchema } from '../schemas/userList.schema';
import { getRequiredEnv } from '../../utils/env';

test.describe('ReqRes API', () => {
  test.beforeAll(() => {
    // Missing API key is a configuration error. Do not skip required API coverage.
    getRequiredEnv('REQRES_API_KEY');
  });

  test('GET /api/users?page=2 returns pagination and users', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.getUsers(2);

    expect(response.status(), 'user list request should succeed').toBe(200);

    const body = await response.json();
    expect(body.page, 'response should return requested page').toBe(2);
    expect(body.per_page, 'pagination should expose page size').toBeGreaterThan(0);
    expect(body.total, 'pagination should expose total records').toBeGreaterThan(0);
    expect(body.total_pages, 'pagination should expose total pages').toBeGreaterThan(0);
    expect(body.data, 'user list should be an array').toBeInstanceOf(Array);
    expect(body.data.length, 'page 2 should include users').toBeGreaterThan(0);
  });

  test('GET /api/users/{id} returns one user with expected fields', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.getUser(reqresUsers.existingUserId);

    expect(response.status(), 'single user request should succeed').toBe(200);

    const body = await response.json();
    expect(body.data).toMatchObject({
      id: reqresUsers.existingUserId,
      email: expect.stringContaining('@reqres.in'),
      first_name: expect.any(String),
      last_name: expect.any(String),
    });
    expect(body.data.first_name.length).toBeGreaterThan(0);
    expect(body.data.last_name.length).toBeGreaterThan(0);
  });

  for (const payload of userPayloads) {
    test(`POST /api/users creates ${payload.name}`, async ({ request }) => {
      const api = new ReqresClient(request);
      const response = await api.createUser(payload);

      expect(response.status(), 'create user should return Created').toBe(201);

      const body = await response.json();
      expect(body).toMatchObject(payload);
      expect(body.id).toEqual(expect.any(String));
      expect(body.createdAt).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/));
    });
  }

  test('PUT /api/users/{id} updates user data', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.updateUser(reqresUsers.existingUserId, updatedUserPayload);

    expect(response.status(), 'update user should succeed').toBe(200);

    const body = await response.json();
    expect(body).toMatchObject(updatedUserPayload);
    expect(body.updatedAt).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/));
  });

  test('DELETE /api/users/{id} returns 204', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.deleteUser(reqresUsers.existingUserId);

    expect(response.status(), 'delete user should return No Content').toBe(204);
    expect(await response.text(), 'delete response body should be empty').toBe('');
  });

  test('POST /api/register returns token for valid payload', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.register(validAuthPayload);

    expect(response.status(), 'valid register payload should succeed').toBe(200);

    const body = await response.json();
    expect(body.id).toEqual(expect.any(Number));
    expect(body.token).toEqual(expect.any(String));
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('POST /api/register returns error when password is missing', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.register({ email: validAuthPayload.email });

    expect(response.status(), 'missing password should be rejected').toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Missing password');
  });

  test('POST /api/login returns token for valid credentials', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.login(validAuthPayload);

    expect(response.status(), 'valid login payload should succeed').toBe(200);

    const body = await response.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('POST /api/login returns error for missing credentials', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.login({});

    expect(response.status(), 'missing login credentials should be rejected').toBe(400);

    const body = await response.json();
    expect(body.error).toEqual(expect.any(String));
    expect(body.error.length).toBeGreaterThan(0);
  });

  test('GET /api/users/{id} returns 404 for missing user', async ({ request }) => {
    const api = new ReqresClient(request);
    const response = await api.getUser(reqresUsers.missingUserId);

    expect(response.status(), 'unknown user should not exist').toBe(404);
    expect(await response.json(), 'missing user response should be empty JSON').toEqual({});
  });

  test('GET /api/users?delay=3 returns valid data within timeout', async ({ request }) => {
    const api = new ReqresClient(request);
    // Keep timeout generous enough for a public demo API but still bounded.
    const startedAt = Date.now();
    const response = await api.getDelayedUsers(3);
    const durationMs = Date.now() - startedAt;

    expect(response.status(), 'delayed users request should succeed').toBe(200);
    expect(durationMs, 'delayed response should stay inside client timeout budget').toBeLessThan(
      10_000,
    );

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

    expect(response.status(), 'schema validation target request should succeed').toBe(200);
    expect(validate(body), JSON.stringify(validate.errors, null, 2)).toBe(true);
  });
});
