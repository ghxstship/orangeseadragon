import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('PEOPLE Module — Deep Routes', () => {
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

  // Analytics
  test('should load People Analytics page', async ({ page }) => {
    await page.goto('/people/analytics');
    await expect(page).toHaveURL('/people/analytics');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Compliance
  test('should load People Compliance page', async ({ page }) => {
    await page.goto('/people/compliance');
    await expect(page).toHaveURL('/people/compliance');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Documents
  test('should load People Documents page', async ({ page }) => {
    await page.goto('/people/documents');
    await expect(page).toHaveURL('/people/documents');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Leave
  test('should load People Leave page', async ({ page }) => {
    await page.goto('/people/leave');
    await expect(page).toHaveURL('/people/leave');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Org Chart
  test('should load People Org page', async ({ page }) => {
    await page.goto('/people/org');
    await expect(page).toHaveURL('/people/org');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Portal
  test('should load People Portal page', async ({ page }) => {
    await page.goto('/people/portal');
    await expect(page).toHaveURL('/people/portal');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Rosters subpages
  test('should load Rosters Departments page', async ({ page }) => {
    await page.goto('/people/rosters/departments');
    await expect(page).toHaveURL('/people/rosters/departments');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Rosters Positions page', async ({ page }) => {
    await page.goto('/people/rosters/positions');
    await expect(page).toHaveURL('/people/rosters/positions');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Rosters Teams page', async ({ page }) => {
    await page.goto('/people/rosters/teams');
    await expect(page).toHaveURL('/people/rosters/teams');
    await expect(page.locator('body')).toBeVisible();
  });

  // Performance subpages
  test('should load Performance Feedback page', async ({ page }) => {
    await page.goto('/people/performance/feedback');
    await expect(page).toHaveURL('/people/performance/feedback');
    await expect(page.locator('body')).toBeVisible();
  });

  // Recruitment subpages
  test('should load Recruitment Applications page', async ({ page }) => {
    await page.goto('/people/recruitment/applications');
    await expect(page).toHaveURL('/people/recruitment/applications');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Recruitment Candidates page', async ({ page }) => {
    await page.goto('/people/recruitment/candidates');
    await expect(page).toHaveURL('/people/recruitment/candidates');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Recruitment Onboarding page', async ({ page }) => {
    await page.goto('/people/recruitment/onboarding');
    await expect(page).toHaveURL('/people/recruitment/onboarding');
    await expect(page.locator('body')).toBeVisible();
  });

  // Scheduling subpages
  test('should load Scheduling Availability page', async ({ page }) => {
    await page.goto('/people/scheduling/availability');
    await expect(page).toHaveURL('/people/scheduling/availability');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Scheduling Clock page', async ({ page }) => {
    await page.goto('/people/scheduling/clock');
    await expect(page).toHaveURL('/people/scheduling/clock');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Scheduling Crew Calls page', async ({ page }) => {
    await page.goto('/people/scheduling/crew-calls');
    await expect(page).toHaveURL('/people/scheduling/crew-calls');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Scheduling Open Shifts page', async ({ page }) => {
    await page.goto('/people/scheduling/open-shifts');
    await expect(page).toHaveURL('/people/scheduling/open-shifts');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Scheduling Shift Swaps page', async ({ page }) => {
    await page.goto('/people/scheduling/shift-swaps');
    await expect(page).toHaveURL('/people/scheduling/shift-swaps');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Scheduling Timekeeping page', async ({ page }) => {
    await page.goto('/people/scheduling/timekeeping');
    await expect(page).toHaveURL('/people/scheduling/timekeeping');
    await expect(page.locator('body')).toBeVisible();
  });

  // Training subpages
  test('should load Training Certifications page', async ({ page }) => {
    await page.goto('/people/training/certifications');
    await expect(page).toHaveURL('/people/training/certifications');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Training Compliance page', async ({ page }) => {
    await page.goto('/people/training/compliance');
    await expect(page).toHaveURL('/people/training/compliance');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Training Enrollments page', async ({ page }) => {
    await page.goto('/people/training/enrollments');
    await expect(page).toHaveURL('/people/training/enrollments');
    await expect(page.locator('body')).toBeVisible();
  });

  // Travel subpages
  test('should load Travel Flights page', async ({ page }) => {
    await page.goto('/people/travel/flights');
    await expect(page).toHaveURL('/people/travel/flights');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Travel Ground Transport page', async ({ page }) => {
    await page.goto('/people/travel/ground-transport');
    await expect(page).toHaveURL('/people/travel/ground-transport');
    await expect(page.locator('body')).toBeVisible();
  });
});
