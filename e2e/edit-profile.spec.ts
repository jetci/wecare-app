import { test, expect, devices } from '@playwright/test';

// Sample user data
const userData = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  nationalId: '1234567890123',
  phone: '0812345678',
  birthDate: '2000-01-01',
  avatarUrl: '',
};

// Helper to mock GET and optionally PUT
async function mockProfileApi(page, { putStatus = 200, putBody = {} } = {}) {
  await page.route('**/api/auth/profile', async route => {
    const req = route.request();
    if (req.method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: userData }),
      });
    } else if (req.method() === 'PUT') {
      route.fulfill({
        status: putStatus,
        contentType: 'application/json',
        body: JSON.stringify(putBody),
      });
    } else {
      route.continue();
    }
  });
}

// Use stored auth state
test.use({ storageState: 'auth.json' });

test.describe('E2E: Edit User Profile', () => {
  test('loads, edits, and submits successfully', async ({ page }) => {
    await mockProfileApi(page, { putStatus: 200 });
    await page.goto('/dashboard/profile/edit');
    // Verify initial value
    const fullName = `${userData.firstName} ${userData.lastName}`;
    await expect(page.locator('input[name="fullName"]')).toHaveValue(fullName);
    // Update fullName
    await page.fill('input[name="fullName"]', 'Jane Smith');
    // Submit
    await page.click('button:has-text("บันทึก")');
    // Expect redirect
    await page.waitForURL('**/dashboard/profile');
  });

  test('shows error when submission fails', async ({ page }) => {
    await mockProfileApi(page, { putStatus: 400, putBody: { message: 'Bad Request' } });
    await page.goto('/dashboard/profile/edit');
    await expect(page.locator('input[name="fullName"]')).toHaveValue(`${userData.firstName} ${userData.lastName}`);
    // Trigger submit without changes
    await page.click('button:has-text("บันทึก")');
    // Expect inline error
    await expect(page.locator('text=Update failed')).toBeVisible();
    // Ensure not redirected
    await expect(page).not.toHaveURL('**/dashboard/profile');
  });
});
