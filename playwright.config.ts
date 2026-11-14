import { defineConfig, devices, type ReporterDescription } from '@playwright/test';  
import { env } from './src/core/config/env';
import { AUTH_FILE } from './src/core/auth/session';

const reporters: ReporterDescription[] = process.env.CI
  ? [
      ['dot'],                                             
      ['junit', { outputFile: 'test-results/junit.xml' }],  
      ['html', { open: 'never' }],                         
    ]
  : [
      ['list'],                                             
      ['html', { open: 'on-failure' }],                  
    ];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: reporters, 

  use: {
    baseURL: env.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testDir: './src/core/auth',
      testMatch: '**/*.setup.ts',
      use: { baseURL: env.apiBaseUrl },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
    },
    {
      name: 'api',
      testDir: './tests/api',
      dependencies: ['setup'],
      use: { baseURL: env.apiBaseUrl },
    },
  ],
});