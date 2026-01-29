import { test, expect } from '@playwright/test';
import { createTestUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('ASSETS Module', () => {
  test.beforeAll(async () => {
    testUser = await createTestUser();
    if (!testUser) {
      console.warn('Failed to create test user, some tests will be skipped.');
    }
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!testUser, 'User creation failed');
    if (!testUser) return;

    await page.goto('/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/core\/dashboard/);
  });

  test('should load Assets dashboard', async ({ page }) => {
    await page.goto('/assets');
    await expect(page).toHaveURL('/assets');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should load Catalog page', async ({ page }) => {
    await page.goto('/assets/catalog');
    await expect(page).toHaveURL('/assets/catalog');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Inventory page', async ({ page }) => {
    await page.goto('/assets/inventory');
    await expect(page).toHaveURL('/assets/inventory');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Locations page', async ({ page }) => {
    await page.goto('/assets/locations');
    await expect(page).toHaveURL('/assets/locations');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Reservations page', async ({ page }) => {
    await page.goto('/assets/reservations');
    await expect(page).toHaveURL('/assets/reservations');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Advances page', async ({ page }) => {
    await page.goto('/assets/advances');
    await expect(page).toHaveURL('/assets/advances');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Deployment page', async ({ page }) => {
    await page.goto('/assets/deployment');
    await expect(page).toHaveURL('/assets/deployment');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Logistics page', async ({ page }) => {
    await page.goto('/assets/logistics');
    await expect(page).toHaveURL('/assets/logistics');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Status page', async ({ page }) => {
    await page.goto('/assets/status');
    await expect(page).toHaveURL('/assets/status');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Maintenance page', async ({ page }) => {
    await page.goto('/assets/maintenance');
    await expect(page).toHaveURL('/assets/maintenance');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });
});
