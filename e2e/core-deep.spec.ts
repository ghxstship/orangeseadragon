import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('CORE Module — Deep Routes', () => {
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

  // Tasks subpages
  test('should load Tasks page', async ({ page }) => {
    await page.goto('/core/tasks');
    await expect(page).toHaveURL('/core/tasks');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load My Tasks page', async ({ page }) => {
    await page.goto('/core/tasks/my-tasks');
    await expect(page).toHaveURL('/core/tasks/my-tasks');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load My Timesheet page', async ({ page }) => {
    await page.goto('/core/tasks/my-timesheet');
    await expect(page).toHaveURL('/core/tasks/my-timesheet');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Task Lists page', async ({ page }) => {
    await page.goto('/core/tasks/lists');
    await expect(page).toHaveURL('/core/tasks/lists');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load New Task List page', async ({ page }) => {
    await page.goto('/core/tasks/lists/new');
    await expect(page).toHaveURL('/core/tasks/lists/new');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load New Task page', async ({ page }) => {
    await page.goto('/core/tasks/new');
    await expect(page).toHaveURL('/core/tasks/new');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Task Checklists page', async ({ page }) => {
    await page.goto('/core/tasks/checklists');
    await expect(page).toHaveURL('/core/tasks/checklists');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Task Sprints page', async ({ page }) => {
    await page.goto('/core/tasks/sprints');
    await expect(page).toHaveURL('/core/tasks/sprints');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Task Timeline page', async ({ page }) => {
    await page.goto('/core/tasks/timeline');
    await expect(page).toHaveURL('/core/tasks/timeline');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Task Workload page', async ({ page }) => {
    await page.goto('/core/tasks/workload');
    await expect(page).toHaveURL('/core/tasks/workload');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Calendar
  test('should load Calendar page', async ({ page }) => {
    await page.goto('/core/calendar');
    await expect(page).toHaveURL('/core/calendar');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Inbox
  test('should load Inbox page', async ({ page }) => {
    await page.goto('/core/inbox');
    await expect(page).toHaveURL('/core/inbox');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Messages
  test('should load Messages page', async ({ page }) => {
    await page.goto('/core/messages');
    await expect(page).toHaveURL('/core/messages');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Documents
  test('should load Documents page', async ({ page }) => {
    await page.goto('/core/documents');
    await expect(page).toHaveURL('/core/documents');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Documents Templates page', async ({ page }) => {
    await page.goto('/core/documents/templates');
    await expect(page).toHaveURL('/core/documents/templates');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Workflows
  test('should load Workflows page', async ({ page }) => {
    await page.goto('/core/workflows');
    await expect(page).toHaveURL('/core/workflows');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load New Workflow page', async ({ page }) => {
    await page.goto('/core/workflows/new');
    await expect(page).toHaveURL('/core/workflows/new');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Workflow Automations page', async ({ page }) => {
    await page.goto('/core/workflows/automations');
    await expect(page).toHaveURL('/core/workflows/automations');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load Workflow Triggers page', async ({ page }) => {
    await page.goto('/core/workflows/triggers');
    await expect(page).toHaveURL('/core/workflows/triggers');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Dashboard Customize
  test('should load Dashboard Customize page', async ({ page }) => {
    await page.goto('/core/dashboard/customize');
    await expect(page).toHaveURL('/core/dashboard/customize');
    await expect(page.locator('main, [data-testid], article').first()).toBeVisible({ timeout: 10000 });
  });

  // Inbox subpages
  test('should load Inbox Approvals page', async ({ page }) => {
    await page.goto('/core/inbox/approvals');
    await expect(page).toHaveURL('/core/inbox/approvals');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Inbox Notifications page', async ({ page }) => {
    await page.goto('/core/inbox/notifications');
    await expect(page).toHaveURL('/core/inbox/notifications');
    await expect(page.locator('body')).toBeVisible();
  });

  // Documents subpages
  test('should load Documents Folders page', async ({ page }) => {
    await page.goto('/core/documents/folders');
    await expect(page).toHaveURL('/core/documents/folders');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load Documents Upload page', async ({ page }) => {
    await page.goto('/core/documents/upload');
    await expect(page).toHaveURL('/core/documents/upload');
    await expect(page.locator('body')).toBeVisible();
  });

  // Calendar New
  test('should load Calendar New page', async ({ page }) => {
    await page.goto('/core/calendar/new');
    await expect(page).toHaveURL('/core/calendar/new');
    await expect(page.locator('body')).toBeVisible();
  });
});
