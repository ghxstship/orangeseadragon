import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('ASSETS Module — Deep Routes', () => {
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

  // Catalog subpages
  test('should load Catalog Consumables page', async ({ page }) => {
    await page.goto('/assets/catalog/consumables');
    await expect(page).toHaveURL('/assets/catalog/consumables');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Catalog Inventory page', async ({ page }) => {
    await page.goto('/assets/catalog/inventory');
    await expect(page).toHaveURL('/assets/catalog/inventory');
    await expect(page.locator('body')).toBeVisible();
  });

  // Locations subpages
  test('should load Locations Bins page', async ({ page }) => {
    await page.goto('/assets/locations/bins');
    await expect(page).toHaveURL('/assets/locations/bins');
    await expect(page.locator('body')).toBeVisible();
  });

  // Logistics subpages
  test('should load Logistics Advances page', async ({ page }) => {
    await page.goto('/assets/logistics/advances');
    await expect(page).toHaveURL('/assets/logistics/advances');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Logistics Deployment page', async ({ page }) => {
    await page.goto('/assets/logistics/deployment');
    await expect(page).toHaveURL('/assets/logistics/deployment');
    await expect(page.locator('body')).toBeVisible();
  });

  // Maintenance subpages
  test('should load Maintenance History page', async ({ page }) => {
    await page.goto('/assets/maintenance/history');
    await expect(page).toHaveURL('/assets/maintenance/history');
    await expect(page.locator('body')).toBeVisible();
  });

  // Reservations subpages
  test('should load Reservations Check page', async ({ page }) => {
    await page.goto('/assets/reservations/check');
    await expect(page).toHaveURL('/assets/reservations/check');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Reservations Transfers page', async ({ page }) => {
    await page.goto('/assets/reservations/transfers');
    await expect(page).toHaveURL('/assets/reservations/transfers');
    await expect(page.locator('body')).toBeVisible();
  });
});
