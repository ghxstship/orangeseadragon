
import { test, expect } from '@playwright/test';
import { createTestUser } from './utils';

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

        await page.goto('/login');
        await page.fill('input[type="email"]', testUser.email);
        await page.fill('input[type="password"]', testUser.password);
        await page.click('button[type="submit"]');

        // Validate redirect to dashboard
        await expect(page).toHaveURL(/\/core\/dashboard/);
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('/login');
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
        await page.fill('input#name', 'Test User');
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', 'password123'); // Minimum 8 chars

        // Checkbox is a button in Radix UI
        await page.locator('#acceptTerms').click();

        await page.click('button[type="submit"]');

        // Validate redirect to verify-email
        // Note: Success toast "Account created! Please check your email." should appear.
        // Wait for URL change primarily
        await expect(page).toHaveURL('/verify-email');
    });

    test('should navigate to forgot password page', async ({ page }) => {
        await page.goto('/login');
        await page.click('text=Forgot password?');
        await expect(page).toHaveURL('/forgot-password');
    });

});
