import { chromium } from '@playwright/test';
import path from 'path';

async function globalSetup() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  // set E2E flag via cookie to bypass auth on API
  await context.addCookies([{ name: 'e2e', value: 'true', domain: 'localhost', path: '/' }]);
  const page = await context.newPage();

  // Log all requests and responses for debugging
  page.on('request', req => console.log(`➡️ ${req.method()} ${req.url()}`));
  page.on('response', resp => console.log(`⬅️ ${resp.status()} ${resp.url()}`));

  // ไปหน้า login
  // เพิ่มพารามิเตอร์ bypass ใน E2E
  await page.goto('http://localhost:3000/login?e2e=true');
  // รอให้ input รหัสบัตรประชาชนปรากฏ
  await page.waitForSelector('#nationalId', { timeout: 20000 });
  // debug: ถ่าย screenshot หน้า login
  await page.screenshot({ path: 'login-page.png', fullPage: true });

  // กรอก credential
  await page.fill('#nationalId', '1234567890123');
  // รอ input password
  await page.waitForSelector('#password', { timeout: 20000 });
  await page.fill('#password', process.env.E2E_COMMUNITY_PASSWORD || 'password123');
  // Submit login and wait for login request
  const loginRequest = page.waitForRequest(req => req.url().endsWith('/api/auth/login') && req.method() === 'POST');
  await page.click('button[type="submit"]');
  await loginRequest;
  console.log('Login request sent');
  // Debug current URL after login
  console.log('Current URL after login:', page.url());
  // รอไปที่หน้า dashboard ใด ๆ ให้ path เริ่มต้นด้วย '/dashboard'
  await page.waitForURL(url => url.pathname.startsWith('/dashboard'), { timeout: 30000 });

  // Save authenticated storage state for E2E tests
  const storagePath = path.resolve(__dirname, 'auth.json');
  await context.storageState({ path: storagePath });
  await browser.close();
}

export default globalSetup;
