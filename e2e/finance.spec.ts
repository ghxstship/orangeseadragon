import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('FINANCE Module', () => {
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

  test('should load Finance dashboard', async ({ page }) => {
    await page.goto('/finance');
    await expect(page).toHaveURL('/finance');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should load Budgets page', async ({ page }) => {
    await page.goto('/finance/budgets');
    await expect(page).toHaveURL('/finance/budgets');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Procurement page', async ({ page }) => {
    await page.goto('/finance/procurement');
    await expect(page).toHaveURL('/finance/procurement');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Expenses page', async ({ page }) => {
    await page.goto('/finance/expenses');
    await expect(page).toHaveURL('/finance/expenses');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Invoices page', async ({ page }) => {
    await page.goto('/finance/invoices');
    await expect(page).toHaveURL('/finance/invoices');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Payments page', async ({ page }) => {
    await page.goto('/finance/payments');
    await expect(page).toHaveURL('/finance/payments');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Payroll page', async ({ page }) => {
    await page.goto('/finance/payroll');
    await expect(page).toHaveURL('/finance/payroll');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Accounts page', async ({ page }) => {
    await page.goto('/finance/accounts');
    await expect(page).toHaveURL('/finance/accounts');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Reports page', async ({ page }) => {
    await page.goto('/finance/reports');
    await expect(page).toHaveURL('/finance/reports');
    await expect(page.locator('h1, h2, .report-container').first()).toBeVisible({ timeout: 10000 });
  });
});
