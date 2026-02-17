import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('OPERATIONS Module', () => {
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

  test('should load Operations dashboard', async ({ page }) => {
    await page.goto('/operations');
    await expect(page).toHaveURL('/operations');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should load Shows page', async ({ page }) => {
    await page.goto('/operations/shows');
    await expect(page).toHaveURL('/operations/shows');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Runsheets page', async ({ page }) => {
    await page.goto('/operations/runsheets');
    await expect(page).toHaveURL('/operations/runsheets');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Venues page', async ({ page }) => {
    await page.goto('/operations/venues');
    await expect(page).toHaveURL('/operations/venues');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Incidents page', async ({ page }) => {
    await page.goto('/operations/incidents');
    await expect(page).toHaveURL('/operations/incidents');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Work Orders page', async ({ page }) => {
    await page.goto('/operations/work-orders');
    await expect(page).toHaveURL('/operations/work-orders');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Daily Reports page', async ({ page }) => {
    await page.goto('/operations/daily-reports');
    await expect(page).toHaveURL('/operations/daily-reports');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Comms page', async ({ page }) => {
    await page.goto('/operations/comms');
    await expect(page).toHaveURL('/operations/comms');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });
});
