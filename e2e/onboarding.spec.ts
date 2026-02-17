import { test, expect } from '@playwright/test';

test.describe('ONBOARDING Flow', () => {
  test('should load onboarding start page', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load onboarding profile page', async ({ page }) => {
    await page.goto('/onboarding/profile');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load onboarding organization page', async ({ page }) => {
    await page.goto('/onboarding/organization');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load onboarding team page', async ({ page }) => {
    await page.goto('/onboarding/team');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load onboarding preferences page', async ({ page }) => {
    await page.goto('/onboarding/preferences');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load onboarding integrations page', async ({ page }) => {
    await page.goto('/onboarding/integrations');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load onboarding tour page', async ({ page }) => {
    await page.goto('/onboarding/tour');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load onboarding complete page', async ({ page }) => {
    await page.goto('/onboarding/complete');
    await expect(page.locator('body')).toBeVisible();
  });
});
