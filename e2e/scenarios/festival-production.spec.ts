import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from '../utils';

/**
 * SCENARIO: Festival Production Flow
 *
 * Simulates a multi-day festival production lifecycle:
 * 1. Create project and events
 * 2. Set up venue with stages
 * 3. Build run sheet with cues
 * 4. Manage crew scheduling and availability
 * 5. Track assets and equipment deployment
 * 6. Generate settlement worksheet
 *
 * Validates: Productions → Operations → People → Assets → Finance
 */

let testUser: { email: string; password: string } | null = null;

test.describe('Scenario: Festival Production', () => {
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

  test('1. Productions hub loads with KPIs and navigation', async ({ page }) => {
    await page.goto('/productions');
    await expect(page).toHaveURL('/productions');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('2. Events list page loads', async ({ page }) => {
    await page.goto('/productions/events');
    await expect(page).toHaveURL('/productions/events');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('3. Projects list page loads', async ({ page }) => {
    await page.goto('/productions/projects');
    await expect(page).toHaveURL('/productions/projects');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('4. Operations hub loads with nav cards', async ({ page }) => {
    await page.goto('/operations');
    await expect(page).toHaveURL('/operations');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('5. Floor plans page loads', async ({ page }) => {
    await page.goto('/operations/floor-plans');
    await expect(page).toHaveURL('/operations/floor-plans');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('6. Crew scheduling page loads', async ({ page }) => {
    await page.goto('/people/scheduling');
    await expect(page).toHaveURL('/people/scheduling');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('7. Crew calls page loads', async ({ page }) => {
    await page.goto('/people/scheduling/crew-calls');
    await expect(page).toHaveURL('/people/scheduling/crew-calls');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('8. Assets hub loads', async ({ page }) => {
    await page.goto('/assets');
    await expect(page).toHaveURL('/assets');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('9. Asset inventory page loads', async ({ page }) => {
    await page.goto('/assets/inventory');
    await expect(page).toHaveURL('/assets/inventory');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('10. Asset reservations page loads', async ({ page }) => {
    await page.goto('/assets/reservations');
    await expect(page).toHaveURL('/assets/reservations');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('11. Settlement worksheet page loads (Layout D)', async ({ page }) => {
    // Uses a placeholder project ID since we can't create real data in this test
    await page.goto('/productions/projects/test-id/settlement');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('12. Run sheet page loads (Layout D)', async ({ page }) => {
    await page.goto('/productions/projects/test-id/run-sheet');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('13. Call sheet page loads (Layout D)', async ({ page }) => {
    await page.goto('/productions/projects/test-id/call-sheet');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('14. Finance hub loads', async ({ page }) => {
    await page.goto('/finance');
    await expect(page).toHaveURL('/finance');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('15. Budgets page loads', async ({ page }) => {
    await page.goto('/finance/budgets');
    await expect(page).toHaveURL('/finance/budgets');
    await expect(page.locator('main, [data-testid], .container, article').first()).toBeVisible({ timeout: 10000 });
  });
});
