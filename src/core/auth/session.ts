import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import type { BrowserContext } from '@playwright/test';

export const AUTH_FILE = path.join(process.cwd(), 'auth-states', 'user.json');
const TOKEN_KEY = 'eventhub_token';

type SessionState = Awaited<ReturnType<BrowserContext['storageState']>>;

export function saveSession(token: string, file: string = AUTH_FILE): void {
  const state: SessionState = {
    cookies: [],
    origins: [
      { origin: new URL(env.baseUrl).origin, localStorage: [{ name: TOKEN_KEY, value: token }] },
    ],
  };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state, null, 2));
}

export function readToken(file: string = AUTH_FILE): string {
  if (!fs.existsSync(file)) {
    throw new Error('No saved session found. Run the "setup" project first.');
  }
  const state: SessionState = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const entry = state.origins
    .flatMap((origin) => origin.localStorage)
    .find((item) => item.name === TOKEN_KEY);
  if (!entry) throw new Error('Saved session has no auth token.');
  return entry.value;
}