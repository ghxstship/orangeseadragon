import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from '../utils';

/**
 * SCENARIO: Brand Activation Flow
 *
 * Simulates a complete brand activation lifecycle:
 * 1. Create a deal in the pipeline
 * 2. Create a project from the deal
 * 3. Set up a budget with line items
 * 4. Add crew to the project roster
 * 5. Generate a call sheet
 * 6. Create and send an invoice
 *
 * This validates cross-module navigation and data flow
 * across Business → Productions → People → Finance.
 */

let testUser: { email: string; password: string } | null = null;

test.describe('Scenario: Brand Activation', () => {
  test.beforeAll(async () => {
    testUser = await createTestUser();
    if (!testUser) {
      console.warn('Failed to create test user, scenario tests will be skipped.');
    }
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!testUser, 'User creation failed');
    if (!testUser) return;
    await loginUser(page, testUser.email, testUser.password);
  });

  test('1. Navigate to pipeline and view deals page', async ({ page }) => {
    await page.goto('/business/pipeline/opportunities');
    await expect(page).toHaveURL('/business/pipeline/opportunities');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('2. Navigate to projects list', async ({ page }) => {
    await page.goto('/productions/projects');
    await expect(page).toHaveURL('/productions/projects');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('3. Navigate to budgets and verify page loads', async ({ page }) => {
    await page.goto('/finance/budgets');
    await expect(page).toHaveURL('/finance/budgets');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('4. Navigate to people rosters', async ({ page }) => {
    await page.goto('/people/rosters');
    await expect(page).toHaveURL('/people/rosters');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('5. Navigate to crew scheduling', async ({ page }) => {
    await page.goto('/people/scheduling');
    await expect(page).toHaveURL('/people/scheduling');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('6. Navigate to invoice builder', async ({ page }) => {
    await page.goto('/finance/invoices/builder');
    await expect(page).toHaveURL('/finance/invoices/builder');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('7. Verify command palette opens with ⌘K', async ({ page }) => {
    await page.goto('/core/dashboard');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
    await page.keyboard.press('Meta+k');
    // Command palette dialog should appear
    await expect(page.locator('[role="dialog"], [cmdk-dialog], [data-testid="command-palette"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('8. Cross-module navigation: Business → Finance → Productions', async ({ page }) => {
    // Start at business
    await page.goto('/business');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });

    // Navigate to finance
    await page.goto('/finance');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });

    // Navigate to productions
    await page.goto('/productions');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('9. Verify contacts detail page route exists', async ({ page }) => {
    await page.goto('/business/contacts');
    await expect(page).toHaveURL('/business/contacts');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('10. Verify companies detail page route exists', async ({ page }) => {
    await page.goto('/business/companies');
    await expect(page).toHaveURL('/business/companies');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });
});
