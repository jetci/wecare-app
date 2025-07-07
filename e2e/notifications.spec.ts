import '@testing-library/jest-dom/vitest';
import { test, expect } from '@playwright/test';

// Use authenticated session
test.use({ storageState: 'auth.json' });

test.describe('Notifications Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock notifications GET and DELETE API
    await page.route('**/api/notifications', async (route) => {
      const req = route.request();
      if (req.method() === 'GET') {
        const notifications = [
          { id: 'a1', message: 'Test notification 1' },
          { id: 'b2', message: 'Test notification 2' },
        ];
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(notifications) });
      } else {
        await route.continue();
      }
    });
    await page.route(/\/api\/notifications\/.+/, async (route) => {
      const req = route.request();
      if (req.method() === 'DELETE') {
        await route.fulfill({ status: 200 });
      } else {
        await route.continue();
      }
    });
    // Navigate to page
    await page.goto('http://localhost:3000/notifications');
  });

  test('renders notifications list with view and delete actions', async ({ page }) => {
    // Wait for loading
    await page.waitForSelector('[data-testid="notification-card"]');
    const cards = page.locator('[data-testid="notification-card"]');
    await expect(cards).toHaveCount(2);

    // Test view modal
    await page.click('[data-testid="notification-view-a1"]');
    await page.waitForSelector('[data-testid="view-modal"]');
    await expect(page.locator('[data-testid="view-message"]')).toHaveText('Test notification 1');
    await page.click('[data-testid="view-close"]');
    await expect(page.locator('[data-testid="view-modal"]')).toBeHidden();

    // Test delete
    await page.click('[data-testid="notification-delete-b2"]');
    await expect(page.locator('[data-testid="notification-card"]')).toHaveCount(1);
    // Confirm success toast displayed
    await expect(page.locator('text=Deleted')).toBeVisible();
  });
});

