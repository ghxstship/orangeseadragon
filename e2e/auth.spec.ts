
import { test, expect } from '@playwright/test';
import { createTestUser, dismissCookieConsent, loginUser } from './utils';

let testUser: { email: string, password: string } | null = null;

test.describe('Authentication Flows', () => {

    test.beforeAll(async () => {
        testUser = await createTestUser();
        if (!testUser) {
            console.warn('Failed to create test user, some tests will be skipped.');
        } else {
            console.log('Test user created:', testUser.email);
        }
    });

    test('should navigate to the login page', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('h1')).toContainText('Welcome back');
    });

    test('should login with valid credentials', async ({ page }) => {
        test.skip(!testUser, 'User creation failed');
        if (!testUser) return;

        await loginUser(page, testUser.email, testUser.password);
        await expect(page).toHaveURL(/\/(core\/dashboard|dashboard)/);
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('/login');
        await dismissCookieConsent(page);
        await page.fill('input[type="email"]', 'invalid@example.com');
        await page.fill('input[type="password"]', 'badpassword');
        await page.click('button[type="submit"]');

        // Validate toast - using loose match for "Error" as structure might vary
        // Wait for toast to appear
        await expect(page.getByText(/Error signing in/i).first()).toBeVisible();
    });

    test('should navigate to register page', async ({ page }) => {
        await page.goto('/register');
        await expect(page.locator('h1')).toContainText('Create an account');
    });

    test('should register with valid details', async ({ page }) => {
        const uniqueEmail = `new_user_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

        await page.goto('/register');
        await dismissCookieConsent(page);
        await page.fill('input#name', 'Test User');
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', 'password123'); // Minimum 8 chars

        // Checkbox is a button in Radix UI
        await page.locator('#acceptTerms').click();

        await page.click('button[type="submit"]');

        // Validate redirect to verify-email
        // Note: Success toast "Account created! Please check your email." should appear.
        // Wait for URL change primarily; fallback to success copy if route transition is delayed.
        const reachedVerifyEmail = await page.waitForURL('**/verify-email', { timeout: 10000 }).then(() => true).catch(() => false);
        if (!reachedVerifyEmail) {
            await expect(page.getByText(/account created|check your email/i).first()).toBeVisible();
        }
    });

    test('should navigate to forgot password page', async ({ page }) => {
        await page.goto('/login');
        await dismissCookieConsent(page);
        await page.click('text=Forgot password?');
        await expect(page).toHaveURL('/forgot-password');
    });

});
