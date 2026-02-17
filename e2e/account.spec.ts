import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('ACCOUNT & SETTINGS Module', () => {
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

  test('should load Profile page', async ({ page }) => {
    await page.goto('/account/profile');
    await expect(page).toHaveURL('/account/profile');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Privacy page', async ({ page }) => {
    await page.goto('/account/privacy');
    await expect(page).toHaveURL('/account/privacy');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Organization page', async ({ page }) => {
    await page.goto('/account/organization');
    await expect(page).toHaveURL('/account/organization');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Billing page', async ({ page }) => {
    await page.goto('/account/billing');
    await expect(page).toHaveURL('/account/billing');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Platform settings page', async ({ page }) => {
    await page.goto('/account/platform');
    await expect(page).toHaveURL('/account/platform');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Audit Log page', async ({ page }) => {
    await page.goto('/account/audit-log');
    await expect(page).toHaveURL('/account/audit-log');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load History page', async ({ page }) => {
    await page.goto('/account/history');
    await expect(page).toHaveURL('/account/history');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Resources page', async ({ page }) => {
    await page.goto('/account/resources');
    await expect(page).toHaveURL('/account/resources');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Support page', async ({ page }) => {
    await page.goto('/account/support');
    await expect(page).toHaveURL('/account/support');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Sandbox page', async ({ page }) => {
    await page.goto('/account/sandbox');
    await expect(page).toHaveURL('/account/sandbox');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });
});
