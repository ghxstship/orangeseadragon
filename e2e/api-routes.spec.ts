import { test, expect } from '@playwright/test';

test.describe('API Routes — Auth Guard Validation', () => {
  const protectedGetRoutes = [
    '/api/projects',
    '/api/tasks',
    '/api/people',
    '/api/invoices',
    '/api/budgets',
    '/api/companies',
    '/api/contacts',
    '/api/deals',
    '/api/assets',
    '/api/events',
    '/api/expenses',
    '/api/inbox',
    '/api/activity',
    '/api/comments',
    '/api/files',
    '/api/clock-entries',
    '/api/currencies',
    '/api/settings/platform',
    '/api/certification-alerts',
    '/api/certifications/summary',
    '/api/employee-certifications',
    '/api/expense-approval-requests',
    '/api/email-templates',
    '/api/billing/subscription',
    '/api/privacy/export',
    '/api/privacy/consent',
    '/api/dashboard-layouts',
    '/api/v1/notifications',
  ];

  for (const route of protectedGetRoutes) {
    test(`GET ${route} requires authentication`, async ({ request }) => {
      const response = await request.get(route);
      expect(
        [401, 403],
        `${route} should require authentication`
      ).toContain(response.status());
    });
  }

  const protectedPostRoutes = [
    '/api/privacy/delete-request',
    '/api/certifications/send-reminder',
    '/api/notifications/send-reminder',
    '/api/geofences/check',
  ];

  for (const route of protectedPostRoutes) {
    test(`POST ${route} requires authentication`, async ({ request }) => {
      const response = await request.post(route, {
        data: {},
        headers: { 'Content-Type': 'application/json' },
      });
      expect(
        [401, 403],
        `${route} should require authentication`
      ).toContain(response.status());
    });
  }
});

test.describe('API Routes — Health Check', () => {
  test('GET /api/health returns 200', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('status');
  });
});

test.describe('API Routes — Error Envelope', () => {
  test('unauthenticated requests return standard error envelope', async ({ request }) => {
    const response = await request.get('/api/projects');
    expect([401, 403]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });
});
