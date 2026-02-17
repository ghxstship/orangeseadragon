import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('PRODUCTIONS Module', () => {
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

  test('should load Productions dashboard', async ({ page }) => {
    await page.goto('/productions');
    await expect(page).toHaveURL('/productions');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should load Events page with CrudList', async ({ page }) => {
    await page.goto('/productions/events');
    await expect(page).toHaveURL('/productions/events');
    // CrudList renders a table or list
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Activations page', async ({ page }) => {
    await page.goto('/productions/activations');
    await expect(page).toHaveURL('/productions/activations');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Build & Strike page', async ({ page }) => {
    await page.goto('/productions/build-strike');
    await expect(page).toHaveURL('/productions/build-strike');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Compliance page', async ({ page }) => {
    await page.goto('/productions/compliance');
    await expect(page).toHaveURL('/productions/compliance');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Inspections page', async ({ page }) => {
    await page.goto('/productions/inspections');
    await expect(page).toHaveURL('/productions/inspections');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Punch Lists page', async ({ page }) => {
    await page.goto('/productions/punch-lists');
    await expect(page).toHaveURL('/productions/punch-lists');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Advancing page', async ({ page }) => {
    await page.goto('/productions/advancing');
    await expect(page).toHaveURL('/productions/advancing');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });
});
