import { test as base, APIRequestContext } from '@playwright/test';
import { env } from './config/env';
import { readToken } from './auth/session';

type CoreFixtures = {
  api: APIRequestContext;
  anonymousApi: APIRequestContext;
};

export const test = base.extend<CoreFixtures>({
  api: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: env.apiBaseUrl,
      extraHTTPHeaders: { Authorization: `Bearer ${readToken()}` },
    });
    await use(context);
    await context.dispose();
  },

  anonymousApi: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: env.apiBaseUrl });
    await use(context);
    await context.dispose();
  },
});
