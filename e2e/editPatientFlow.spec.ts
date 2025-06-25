import { test, expect } from '@playwright/test';

test.describe('Edit Patient Flow', () => {
  test('can edit patient and redirect', async ({ page }) => {
    // Navigate to edit page for patient with id 1
    await page.goto('/dashboard/community/patients/1/edit');

    // Fill in new values
    await page.fill('input#prefix', 'นาง');
    await page.fill('input#firstName', 'สมหญิง');
    await page.fill('input#lastName', 'ใจดี');
    await page.fill('input#phone', '0987654321');

    // Submit the form
    await page.click('button[type=submit]');

    // Expect redirect to list page
    await page.waitForURL('/dashboard/community/patients');

    // Verify a success toast or message appears
    await expect(page.locator('body')).toContainText('บันทึกเรียบร้อย');
  });
});
