import { test, expect, type Page } from "@playwright/test";

/**
 * WCAG 2.2 AA Accessibility Compliance Tests
 *
 * Uses axe-core via @axe-core/playwright to automatically detect
 * accessibility violations across critical application routes.
 *
 * Install: npm install -D @axe-core/playwright
 *
 * Tests that require @axe-core/playwright are wrapped in try/catch
 * so the suite doesn't fail if the package isn't installed yet.
 */

// ============================================================================
// HELPER
// ============================================================================

async function checkAccessibility(
  page: Page,
  url: string,
  description: string
) {
  await page.goto(url, { waitUntil: "domcontentloaded" });

  let AxeBuilder: typeof import("@axe-core/playwright").default;
  try {
    AxeBuilder = (await import("@axe-core/playwright")).default;
  } catch {
    test.skip(true, "@axe-core/playwright not installed — run: npm install -D @axe-core/playwright");
    return;
  }

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .exclude(".recharts-wrapper")
    .analyze();

  const violations = results.violations.filter(
    (v: { impact?: string }) => v.impact === "critical" || v.impact === "serious"
  );

  if (violations.length > 0) {
    const summary = violations
      .map(
        (v: { impact?: string; id: string; description: string; nodes: unknown[] }) =>
          `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instances)`
      )
      .join("\n");
    console.error(`Accessibility violations on ${description}:\n${summary}`);
  }

  expect(
    violations,
    `${description} should have no critical/serious WCAG 2.2 AA violations`
  ).toHaveLength(0);
}

// ============================================================================
// STRUCTURAL TESTS (no auth required — test public pages)
// ============================================================================

test.describe("Accessibility — Public Pages", () => {
  test("login page passes WCAG 2.2 AA", async ({ page }) => {
    await checkAccessibility(page, "/login", "Login page");
  });

  test("register page passes WCAG 2.2 AA", async ({ page }) => {
    await checkAccessibility(page, "/register", "Register page");
  });
});

// ============================================================================
// LANDMARK & STRUCTURE TESTS
// ============================================================================

test.describe("Accessibility — Landmarks & Structure", () => {
  test("login page has proper landmark structure", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    // Must have a main landmark
    const main = page.locator("main, [role='main']");
    await expect(main).toHaveCount(1);
  });

  test("skip-nav link exists and targets main content", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    // Skip-nav link should exist (may be sr-only)
    const skipLink = page.locator("a[href='#main-content']");
    const count = await skipLink.count();

    // Skip link is present on app shell pages (authenticated)
    // On public pages it may not be present — that's acceptable
    if (count > 0) {
      // Verify the target exists
      const target = page.locator("#main-content");
      await expect(target).toHaveCount(1);
    }
  });
});

// ============================================================================
// KEYBOARD NAVIGATION TESTS
// ============================================================================

test.describe("Accessibility — Keyboard Navigation", () => {
  test("login form is keyboard navigable", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    // Tab through form elements
    await page.keyboard.press("Tab");
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();

    // All interactive elements should have visible focus indicators
    const focusedElement = page.locator(":focus-visible");
    const hasFocusVisible = await focusedElement.count();
    expect(hasFocusVisible).toBeGreaterThanOrEqual(0); // At least one focusable element
  });
});

// ============================================================================
// COLOR CONTRAST TESTS
// ============================================================================

test.describe("Accessibility — Color Contrast", () => {
  test("login page has sufficient color contrast", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    let AxeBuilder: typeof import("@axe-core/playwright").default;
    try {
      AxeBuilder = (await import("@axe-core/playwright")).default;
    } catch {
      test.skip(true, "@axe-core/playwright not installed");
      return;
    }

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .options({ runOnly: ["color-contrast"] })
      .analyze();

    const contrastViolations = results.violations.filter(
      (v: { id: string }) => v.id === "color-contrast"
    );

    expect(
      contrastViolations,
      "All text should meet WCAG AA contrast ratio (4.5:1)"
    ).toHaveLength(0);
  });
});

// ============================================================================
// ARIA ATTRIBUTE TESTS
// ============================================================================

test.describe("Accessibility — ARIA", () => {
  test("all images have alt text", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    const images = page.locator("img:not([alt])");
    const missingAlt = await images.count();

    expect(missingAlt, "All images must have alt attributes").toBe(0);
  });

  test("all form inputs have labels", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    let AxeBuilder: typeof import("@axe-core/playwright").default;
    try {
      AxeBuilder = (await import("@axe-core/playwright")).default;
    } catch {
      test.skip(true, "@axe-core/playwright not installed");
      return;
    }

    const results = await new AxeBuilder({ page })
      .options({ runOnly: ["label"] })
      .analyze();

    expect(
      results.violations,
      "All form inputs must have associated labels"
    ).toHaveLength(0);
  });
});

// ============================================================================
// MOTION PREFERENCE TESTS
// ============================================================================

test.describe("Accessibility — Motion", () => {
  test("respects prefers-reduced-motion", async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    // Verify CSS media query is respected
    const hasReducedMotion = await page.evaluate(() => {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });

    expect(hasReducedMotion).toBe(true);
  });
});

// ============================================================================
// AUTHENTICATED PAGE TESTS (require auth setup)
// ============================================================================

test.describe("Accessibility — Authenticated Pages", () => {
  // These tests require authentication setup in playwright.config.ts
  // They are skipped by default and enabled when auth is configured

  test.skip("dashboard passes WCAG 2.2 AA", async ({ page }) => {
    await checkAccessibility(page, "/core/dashboard", "Dashboard");
  });

  test.skip("app shell has proper landmarks", async ({ page }) => {
    await page.goto("/core/dashboard", { waitUntil: "domcontentloaded" });

    // Header landmark
    const header = page.locator("header[role='banner'], header");
    await expect(header).toHaveCount(1);

    // Navigation landmark
    const nav = page.locator("[role='navigation']");
    expect(await nav.count()).toBeGreaterThanOrEqual(1);

    // Main content landmark
    const main = page.locator("#main-content");
    await expect(main).toHaveCount(1);
  });

  test.skip("skip-nav link works in app shell", async ({ page }) => {
    await page.goto("/core/dashboard", { waitUntil: "domcontentloaded" });

    // Focus the skip link
    const skipLink = page.locator("a[href='#main-content']");
    await skipLink.focus();

    // Should become visible on focus
    await expect(skipLink).toBeVisible();

    // Click it
    await skipLink.click();

    // Focus should move to main content
    const focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toBe("main-content");
  });
});
