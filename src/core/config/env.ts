import dotenv from 'dotenv';
import fs from 'fs';

const envFile = process.env.TEST_ENV ? `.env.${process.env.TEST_ENV}` : '.env';

if (process.env.TEST_ENV && !fs.existsSync(envFile)) {
  throw new Error(`Environment file "${envFile}" not found (TEST_ENV=${process.env.TEST_ENV}).`);
}

dotenv.config({ path: envFile });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}. Check your .env file.`);
  return value;
}

export const env = {
  baseUrl: required('BASE_URL'),
  apiBaseUrl: required('API_BASE_URL').replace(/\/?$/, '/'),
  userEmail: required('TEST_USER_EMAIL'),
  userPassword: required('TEST_USER_PASSWORD'),
};