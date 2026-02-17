import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('BUSINESS Module — Deep Routes', () => {
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

  // Pipeline subpages
  test('should load Pipeline Activities page', async ({ page }) => {
    await page.goto('/business/pipeline/activities');
    await expect(page).toHaveURL('/business/pipeline/activities');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Pipeline Forecast page', async ({ page }) => {
    await page.goto('/business/pipeline/forecast');
    await expect(page).toHaveURL('/business/pipeline/forecast');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Pipeline Proposals page', async ({ page }) => {
    await page.goto('/business/pipeline/proposals');
    await expect(page).toHaveURL('/business/pipeline/proposals');
    await expect(page.locator('body')).toBeVisible();
  });

  // Companies subpages
  test('should load Companies Contracts page', async ({ page }) => {
    await page.goto('/business/companies/contracts');
    await expect(page).toHaveURL('/business/companies/contracts');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Companies Sponsors page', async ({ page }) => {
    await page.goto('/business/companies/sponsors');
    await expect(page).toHaveURL('/business/companies/sponsors');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Companies Vendors page', async ({ page }) => {
    await page.goto('/business/companies/vendors');
    await expect(page).toHaveURL('/business/companies/vendors');
    await expect(page.locator('body')).toBeVisible();
  });

  // Contacts standalone
  test('should load Contacts page', async ({ page }) => {
    await page.goto('/business/contacts');
    await expect(page).toHaveURL('/business/contacts');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Products subpages
  test('should load Products Packages page', async ({ page }) => {
    await page.goto('/business/products/packages');
    await expect(page).toHaveURL('/business/products/packages');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Products Pricing page', async ({ page }) => {
    await page.goto('/business/products/pricing');
    await expect(page).toHaveURL('/business/products/pricing');
    await expect(page.locator('body')).toBeVisible();
  });

  // Campaigns subpages
  test('should load Campaigns Subscribers page', async ({ page }) => {
    await page.goto('/business/campaigns/subscribers');
    await expect(page).toHaveURL('/business/campaigns/subscribers');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Campaigns Templates page', async ({ page }) => {
    await page.goto('/business/campaigns/templates');
    await expect(page).toHaveURL('/business/campaigns/templates');
    await expect(page.locator('body')).toBeVisible();
  });

  // Brand subpages
  test('should load Brand Assets page', async ({ page }) => {
    await page.goto('/business/brand/assets');
    await expect(page).toHaveURL('/business/brand/assets');
    await expect(page.locator('body')).toBeVisible();
  });
});
