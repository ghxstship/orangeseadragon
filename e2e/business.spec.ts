import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('BUSINESS Module', () => {
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

  test('should load Business dashboard', async ({ page }) => {
    await page.goto('/business');
    await expect(page).toHaveURL('/business');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should load Pipeline page', async ({ page }) => {
    await page.goto('/business/pipeline');
    await expect(page).toHaveURL('/business/pipeline');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Companies page', async ({ page }) => {
    await page.goto('/business/companies');
    await expect(page).toHaveURL('/business/companies');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Proposals page', async ({ page }) => {
    await page.goto('/business/proposals');
    await expect(page).toHaveURL('/business/proposals');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Contracts page', async ({ page }) => {
    await page.goto('/business/contracts');
    await expect(page).toHaveURL('/business/contracts');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Products page', async ({ page }) => {
    await page.goto('/business/products');
    await expect(page).toHaveURL('/business/products');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Campaigns page', async ({ page }) => {
    await page.goto('/business/campaigns');
    await expect(page).toHaveURL('/business/campaigns');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Subscribers page', async ({ page }) => {
    await page.goto('/business/subscribers');
    await expect(page).toHaveURL('/business/subscribers');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Brand page', async ({ page }) => {
    await page.goto('/business/brand');
    await expect(page).toHaveURL('/business/brand');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });
});
