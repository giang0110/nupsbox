import {defineConfig} from '@playwright/test';

const baseURL = process.env.PRODUCTION_BASE_URL;
if (!baseURL) throw new Error('Missing PRODUCTION_BASE_URL');

export default defineConfig({
  testDir: './tests/production',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  timeout: 60_000,
  reporter: 'list',
  use: {baseURL}
});
