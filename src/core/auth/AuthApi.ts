// src/core/auth/AuthApi.ts
import { APIRequestContext } from '@playwright/test';
import { LoginRequest, LoginResponse } from './types';

export class AuthApi {
  private static readonly LOGIN_PATH = 'auth/login';

  constructor(private readonly api: APIRequestContext) {}

  async login(email: string, password: string): Promise<string> {
  const request: LoginRequest = { email, password };
  const response = await this.api.post(AuthApi.LOGIN_PATH, { data: request });
  if (response.status() !== 200) {
    throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
  }
  const body: LoginResponse = await response.json();
  if (!body.token) throw new Error('Login response did not contain a token');
  return body.token;
}
}