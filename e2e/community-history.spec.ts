import '@testing-library/jest-dom/vitest';
import { test, expect } from '@playwright/test';
// Enable authenticated storage
test.use({ storageState: 'e2e/auth.json' });

// E2E tests for Community History Page (authenticated via storageState)
test.describe('Community History Page E2E', () => {
  test.beforeEach(async ({ page, context }) => {
    // Capture browser console logs
    page.on('console', msg => console.log('PAGE LOG >>>', msg.text()));
    // Bypass server-side auth middleware by setting e2e and accessToken cookies
    await context.addCookies([
      { name: 'e2e', value: 'true', domain: 'localhost', path: '/' },
      { name: 'accessToken', value: 'dummy-token', domain: 'localhost', path: '/' }
    ]);
    // Stub auth profile for client-side calls
    await page.route('**/api/auth/profile', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'test-user', name: 'Test User', role: 'community' }) })
    );
    // Stub external Google Maps API calls
    await page.route('**/maps.googleapis.com/maps/api/**', route => route.abort());
    await page.route('**/maps.googleapis.com/maps/api/js*', route => route.abort());
  });

  test('loads initial history items and paginates', async ({ page }) => {
    // Stub paginated community history API for community 123 before navigation
    await page.route('**/api/communities/123/history*', async route => {
      console.log(' /history stub hit', route.request().url());
      const url = new URL(route.request().url());
      const pageParam = url.searchParams.get('page');
      const items = pageParam === '2'
        ? [{ id: '3', status: 'Open' }, { id: '4', status: 'Closed' }]
        : [{ id: '1', status: 'Open' }, { id: '2', status: 'Closed' }];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items }) });
    });
    // Navigate to history page and wait for network to be idle (including SWR requests)
    await page.goto('/dashboard/community/123/history?e2e=true', { waitUntil: 'networkidle' });
    // Ensure request is sent
    await page.waitForRequest('**/api/communities/123/history*', { timeout: 60000 });
    // Wait for stubbed API response
    await page.waitForResponse('**/api/communities/123/history*', { timeout: 60000 });
    await expect(page).toHaveURL(/\/dashboard\/community\/123\/history/);

    // Verify initial items count
    await expect(page.locator('[data-testid="history-item"]')).toHaveCount(2, { timeout: 60000 });

    // Load more items and verify updated count
    await page.click('[data-testid="load-more"]');
    await page.waitForResponse('**/api/communities/123/history*', { timeout: 60000 });
    await expect(page.locator('[data-testid="history-item"]')).toHaveCount(4, { timeout: 60000 });
    // Verify specific items loaded
    const texts = await page.locator('[data-testid="history-item"]').allTextContents();
    expect(texts).toEqual([
      '1 — Open',
      '2 — Closed',
      '3 — Open',
      '4 — Closed',
    ]);
  });
});

