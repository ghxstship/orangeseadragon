
import { createClient } from '@supabase/supabase-js';
import { Page, expect } from '@playwright/test';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function dismissCookieConsent(page: Page) {
    const banner = page.locator('[aria-label="Cookie consent"]');
    if (await banner.isVisible({ timeout: 3000 }).catch(() => false)) {
        const acceptBtn = banner.getByRole('button', { name: /accept/i });
        if (await acceptBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await acceptBtn.click();
            await banner.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
        }
    }
}

export async function loginUser(page: Page, email: string, password: string) {
    for (let attempt = 0; attempt < 2; attempt++) {
        await page.goto('/login', { waitUntil: 'domcontentloaded' });
        await dismissCookieConsent(page);
        await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 10000 });
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        await dismissCookieConsent(page);
        await page.press('input[type="password"]', 'Enter');
        try {
            await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
            return;
        } catch {
            if (attempt === 1) throw new Error('Login failed after 2 attempts');
        }
    }
}

export async function createTestUser() {
    if (!supabaseServiceKey) {
        console.warn('SUPABASE_SERVICE_ROLE_KEY is not set.');
        return null;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const email = `e2e_test_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
    const password = 'password123';
    const onboardingCompletedAt = new Date().toISOString();

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const { data, error } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name: 'E2E Test User',
                    onboarding_completed: true,
                    onboarding_completed_at: onboardingCompletedAt,
                }
            });

            if (error) {
                if (attempt === 3) {
                    console.error('Error creating user:', error);
                    return null;
                }
                await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
                continue;
            }

            return { email, password, userId: data.user.id };
        } catch (err) {
            if (attempt === 3) {
                console.error('Exception creating user:', err);
                return null;
            }
            await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        }
    }

    return null;
}
