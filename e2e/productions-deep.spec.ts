import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('PRODUCTIONS Module — Deep Routes', () => {
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

  // Projects
  test('should load Projects page', async ({ page }) => {
    await page.goto('/productions/projects');
    await expect(page).toHaveURL('/productions/projects');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Stages page', async ({ page }) => {
    await page.goto('/productions/stages');
    await expect(page).toHaveURL('/productions/stages');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Compliance subpages
  test('should load Compliance Insurance page', async ({ page }) => {
    await page.goto('/productions/compliance/insurance');
    await expect(page).toHaveURL('/productions/compliance/insurance');
    await expect(page.locator('body')).toBeVisible();
  });

  // Advancing subpages
  test('should load Advancing Activity page', async ({ page }) => {
    await page.goto('/productions/advancing/activity');
    await expect(page).toHaveURL('/productions/advancing/activity');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Advancing Advances page', async ({ page }) => {
    await page.goto('/productions/advancing/advances');
    await expect(page).toHaveURL('/productions/advancing/advances');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Advancing Allotments page', async ({ page }) => {
    await page.goto('/productions/advancing/allotments');
    await expect(page).toHaveURL('/productions/advancing/allotments');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Advancing Approvals page', async ({ page }) => {
    await page.goto('/productions/advancing/approvals');
    await expect(page).toHaveURL('/productions/advancing/approvals');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Advancing Assignments page', async ({ page }) => {
    await page.goto('/productions/advancing/assignments');
    await expect(page).toHaveURL('/productions/advancing/assignments');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Advancing Catering page', async ({ page }) => {
    await page.goto('/productions/advancing/catering');
    await expect(page).toHaveURL('/productions/advancing/catering');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Advancing Guest Lists page', async ({ page }) => {
    await page.goto('/productions/advancing/guest-lists');
    await expect(page).toHaveURL('/productions/advancing/guest-lists');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Advancing Hospitality page', async ({ page }) => {
    await page.goto('/productions/advancing/hospitality');
    await expect(page).toHaveURL('/productions/advancing/hospitality');
    await expect(page.locator('body')).toBeVisible();
  });
});
