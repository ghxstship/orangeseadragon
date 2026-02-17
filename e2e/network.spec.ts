import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('NETWORK Module', () => {
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

  test('should load Feed page', async ({ page }) => {
    await page.goto('/network/feed');
    await expect(page).toHaveURL('/network/feed');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Connections page', async ({ page }) => {
    await page.goto('/network/connections');
    await expect(page).toHaveURL('/network/connections');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Discussions page', async ({ page }) => {
    await page.goto('/network/discussions');
    await expect(page).toHaveURL('/network/discussions');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Marketplace page', async ({ page }) => {
    await page.goto('/network/marketplace');
    await expect(page).toHaveURL('/network/marketplace');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Opportunities page', async ({ page }) => {
    await page.goto('/network/opportunities');
    await expect(page).toHaveURL('/network/opportunities');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Profiles page', async ({ page }) => {
    await page.goto('/network/profiles');
    await expect(page).toHaveURL('/network/profiles');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Showcase page', async ({ page }) => {
    await page.goto('/network/showcase');
    await expect(page).toHaveURL('/network/showcase');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Challenges page', async ({ page }) => {
    await page.goto('/network/challenges');
    await expect(page).toHaveURL('/network/challenges');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Badges page', async ({ page }) => {
    await page.goto('/network/badges');
    await expect(page).toHaveURL('/network/badges');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Leaderboard page', async ({ page }) => {
    await page.goto('/network/leaderboard');
    await expect(page).toHaveURL('/network/leaderboard');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Discover page', async ({ page }) => {
    await page.goto('/network/discover');
    await expect(page).toHaveURL('/network/discover');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Messages page', async ({ page }) => {
    await page.goto('/network/messages');
    await expect(page).toHaveURL('/network/messages');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // New entity creation routes
  test('should load New Connection page', async ({ page }) => {
    await page.goto('/network/connections/new');
    await expect(page).toHaveURL('/network/connections/new');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load New Discussion page', async ({ page }) => {
    await page.goto('/network/discussions/new');
    await expect(page).toHaveURL('/network/discussions/new');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load New Marketplace listing page', async ({ page }) => {
    await page.goto('/network/marketplace/new');
    await expect(page).toHaveURL('/network/marketplace/new');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load New Opportunity page', async ({ page }) => {
    await page.goto('/network/opportunities/new');
    await expect(page).toHaveURL('/network/opportunities/new');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load New Showcase page', async ({ page }) => {
    await page.goto('/network/showcase/new');
    await expect(page).toHaveURL('/network/showcase/new');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load New Challenge page', async ({ page }) => {
    await page.goto('/network/challenges/new');
    await expect(page).toHaveURL('/network/challenges/new');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });
});
