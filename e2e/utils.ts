
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

async function waitForLoginFormHydration(page: Page) {
    const passwordInput = page.locator('#password');
    const togglePasswordButton = page.getByRole('button', { name: /show password|hide password/i });
    const submitButton = page.locator('button[type="submit"]');

    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await togglePasswordButton.waitFor({ state: 'visible', timeout: 10000 });
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });

    // Ensure React handlers are wired (pre-hydration submit can cause native GET /login?).
    let hydrationDetected = false;
    for (let attempt = 0; attempt < 3; attempt++) {
        await togglePasswordButton.dispatchEvent('click');
        if ((await passwordInput.getAttribute('type')) === 'text') {
            hydrationDetected = true;
            break;
        }
        await page.waitForTimeout(250);
    }

    if (hydrationDetected) {
        await togglePasswordButton.dispatchEvent('click');
        await expect(passwordInput).toHaveAttribute('type', 'password', { timeout: 2000 });
    }

    // Safari/WebKit can miss immediate post-hydration submits; keep this delay bounded.
    await page.waitForTimeout(800);
}

export async function loginUser(page: Page, email: string, password: string) {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const requestFailures: string[] = [];

    const onPageError = (error: Error) => {
        if (pageErrors.length < 5) {
            pageErrors.push(error.message);
        }
    };

    const onConsole = (message: { type(): string; text(): string }) => {
        if (message.type() === 'error' && consoleErrors.length < 5) {
            consoleErrors.push(message.text());
        }
    };

    const onRequestFailed = (request: { method(): string; url(): string; failure(): { errorText?: string } | null }) => {
        if (requestFailures.length < 5) {
            requestFailures.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'unknown'}`);
        }
    };

    page.on('pageerror', onPageError);
    page.on('console', onConsole);
    page.on('requestfailed', onRequestFailed);

    try {
        for (let attempt = 0; attempt < 2; attempt++) {
            await page.goto('/login', { waitUntil: 'domcontentloaded' });
            await page.waitForLoadState('networkidle');
            await dismissCookieConsent(page);
            await page.locator('#email').waitFor({ state: 'visible', timeout: 10000 });
            await waitForLoginFormHydration(page);
            await page.fill('#email', email);
            await page.fill('#password', password);
            await dismissCookieConsent(page);
            await page.click('button[type="submit"]');
            try {
                await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
                return;
            } catch {
                if (attempt === 1) {
                    const cookieSnapshot = await page.evaluate(() => document.cookie);
                    const toastText = await page.locator('[role="status"], [role="alert"]').first().textContent().catch(() => null);
                    throw new Error(
                        `Login failed after 2 attempts (current URL: ${page.url()}, cookies: ${cookieSnapshot || '<none>'}, toast: ${toastText || '<none>'}, pageErrors: ${pageErrors.join(' | ') || '<none>'}, consoleErrors: ${consoleErrors.join(' | ') || '<none>'}, requestFailures: ${requestFailures.join(' | ') || '<none>'})`
                    );
                }
            }
        }
    } finally {
        page.off('pageerror', onPageError);
        page.off('console', onConsole);
        page.off('requestfailed', onRequestFailed);
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
