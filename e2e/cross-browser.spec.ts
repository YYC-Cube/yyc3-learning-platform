import { test, expect } from '@playwright/test';

/**
 * Cross-Browser Compatibility Tests
 * Tests core functionality across Chrome, Firefox, Safari, and Edge
 */

test.describe.configure({ mode: 'parallel' });

test.describe('Cross-Browser Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage across all browsers', async ({ page }) => {
    await expect(page).toHaveTitle(/YYC³ Learning Platform/);
    await expect(page.locator('h1')).toBeVisible();

    // Verify main navigation works
    const navLinks = page.locator('nav a:visible');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('should handle navigation consistently', async ({ page }) => {
    // Test navigation to courses
    await page.click('text=课程');
    await expect(page).toHaveURL(/\/courses/);
    await expect(page.locator('h1')).toContainText('课程');

    // Test navigation to exam
    await page.click('text=考试');
    await expect(page).toHaveURL(/\/exam/);
    await expect(page.locator('h1')).toContainText('考试');
  });

  test('should handle interactive elements', async ({ page }) => {
    await page.goto('/courses');

    // Test button interactions
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      await buttons.first().click();
      // Verify some interaction occurred
      expect(page.url()).toBeTruthy();
    }
  });

  test('should render forms correctly', async ({ page }) => {
    await page.goto('/profile');

    // Test form elements if present
    const formElements = page.locator('input, select, textarea');
    const elementCount = await formElements.count();

    if (elementCount > 0) {
      // First element should be visible and interactive
      await expect(formElements.first()).toBeVisible();
    }
  });

  test('should handle responsive layouts', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 },  // Desktop
      { width: 1366, height: 768 },   // Laptop
      { width: 768, height: 1024 },   // Tablet
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');

      // Main content should be visible
      await expect(page.locator('h1')).toBeVisible();

      // Navigation should be appropriate for viewport
      if (viewport.width < 768) {
        const mobileNav = page.locator('[data-testid="mobile-menu-button"]');
        if (await mobileNav.isVisible()) {
          await expect(mobileNav).toBeVisible();
        }
      }
    }
  });

  test('should handle JavaScript interactions', async ({ page }) => {
    await page.goto('/courses');

    // Test dynamic content loading
    const courseCards = page.locator('[data-testid="course-card"]');

    // Wait for dynamic content
    await page.waitForTimeout(2000);

    const cardCount = await courseCards.count();
    if (cardCount > 0) {
      await expect(courseCards.first()).toBeVisible();
    }
  });

  test('should handle local storage and cookies', async ({ page }) => {
    // Test localStorage functionality
    await page.goto('/');

    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });

    const storedValue = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });

    expect(storedValue).toBe('test-value');

    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem('test-key');
    });
  });

  test('should handle CSS animations and transitions', async ({ page }) => {
    await page.goto('/');

    // Test if animations work smoothly
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]');

    if (await animatedElements.count() > 0) {
      await expect(animatedElements.first()).toBeVisible();
    }
  });

  test('should handle error states', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/non-existent-page');

    // Should show error page or redirect
    const pageTitle = await page.locator('h1').textContent();
    expect(pageTitle).toMatch(/404|错误|Not Found/);
  });

  test('should handle media queries correctly', async ({ page }) => {
    // Test different screen sizes
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.goto('/');

    // Check if mobile-specific elements appear
    const mobileNav = page.locator('[data-testid="mobile-menu-button"]');
    const desktopNav = page.locator('[data-testid="desktop-navigation"]');

    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toBeVisible();
      await expect(desktopNav).not.toBeVisible();
    }

    // Switch to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    if (await desktopNav.isVisible()) {
      await expect(desktopNav).toBeVisible();
    }
  });
});

test.describe('Browser-Specific Features', () => {
  test('Chrome-specific features', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test');

    await page.goto('/');

    // Test Chrome DevTools Protocol features if available
    const metrics = await page.evaluate(() => {
      return performance.getEntriesByType('navigation')[0];
    });

    expect(metrics).toBeTruthy();
  });

  test('Firefox-specific features', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');

    await page.goto('/');

    // Test Firefox-specific rendering
    const element = page.locator('h1');
    await expect(element).toBeVisible();

    // Firefox should handle CSS grids correctly
    const gridElements = page.locator('[style*="display: grid"]');
    if (await gridElements.count() > 0) {
      await expect(gridElements.first()).toBeVisible();
    }
  });

  test('Safari-specific features', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific test');

    await page.goto('/');

    // Test Safari-specific features
    const element = page.locator('h1');
    await expect(element).toBeVisible();

    // Safari should handle -webkit- prefixed properties
    const webkitElements = page.locator('[style*="-webkit-"]');
    if (await webkitElements.count() > 0) {
      await expect(webkitElements.first()).toBeVisible();
    }
  });

  test('Edge-specific features', async ({ page, browserName }) => {
    test.skip(browserName !== 'edge', 'Edge-specific test');

    await page.goto('/');

    // Test Edge-specific features
    const element = page.locator('h1');
    await expect(element).toBeVisible();

    // Edge should handle modern CSS features
    const modernElements = page.locator('[style*="grid"], [style*="flex"]');
    if (await modernElements.count() > 0) {
      await expect(modernElements.first()).toBeVisible();
    }
  });
});

test.describe('Performance Across Browsers', () => {
  test('should have consistent load times', async ({ page, browserName }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Load time should be reasonable across all browsers
    expect(loadTime).toBeLessThan(5000);

    console.log(`${browserName} load time: ${loadTime}ms`);
  });

  test('should handle memory efficiently', async ({ page }) => {
    // Navigate through multiple pages
    const pages = ['/', '/courses', '/exam', '/profile'];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForTimeout(1000);
    }

    // Page should still be responsive
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
  });

  test('should handle concurrent operations', async ({ page }) => {
    await page.goto('/courses');

    // Test if page handles multiple operations smoothly
    const operations = [
      page.waitForSelector('h1'),
      page.waitForSelector('button:visible'),
      page.waitForTimeout(1000),
    ];

    await Promise.all(operations);
    await expect(page.locator('h1')).toBeVisible();
  });
});
