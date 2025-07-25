import { test, expect, Page } from '@playwright/test';

test.describe('New Request Form (ฟอร์มสร้างคำขอใหม่)', () => {
  // Mock patient search and request APIs
  test.beforeEach(async ({ page }) => {
    // Mock authenticated session via storageState
    await page.goto('/');

    // Mock GET /api/patients
    await page.route('**/api/patients?*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          patient: {
            prefix: 'นางสาว', firstName: 'แม่', lastName: 'มะลิ',
            currentAddress: '123 หมู่ 5 ต.ท่าข้าม',
            currentAddress_phone: '0812345678',
            patientGroup: 'รับส่งผู้ป่วย', pickupLocation_lat: 13.7563, pickupLocation_lng: 100.5018
          }
        })
      });
    });

    // Default POST /api/community/requests to 200
    await page.route('**/api/community/requests', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/dashboard/community/requests/new');
  });

  test('successful submission flow', async ({ page }) => {
    // Search patient
    await page.fill('input[name="nationalId"]', '1234567890123');
    await page.click('button:has-text("ค้นหา")');
    // Verify readonly patient fields
    await expect(page.locator('input[readonly]')).toHaveCount(5);

    // Pick service date: tomorrow
    const dt = new Date(); dt.setDate(dt.getDate() + 1);
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const by = dt.getFullYear() + 543;
    const dateStr = `${dd}-${mm}-${by}`;
    await page.fill('input[name="serviceDate"]', dateStr);

    // Select request type
    await page.selectOption('select[name="requestType"]', 'รับส่งผู้ป่วย');
    // Fill details
    await page.fill('textarea[name="details"]', 'ต้องการรถโรงพยาบาลเวลา 09:00 น.');

    // Handle alert dialog
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('สร้างคำขอสำเร็จ');
      await dialog.accept();
    });

    // Submit
    await page.click('button:has-text("ส่งคำขอ")');
  });

  test('validation errors on empty or invalid inputs', async ({ page }) => {
    // Direct submit without search
    await page.click('button:has-text("ส่งคำขอ")');
    await expect(page.locator('text=เลขบัตรประชาชนต้องมี 13 หลัก')).toBeVisible();
    // Fill invalid Buddhist year
    await page.fill('input[name="nationalId"]', '1234567890123');
    await page.click('button:has-text("ค้นหา")');
    await page.fill('input[name="serviceDate"]', '01-01-2020');
    await page.click('button:has-text("ส่งคำขอ")');
    await expect(page.locator('text=ปีต้องไม่น้อยกว่า 2500')).toBeVisible();
  });
});
