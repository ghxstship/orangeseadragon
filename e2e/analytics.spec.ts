import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('ANALYTICS Module', () => {
  test.beforeAll(async () => {
    testUser = await createTestUser();
    if (!testUser) {
      console.warn('Failed to create test user, some tests will be skipped.');
    }
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!testUser, 'User creation failed');
    if (!testUser) return;
    await loginUser(page, testUser.email, testUser.password);
  });

  test('should load Analytics hub page', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page).toHaveURL('/analytics');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should load Dashboards page', async ({ page }) => {
    await page.goto('/analytics/dashboards');
    await expect(page).toHaveURL('/analytics/dashboards');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Dashboard Builder page', async ({ page }) => {
    await page.goto('/analytics/dashboards/builder');
    await expect(page).toHaveURL('/analytics/dashboards/builder');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Reports page', async ({ page }) => {
    await page.goto('/analytics/reports');
    await expect(page).toHaveURL('/analytics/reports');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Report Builder page', async ({ page }) => {
    await page.goto('/analytics/reports/builder');
    await expect(page).toHaveURL('/analytics/reports/builder');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Scheduled Reports page', async ({ page }) => {
    await page.goto('/analytics/scheduled');
    await expect(page).toHaveURL('/analytics/scheduled');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });
});
