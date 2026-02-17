import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('OPERATIONS Module — Deep Routes', () => {
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

  // Events subpages
  test('should load Operations Events page', async ({ page }) => {
    await page.goto('/operations/events');
    await expect(page).toHaveURL('/operations/events');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Events Crew Calls page', async ({ page }) => {
    await page.goto('/operations/events/crew-calls');
    await expect(page).toHaveURL('/operations/events/crew-calls');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Events Runsheets page', async ({ page }) => {
    await page.goto('/operations/events/runsheets');
    await expect(page).toHaveURL('/operations/events/runsheets');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Events Talent Bookings page', async ({ page }) => {
    await page.goto('/operations/events/talent-bookings');
    await expect(page).toHaveURL('/operations/events/talent-bookings');
    await expect(page.locator('body')).toBeVisible();
  });

  // Incidents subpages
  test('should load Incidents Control Room page', async ({ page }) => {
    await page.goto('/operations/incidents/control-room');
    await expect(page).toHaveURL('/operations/incidents/control-room');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Incidents Punch Lists page', async ({ page }) => {
    await page.goto('/operations/incidents/punch-lists');
    await expect(page).toHaveURL('/operations/incidents/punch-lists');
    await expect(page.locator('body')).toBeVisible();
  });

  // Venues subpages
  test('should load Venues Stages page', async ({ page }) => {
    await page.goto('/operations/venues/stages');
    await expect(page).toHaveURL('/operations/venues/stages');
    await expect(page.locator('body')).toBeVisible();
  });

  // Comms subpages
  test('should load Comms Daily Reports page', async ({ page }) => {
    await page.goto('/operations/comms/daily-reports');
    await expect(page).toHaveURL('/operations/comms/daily-reports');
    await expect(page.locator('body')).toBeVisible();
  });

  // Crew Checkins
  test('should load Crew Checkins Kiosk page', async ({ page }) => {
    await page.goto('/operations/crew-checkins/kiosk');
    await expect(page).toHaveURL('/operations/crew-checkins/kiosk');
    await expect(page.locator('body')).toBeVisible();
  });

  // Runsheets
  test('should load Runsheets page', async ({ page }) => {
    await page.goto('/operations/runsheets');
    await expect(page).toHaveURL('/operations/runsheets');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });
});
