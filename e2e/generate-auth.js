const { chromium } = require('playwright');
const fs = require('fs');
const http = require('http');

// Node 18+ has global fetch; otherwise, you can install node-fetch
async function waitForServer(hostname, path = '/login?e2e=true', port = 3000, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    await new Promise(res => {
      const req = http.request({ hostname, port, path, method: 'GET' }, res => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          res.resume();
          return res.socket.destroy(() => res.socket.destroy());
        }
        res.resume();
        setTimeout(res, 1000);
      });
      req.on('error', () => setTimeout(res, 1000));
      req.end();
    });
    console.log('[Auth] Waiting for server...');
  }
}

(async () => {
  // Ensure dev server is running
  console.log('[Auth] Checking server availability...');
  await waitForServer('localhost', '/login?e2e=true', 3000);

  console.log('[Auth] Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('[Auth] Navigating to login page...');
  await page.goto('http://localhost:3000/login?e2e=true', { waitUntil: 'load' });

  // Wait for login form fields
  console.log('[Auth] Waiting for login form...');
  await page.waitForSelector('#nationalId', { timeout: 30000 });
  await page.waitForSelector('#password', { timeout: 30000 });

  console.log('[Auth] Filling credentials...');
  await page.fill('#nationalId', '1234567890123');
  await page.fill('#password', 'password123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.click('button[type="submit"]'),
  ]);

  console.log('[Auth] Login successful, saving storage state...');
  await context.storageState({ path: 'e2e/auth.json' });
  console.log('✔ Auth storageState saved to e2e/auth.json');
  await browser.close();
  console.log('[Auth] Browser closed. Auth generation complete.');
})();
