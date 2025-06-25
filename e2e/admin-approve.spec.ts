import { test, expect } from '@playwright/test';

// Extend test timeout to 60s
test.setTimeout(60000);

test.use({ storageState: 'auth.json' });

test('admin can approve a user request', async ({ page }) => {
  console.log('Navigating to admin dashboard:', page.url());
  // Mock requests
  const mockRequests = [{ id: 'req1', firstName: 'John', lastName: 'Doe' }];
  let reqCount = 0;
  await page.route('**/api/admin/users?approved=false**', (route) => {
    reqCount++;
    const body = reqCount === 1
      ? JSON.stringify({ users: mockRequests })
      : JSON.stringify({ users: [] });
    route.fulfill({ status: 200, contentType: 'application/json', body });
  });
  // Mock approve
  await page.route('**/api/admin/users/req1**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  );

  // Go to dashboard
  await page.goto('/dashboard/admin');
  console.log('After navigation:', page.url());
  await page.screenshot({ path: 'admin-approve-page.png', fullPage: true });
  // Wait for Requests tab to appear before clicking
  await page.waitForSelector('text=คำขอใช้งาน', { timeout: 30000 });
  // Open Requests tab
  await page.click('text=คำขอใช้งาน');
  await page.waitForResponse(resp => resp.url().includes('approved=false'), { timeout: 30000 });

  // Verify request row
  const row = page.locator('[data-testid="request-row-req1"]');
  await expect(row).toBeVisible();

  // Approve
  await row.locator('[data-testid="approve-button"]').click();
  // Wait for approve and refetch
  await page.waitForResponse(resp => resp.url().includes('/api/admin/users/req1'));
  await page.waitForResponse(resp => resp.url().includes('approved=false'));

  // Check toast
  // Wait for success toast
  await page.waitForSelector('text=อนุมัติแล้ว', { timeout: 30000 });
  await expect(page.locator('text=อนุมัติแล้ว')).toBeVisible();
  // Row removed
  await expect(row).toHaveCount(0);
});
