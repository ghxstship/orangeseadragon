import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('PEOPLE Module', () => {
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

  test('should load People dashboard', async ({ page }) => {
    await page.goto('/people');
    await expect(page).toHaveURL('/people');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should load Rosters page', async ({ page }) => {
    await page.goto('/people/rosters');
    await expect(page).toHaveURL('/people/rosters');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Availability page', async ({ page }) => {
    await page.goto('/people/availability');
    await expect(page).toHaveURL('/people/availability');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Travel page', async ({ page }) => {
    await page.goto('/people/travel');
    await expect(page).toHaveURL('/people/travel');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Recruitment page', async ({ page }) => {
    await page.goto('/people/recruitment');
    await expect(page).toHaveURL('/people/recruitment');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Onboarding page', async ({ page }) => {
    await page.goto('/people/onboarding');
    await expect(page).toHaveURL('/people/onboarding');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Training page', async ({ page }) => {
    await page.goto('/people/training');
    await expect(page).toHaveURL('/people/training');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Scheduling page', async ({ page }) => {
    await page.goto('/people/scheduling');
    await expect(page).toHaveURL('/people/scheduling');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Timekeeping page', async ({ page }) => {
    await page.goto('/people/timekeeping');
    await expect(page).toHaveURL('/people/timekeeping');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Performance page', async ({ page }) => {
    await page.goto('/people/performance');
    await expect(page).toHaveURL('/people/performance');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Certifications page', async ({ page }) => {
    await page.goto('/people/certifications');
    await expect(page).toHaveURL('/people/certifications');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Positions page', async ({ page }) => {
    await page.goto('/people/positions');
    await expect(page).toHaveURL('/people/positions');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });
});
