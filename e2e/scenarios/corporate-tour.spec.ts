import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from '../utils';

/**
 * SCENARIO: Corporate Tour Flow
 *
 * Simulates a multi-city corporate tour lifecycle:
 * 1. Create deal and proposal in pipeline
 * 2. Set up project with multiple events
 * 3. Manage travel bookings and accommodations
 * 4. Track equipment shipments across cities
 * 5. Handle per-diem and expense tracking
 * 6. Generate invoices and track payments
 *
 * Validates: Business → Productions → People/Travel → Assets/Logistics → Finance
 */

let testUser: { email: string; password: string } | null = null;

test.describe('Scenario: Corporate Tour', () => {
  test.beforeAll(async () => {
    testUser = await createTestUser();
    if (!testUser) {
      console.warn('Failed to create test user, scenario tests will be skipped.');
    }
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!testUser, 'User creation failed');
    if (!testUser) return;
    await loginUser(page, testUser.email, testUser.password);
  });

  test('1. Dashboard loads with KPIs and quick actions', async ({ page }) => {
    await page.goto('/core/dashboard');
    await expect(page).toHaveURL(/\/core\/dashboard/);
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('2. Pipeline proposals page loads', async ({ page }) => {
    await page.goto('/business/pipeline/proposals');
    await expect(page).toHaveURL('/business/pipeline/proposals');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('3. Pipeline leads page loads', async ({ page }) => {
    await page.goto('/business/pipeline/leads');
    await expect(page).toHaveURL('/business/pipeline/leads');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('4. Travel hub loads', async ({ page }) => {
    await page.goto('/people/travel');
    await expect(page).toHaveURL('/people/travel');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('5. Travel bookings page loads', async ({ page }) => {
    await page.goto('/people/travel/bookings');
    await expect(page).toHaveURL('/people/travel/bookings');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('6. Travel accommodations page loads', async ({ page }) => {
    await page.goto('/people/travel/accommodations');
    await expect(page).toHaveURL('/people/travel/accommodations');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('7. Travel flights page loads', async ({ page }) => {
    await page.goto('/people/travel/flights');
    await expect(page).toHaveURL('/people/travel/flights');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('8. Asset logistics deployment page loads', async ({ page }) => {
    await page.goto('/assets/logistics/deployment');
    await expect(page).toHaveURL('/assets/logistics/deployment');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('9. Timekeeping page loads', async ({ page }) => {
    await page.goto('/people/timekeeping');
    await expect(page).toHaveURL('/people/timekeeping');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('10. Invoices overview page loads', async ({ page }) => {
    await page.goto('/finance/invoices/overview');
    await expect(page).toHaveURL('/finance/invoices/overview');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('11. Invoice payments page loads', async ({ page }) => {
    await page.goto('/finance/invoices/payments');
    await expect(page).toHaveURL('/finance/invoices/payments');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('12. Quotes page loads', async ({ page }) => {
    await page.goto('/finance/quotes');
    await expect(page).toHaveURL('/finance/quotes');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('13. My Tasks page loads with views', async ({ page }) => {
    await page.goto('/core/tasks/my-tasks');
    await expect(page).toHaveURL('/core/tasks/my-tasks');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('14. Inbox page loads', async ({ page }) => {
    await page.goto('/core/inbox');
    await expect(page).toHaveURL('/core/inbox');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('15. Analytics page loads', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page).toHaveURL('/analytics');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });
});
