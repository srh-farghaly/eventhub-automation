import { test as setup } from '@playwright/test';
import { AuthApi } from './AuthApi';
import { env } from '../config/env';
import { saveSession } from './session';

setup('log in once and save the session', async ({ request }) => {
  const token = await new AuthApi(request).login(env.userEmail, env.userPassword);
  saveSession(token);
});