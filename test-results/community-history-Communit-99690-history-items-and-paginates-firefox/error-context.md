# Test info

- Name: Community History Page E2E >> loads initial history items and paginates
- Location: C:\Users\intel\CascadeProjects\wecare-app\e2e\community-history.spec.ts:24:7

# Error details

```
Error: page.waitForRequest: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for request "**/api/communities/123/history*"
============================================================
    at C:\Users\intel\CascadeProjects\wecare-app\e2e\community-history.spec.ts:38:16
```

# Page snapshot

```yaml
- text: Loading...
- alert
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 2 Issue
- button "Collapse issues badge":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | // Enable authenticated storage
   3 | test.use({ storageState: 'e2e/auth.json' });
   4 |
   5 | // E2E tests for Community History Page (authenticated via storageState)
   6 | test.describe('Community History Page E2E', () => {
   7 |   test.beforeEach(async ({ page, context }) => {
   8 |     // Capture browser console logs
   9 |     page.on('console', msg => console.log('PAGE LOG >>>', msg.text()));
  10 |     // Bypass server-side auth middleware by setting e2e and accessToken cookies
  11 |     await context.addCookies([
  12 |       { name: 'e2e', value: 'true', domain: 'localhost', path: '/' },
  13 |       { name: 'accessToken', value: 'dummy-token', domain: 'localhost', path: '/' }
  14 |     ]);
  15 |     // Stub auth profile for client-side calls
  16 |     await page.route('**/api/auth/profile', route =>
  17 |       route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'test-user', name: 'Test User', role: 'community' }) })
  18 |     );
  19 |     // Stub external Google Maps API calls
  20 |     await page.route('**/maps.googleapis.com/maps/api/**', route => route.abort());
  21 |     await page.route('**/maps.googleapis.com/maps/api/js*', route => route.abort());
  22 |   });
  23 |
  24 |   test('loads initial history items and paginates', async ({ page }) => {
  25 |     // Stub paginated community history API for community 123 before navigation
  26 |     await page.route('**/api/communities/123/history*', async route => {
  27 |       console.log(' /history stub hit', route.request().url());
  28 |       const url = new URL(route.request().url());
  29 |       const pageParam = url.searchParams.get('page');
  30 |       const items = pageParam === '2'
  31 |         ? [{ id: '3', status: 'Open' }, { id: '4', status: 'Closed' }]
  32 |         : [{ id: '1', status: 'Open' }, { id: '2', status: 'Closed' }];
  33 |       await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items }) });
  34 |     });
  35 |     // Navigate to history page and wait for network to be idle (including SWR requests)
  36 |     await page.goto('/dashboard/community/123/history?e2e=true', { waitUntil: 'networkidle' });
  37 |     // Ensure request is sent
> 38 |     await page.waitForRequest('**/api/communities/123/history*', { timeout: 60000 });
     |                ^ Error: page.waitForRequest: Test timeout of 30000ms exceeded.
  39 |     // Wait for stubbed API response
  40 |     await page.waitForResponse('**/api/communities/123/history*', { timeout: 60000 });
  41 |     await expect(page).toHaveURL(/\/dashboard\/community\/123\/history/);
  42 |
  43 |     // Verify initial items count
  44 |     await expect(page.locator('[data-testid="history-item"]')).toHaveCount(2, { timeout: 60000 });
  45 |
  46 |     // Load more items and verify updated count
  47 |     await page.click('[data-testid="load-more"]');
  48 |     await page.waitForResponse('**/api/communities/123/history*', { timeout: 60000 });
  49 |     await expect(page.locator('[data-testid="history-item"]')).toHaveCount(4, { timeout: 60000 });
  50 |   });
  51 | });
  52 |
```