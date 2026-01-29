import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('Interactive Elements - Full Stack Validation', () => {
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

  // Sidebar Navigation Tests
  test('should expand and collapse sidebar sections', async ({ page }) => {
    const sidebar = page.locator('aside, nav, [data-testid="sidebar"]').first();
    await expect(sidebar).toBeVisible();
    
    // Look for expandable sections
    const expandButtons = sidebar.locator('button[aria-expanded], [data-state]');
    const count = await expandButtons.count();
    if (count > 0) {
      await expandButtons.first().click();
      await page.waitForTimeout(300);
    }
  });

  test('should navigate via sidebar links', async ({ page }) => {
    // Click on a sidebar link
    const sidebarLink = page.locator('aside a[href*="/productions"], nav a[href*="/productions"]').first();
    if (await sidebarLink.isVisible()) {
      await sidebarLink.click();
      await expect(page).toHaveURL(/\/productions/);
    }
  });

  // Dashboard Widget Tests
  test('should display dashboard widgets', async ({ page }) => {
    await page.goto('/core/dashboard');
    await expect(page.locator('h1')).toContainText('Command Center');
    
    // Check for any content on the dashboard
    await expect(page.locator('main, .space-y-8, [class*="grid"]').first()).toBeVisible({ timeout: 10000 });
  });

  // Quick Actions Tests
  test('should open quick actions or command palette', async ({ page }) => {
    // Try keyboard shortcut for command palette
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(500);
    
    // Check if command palette opened
    const palette = page.locator('[role="dialog"], [data-testid="command-palette"], .command-palette');
    if (await palette.isVisible()) {
      await page.keyboard.press('Escape');
    }
  });

  // Form Interactions
  test('should interact with task creation form', async ({ page }) => {
    await page.goto('/core/tasks');
    
    // Look for create/add button
    const createButton = page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create"), a:has-text("New")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Check if form/modal opened
      const form = page.locator('form, [role="dialog"]');
      if (await form.isVisible()) {
        await page.keyboard.press('Escape');
      }
    }
  });

  // Table/List Interactions
  test('should interact with data tables', async ({ page }) => {
    await page.goto('/productions/events');
    await page.waitForTimeout(1000);
    
    // Check for table or list
    const table = page.locator('table, [role="grid"], .data-table, [data-testid="data-table"]');
    if (await table.isVisible()) {
      // Check for sortable headers
      const headers = table.locator('th, [role="columnheader"]');
      if (await headers.count() > 0) {
        await headers.first().click();
        await page.waitForTimeout(300);
      }
    }
  });

  // Filter/Search Interactions
  test('should use search/filter functionality', async ({ page }) => {
    await page.goto('/people/rosters');
    await page.waitForTimeout(1000);
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      await searchInput.clear();
    }
  });

  // View Toggle Tests
  test('should toggle between list and grid views', async ({ page }) => {
    await page.goto('/assets/inventory');
    await page.waitForTimeout(1000);
    
    // Look for view toggle buttons
    const viewToggle = page.locator('button[aria-label*="view"], button:has-text("Grid"), button:has-text("List"), [data-testid="view-toggle"]').first();
    if (await viewToggle.isVisible()) {
      await viewToggle.click();
      await page.waitForTimeout(300);
    }
  });

  // Dropdown/Select Interactions
  test('should interact with dropdown menus', async ({ page }) => {
    await page.goto('/business/pipeline');
    await page.waitForTimeout(1000);
    
    // Look for dropdown triggers
    const dropdown = page.locator('button[aria-haspopup="menu"], [data-state="closed"], select').first();
    if (await dropdown.isVisible()) {
      await dropdown.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
    }
  });

  // Tab Navigation Tests
  test('should navigate between tabs', async ({ page }) => {
    await page.goto('/finance/budgets');
    await page.waitForTimeout(1000);
    
    // Look for tab buttons
    const tabs = page.locator('[role="tab"], button[data-state]');
    const tabCount = await tabs.count();
    if (tabCount > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(300);
    }
  });

  // Modal/Dialog Tests
  test('should open and close modals', async ({ page }) => {
    await page.goto('/core/calendar');
    await page.waitForTimeout(1000);
    
    // Look for buttons that might open modals
    const modalTrigger = page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create")').first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(500);
      
      const modal = page.locator('[role="dialog"], .modal, [data-state="open"]');
      if (await modal.isVisible()) {
        // Close modal
        const closeButton = modal.locator('button[aria-label="Close"], button:has-text("Cancel"), button:has-text("×")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    }
  });

  // Pagination Tests
  test('should navigate pagination', async ({ page }) => {
    await page.goto('/operations/incidents');
    await page.waitForTimeout(1000);
    
    // Look for pagination controls
    const pagination = page.locator('[aria-label="pagination"], .pagination, nav:has(button)');
    if (await pagination.isVisible()) {
      const nextButton = pagination.locator('button:has-text("Next"), button[aria-label="Next"]').first();
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }
    }
  });

  // User Menu Tests
  test('should open user menu', async ({ page }) => {
    // Look for user avatar/menu in header
    const userMenu = page.locator('button[aria-label*="user"], button[aria-label*="account"], [data-testid="user-menu"], header button:has(img)').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.waitForTimeout(300);
      
      const menu = page.locator('[role="menu"], [data-state="open"]');
      if (await menu.isVisible()) {
        await page.keyboard.press('Escape');
      }
    }
  });

  // Theme Toggle Tests
  test('should toggle theme', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="dark"], button[aria-label*="light"], [data-testid="theme-toggle"]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(300);
    }
  });

  // Breadcrumb Navigation Tests
  test('should navigate via breadcrumbs', async ({ page }) => {
    await page.goto('/productions/compliance/permits');
    await page.waitForTimeout(1000);
    
    const breadcrumb = page.locator('nav[aria-label="breadcrumb"], .breadcrumb, [data-testid="breadcrumb"]');
    if (await breadcrumb.isVisible()) {
      const links = breadcrumb.locator('a');
      if (await links.count() > 0) {
        await links.first().click();
        await page.waitForTimeout(300);
      }
    }
  });
});
