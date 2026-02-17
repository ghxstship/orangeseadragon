import { test, expect } from '@playwright/test';

test.describe('AUTH — Extended Pages', () => {
  test('should load forgot-password page', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load reset-password page', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page).toHaveURL('/reset-password');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load verify-email page', async ({ page }) => {
    await page.goto('/verify-email');
    await expect(page).toHaveURL('/verify-email');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load magic-link page', async ({ page }) => {
    await page.goto('/magic-link');
    await expect(page).toHaveURL('/magic-link');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load verify-mfa page', async ({ page }) => {
    await page.goto('/verify-mfa');
    await expect(page).toHaveURL('/verify-mfa');
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page has email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('register page has required form fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('forgot-password page has email field and submit', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
