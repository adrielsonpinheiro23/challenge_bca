import { APIRequestContext, APIResponse } from '@playwright/test';

export type UserPayload = {
  name: string;
  job: string;
};

export type AuthPayload = {
  email?: string;
  password?: string;
};

export class ReqresClient {
  constructor(private readonly request: APIRequestContext) {}

  getUsers(page = 2): Promise<APIResponse> {
    return this.request.get('/api/users', { params: { page } });
  }

  getUser(userId: number): Promise<APIResponse> {
    return this.request.get(`/api/users/${userId}`);
  }

  createUser(payload: UserPayload): Promise<APIResponse> {
    return this.request.post('/api/users', { data: payload });
  }

  updateUser(userId: number, payload: UserPayload): Promise<APIResponse> {
    return this.request.put(`/api/users/${userId}`, { data: payload });
  }

  deleteUser(userId: number): Promise<APIResponse> {
    return this.request.delete(`/api/users/${userId}`);
  }

  register(payload: AuthPayload): Promise<APIResponse> {
    return this.request.post('/api/register', { data: payload });
  }

  login(payload: AuthPayload): Promise<APIResponse> {
    return this.request.post('/api/login', { data: payload });
  }

  getDelayedUsers(delaySeconds = 3): Promise<APIResponse> {
    return this.request.get('/api/users', {
      params: { delay: delaySeconds },
      timeout: 10_000,
    });
  }
}
