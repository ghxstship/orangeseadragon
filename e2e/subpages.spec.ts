import { test, expect } from '@playwright/test';
import { createTestUser, loginUser } from './utils';

let testUser: { email: string; password: string } | null = null;

test.describe('Subpage Routes - Full Stack Validation', () => {
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

  // PRODUCTIONS subpages
  test('should load /productions/compliance/permits', async ({ page }) => {
    await page.goto('/productions/compliance/permits');
    await expect(page).toHaveURL('/productions/compliance/permits');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /productions/compliance/licenses', async ({ page }) => {
    await page.goto('/productions/compliance/licenses');
    await expect(page).toHaveURL('/productions/compliance/licenses');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /productions/compliance/certificates', async ({ page }) => {
    await page.goto('/productions/compliance/certificates');
    await expect(page).toHaveURL('/productions/compliance/certificates');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /productions/advancing/riders', async ({ page }) => {
    await page.goto('/productions/advancing/riders');
    await expect(page).toHaveURL('/productions/advancing/riders');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /productions/advancing/tech-specs', async ({ page }) => {
    await page.goto('/productions/advancing/tech-specs');
    await expect(page).toHaveURL('/productions/advancing/tech-specs');
    await expect(page.locator('body')).toBeVisible();
  });

  // OPERATIONS subpages
  test('should load /operations/venues/floor-plans', async ({ page }) => {
    await page.goto('/operations/venues/floor-plans');
    await expect(page).toHaveURL('/operations/venues/floor-plans');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /operations/venues/zones', async ({ page }) => {
    await page.goto('/operations/venues/zones');
    await expect(page).toHaveURL('/operations/venues/zones');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /operations/venues/checkpoints', async ({ page }) => {
    await page.goto('/operations/venues/checkpoints');
    await expect(page).toHaveURL('/operations/venues/checkpoints');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /operations/comms/radio', async ({ page }) => {
    await page.goto('/operations/comms/radio');
    await expect(page).toHaveURL('/operations/comms/radio');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /operations/comms/weather', async ({ page }) => {
    await page.goto('/operations/comms/weather');
    await expect(page).toHaveURL('/operations/comms/weather');
    await expect(page.locator('body')).toBeVisible();
  });

  // PEOPLE subpages
  test('should load /people/travel/bookings', async ({ page }) => {
    await page.goto('/people/travel/bookings');
    await expect(page).toHaveURL('/people/travel/bookings');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /people/travel/accommodations', async ({ page }) => {
    await page.goto('/people/travel/accommodations');
    await expect(page).toHaveURL('/people/travel/accommodations');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /people/training/courses', async ({ page }) => {
    await page.goto('/people/training/courses');
    await expect(page).toHaveURL('/people/training/courses');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /people/training/materials', async ({ page }) => {
    await page.goto('/people/training/materials');
    await expect(page).toHaveURL('/people/training/materials');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /people/scheduling/shifts', async ({ page }) => {
    await page.goto('/people/scheduling/shifts');
    await expect(page).toHaveURL('/people/scheduling/shifts');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /people/performance/reviews', async ({ page }) => {
    await page.goto('/people/performance/reviews');
    await expect(page).toHaveURL('/people/performance/reviews');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /people/performance/goals', async ({ page }) => {
    await page.goto('/people/performance/goals');
    await expect(page).toHaveURL('/people/performance/goals');
    await expect(page.locator('body')).toBeVisible();
  });

  // ASSETS subpages
  test('should load /assets/catalog/categories', async ({ page }) => {
    await page.goto('/assets/catalog/categories');
    await expect(page).toHaveURL('/assets/catalog/categories');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /assets/locations/warehouses', async ({ page }) => {
    await page.goto('/assets/locations/warehouses');
    await expect(page).toHaveURL('/assets/locations/warehouses');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /assets/locations/staging', async ({ page }) => {
    await page.goto('/assets/locations/staging');
    await expect(page).toHaveURL('/assets/locations/staging');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /assets/logistics/shipments', async ({ page }) => {
    await page.goto('/assets/logistics/shipments');
    await expect(page).toHaveURL('/assets/logistics/shipments');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /assets/logistics/vehicles', async ({ page }) => {
    await page.goto('/assets/logistics/vehicles');
    await expect(page).toHaveURL('/assets/logistics/vehicles');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /assets/status/check', async ({ page }) => {
    await page.goto('/assets/status/check');
    await expect(page).toHaveURL('/assets/status/check');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /assets/status/service', async ({ page }) => {
    await page.goto('/assets/status/service');
    await expect(page).toHaveURL('/assets/status/service');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /assets/maintenance/scheduled', async ({ page }) => {
    await page.goto('/assets/maintenance/scheduled');
    await expect(page).toHaveURL('/assets/maintenance/scheduled');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /assets/maintenance/repairs', async ({ page }) => {
    await page.goto('/assets/maintenance/repairs');
    await expect(page).toHaveURL('/assets/maintenance/repairs');
    await expect(page.locator('body')).toBeVisible();
  });

  // BUSINESS subpages
  test('should load /business/pipeline/leads', async ({ page }) => {
    await page.goto('/business/pipeline/leads');
    await expect(page).toHaveURL('/business/pipeline/leads');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /business/pipeline/opportunities', async ({ page }) => {
    await page.goto('/business/pipeline/opportunities');
    await expect(page).toHaveURL('/business/pipeline/opportunities');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /business/companies/contacts', async ({ page }) => {
    await page.goto('/business/companies/contacts');
    await expect(page).toHaveURL('/business/companies/contacts');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /business/products/list', async ({ page }) => {
    await page.goto('/business/products/list');
    await expect(page).toHaveURL('/business/products/list');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /business/products/services', async ({ page }) => {
    await page.goto('/business/products/services');
    await expect(page).toHaveURL('/business/products/services');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /business/campaigns/email', async ({ page }) => {
    await page.goto('/business/campaigns/email');
    await expect(page).toHaveURL('/business/campaigns/email');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /business/campaigns/content', async ({ page }) => {
    await page.goto('/business/campaigns/content');
    await expect(page).toHaveURL('/business/campaigns/content');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /business/campaigns/forms', async ({ page }) => {
    await page.goto('/business/campaigns/forms');
    await expect(page).toHaveURL('/business/campaigns/forms');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /business/brand/logos', async ({ page }) => {
    await page.goto('/business/brand/logos');
    await expect(page).toHaveURL('/business/brand/logos');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /business/brand/colors', async ({ page }) => {
    await page.goto('/business/brand/colors');
    await expect(page).toHaveURL('/business/brand/colors');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /business/brand/typography', async ({ page }) => {
    await page.goto('/business/brand/typography');
    await expect(page).toHaveURL('/business/brand/typography');
    await expect(page.locator('body')).toBeVisible();
  });

  // FINANCE subpages
  test('should load /finance/budgets/line-items', async ({ page }) => {
    await page.goto('/finance/budgets/line-items');
    await expect(page).toHaveURL('/finance/budgets/line-items');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /finance/invoices/line-items', async ({ page }) => {
    await page.goto('/finance/invoices/line-items');
    await expect(page).toHaveURL('/finance/invoices/line-items');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /finance/invoices/payments', async ({ page }) => {
    await page.goto('/finance/invoices/payments');
    await expect(page).toHaveURL('/finance/invoices/payments');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /finance/payments/incoming', async ({ page }) => {
    await page.goto('/finance/payments/incoming');
    await expect(page).toHaveURL('/finance/payments/incoming');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /finance/payments/outgoing', async ({ page }) => {
    await page.goto('/finance/payments/outgoing');
    await expect(page).toHaveURL('/finance/payments/outgoing');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /finance/payroll/stubs', async ({ page }) => {
    await page.goto('/finance/payroll/stubs');
    await expect(page).toHaveURL('/finance/payroll/stubs');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /finance/accounts/gl', async ({ page }) => {
    await page.goto('/finance/accounts/gl');
    await expect(page).toHaveURL('/finance/accounts/gl');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /finance/accounts/bank', async ({ page }) => {
    await page.goto('/finance/accounts/bank');
    await expect(page).toHaveURL('/finance/accounts/bank');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /finance/reports/pnl', async ({ page }) => {
    await page.goto('/finance/reports/pnl');
    await expect(page).toHaveURL('/finance/reports/pnl');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /finance/reports/cash-flow', async ({ page }) => {
    await page.goto('/finance/reports/cash-flow');
    await expect(page).toHaveURL('/finance/reports/cash-flow');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /finance/reports/ar-ap', async ({ page }) => {
    await page.goto('/finance/reports/ar-ap');
    await expect(page).toHaveURL('/finance/reports/ar-ap');
    await expect(page.locator('body')).toBeVisible();
  });
});
