import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  globalSetup: './e2e/global.setup.ts',
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  use: { 
    baseURL: 'http://localhost:3000', 
    headless: true, 
    screenshot: 'only-on-failure', 
    trace: 'retain-on-failure',
    storageState: 'auth.json',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120000,
    cwd: path.resolve(__dirname),
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
