import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('FINANCE Module — Deep Routes', () => {
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

  test('should load Finance Dashboard page', async ({ page }) => {
    await page.goto('/finance/dashboard');
    await expect(page).toHaveURL('/finance/dashboard');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Banking page', async ({ page }) => {
    await page.goto('/finance/banking');
    await expect(page).toHaveURL('/finance/banking');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Expense Approvals page', async ({ page }) => {
    await page.goto('/finance/expense-approvals');
    await expect(page).toHaveURL('/finance/expense-approvals');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Expense Receipts page', async ({ page }) => {
    await page.goto('/finance/expenses/receipts');
    await expect(page).toHaveURL('/finance/expenses/receipts');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Expense Reimbursements page', async ({ page }) => {
    await page.goto('/finance/expenses/reimbursements');
    await expect(page).toHaveURL('/finance/expenses/reimbursements');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Invoice Builder page', async ({ page }) => {
    await page.goto('/finance/invoices/builder');
    await expect(page).toHaveURL('/finance/invoices/builder');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Invoice Overview page', async ({ page }) => {
    await page.goto('/finance/invoices/overview');
    await expect(page).toHaveURL('/finance/invoices/overview');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Credit Notes page', async ({ page }) => {
    await page.goto('/finance/invoices/credit-notes');
    await expect(page).toHaveURL('/finance/invoices/credit-notes');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Quotes page', async ({ page }) => {
    await page.goto('/finance/quotes');
    await expect(page).toHaveURL('/finance/quotes');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Recurring Invoices page', async ({ page }) => {
    await page.goto('/finance/recurring-invoices');
    await expect(page).toHaveURL('/finance/recurring-invoices');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Rate Cards page', async ({ page }) => {
    await page.goto('/finance/rate-cards');
    await expect(page).toHaveURL('/finance/rate-cards');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Receipts page', async ({ page }) => {
    await page.goto('/finance/receipts');
    await expect(page).toHaveURL('/finance/receipts');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Accounts Reconciliation page', async ({ page }) => {
    await page.goto('/finance/accounts/reconciliation');
    await expect(page).toHaveURL('/finance/accounts/reconciliation');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Accounts Transactions page', async ({ page }) => {
    await page.goto('/finance/accounts/transactions');
    await expect(page).toHaveURL('/finance/accounts/transactions');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Payroll Deductions page', async ({ page }) => {
    await page.goto('/finance/payroll/deductions');
    await expect(page).toHaveURL('/finance/payroll/deductions');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Payroll Rates page', async ({ page }) => {
    await page.goto('/finance/payroll/rates');
    await expect(page).toHaveURL('/finance/payroll/rates');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Budgets Procurement page', async ({ page }) => {
    await page.goto('/finance/budgets/procurement');
    await expect(page).toHaveURL('/finance/budgets/procurement');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Budgets Purchase Orders page', async ({ page }) => {
    await page.goto('/finance/budgets/purchase-orders');
    await expect(page).toHaveURL('/finance/budgets/purchase-orders');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Finance Settings Reminders page', async ({ page }) => {
    await page.goto('/finance/settings/reminders');
    await expect(page).toHaveURL('/finance/settings/reminders');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });
});
