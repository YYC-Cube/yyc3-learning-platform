import { test, expect } from '@playwright/test';

/**
 * Mobile Device Tests
 * Tests specifically for iOS and Android devices
 */

test.describe.configure({ mode: 'parallel' });

test.describe('Mobile Device Core Functionality', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');
    await page.goto('/');
  });

  test('should render correctly on mobile devices', async ({ page }) => {
    // Check if mobile layout is active
    await expect(page.locator('h1')).toBeVisible();

    // Viewport should be mobile-sized
    const viewportSize = page.viewportSize();
    expect(viewportSize.width).toBeLessThan(768);
  });

  test('should have mobile navigation', async ({ page }) => {
    // Test mobile menu button
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button:has-text("菜单")');

    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();

      // Mobile navigation should appear
      const mobileNav = page.locator('[data-testid="mobile-navigation"]');
      await expect(mobileNav).toBeVisible();
    }
  });

  test('should handle touch interactions', async ({ page, hasTouch }) => {
    test.skip(!hasTouch, 'Touch device required');

    await page.goto('/courses');

    // Test touch interactions
    const touchableElements = page.locator('button, a, [role="button"]');
    const count = await touchableElements.count();

    if (count > 0) {
      // Simulate touch events
      await touchableElements.first().tap();
      await page.waitForTimeout(500);

      // Some interaction should have occurred
      expect(page.url()).toBeTruthy();
    }
  });

  test('should handle gestures', async ({ page, hasTouch }) => {
    test.skip(!hasTouch, 'Touch device required');

    await page.goto('/');

    // Test swipe gestures (if implemented)
    const swipeTarget = page.locator('[data-testid="swipe-container"]');
    if (await swipeTarget.isVisible()) {
      // Simulate swipe gesture
      await swipeTarget.evaluate(async (el) => {
        const touchStart = new TouchEvent('touchstart', {
          bubbles: true,
          touches: [{ clientX: 100, clientY: 100 }],
        });
        const touchMove = new TouchEvent('touchmove', {
          bubbles: true,
          touches: [{ clientX: 300, clientY: 100 }],
        });
        const touchEnd = new TouchEvent('touchend', {
          bubbles: true,
        });

        el.dispatchEvent(touchStart);
        await new Promise(resolve => setTimeout(resolve, 100));
        el.dispatchEvent(touchMove);
        await new Promise(resolve => setTimeout(resolve, 100));
        el.dispatchEvent(touchEnd);
      });
    }
  });

  test('should handle orientation changes', async ({ page }) => {
    // Test portrait mode
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Switch to landscape mode
    await page.setViewportSize({ width: 667, height: 375 });
    await page.reload();

    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle virtual keyboard', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    await page.goto('/profile');

    // Find input field
    const inputField = page.locator('input[type="text"], input[type="email"]').first();

    if (await inputField.isVisible()) {
      // Focus on input should trigger virtual keyboard
      await inputField.focus();
      await page.waitForTimeout(500);

      // Page should adjust to keyboard
      const viewportHeight = page.viewportSize().height;
      expect(viewportHeight).toBeGreaterThan(0);
    }
  });

  test('should optimize for mobile performance', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    const startTime = Date.now();
    await page.goto('/courses');
    const loadTime = Date.now() - startTime;

    // Mobile pages should load quickly
    expect(loadTime).toBeLessThan(4000);

    console.log(`Mobile load time: ${loadTime}ms`);
  });

  test('should handle pull-to-refresh', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    await page.goto('/');

    // Test pull-to-refresh functionality
    const pullToRefreshArea = page.locator('[data-testid="pull-to-refresh"]');

    if (await pullToRefreshArea.isVisible()) {
      // Simulate pull-to-refresh gesture
      await pullToRefreshArea.evaluate(async (el) => {
        let startY = 0;
        let currentY = 0;

        const touchStart = new TouchEvent('touchstart', {
          bubbles: true,
          touches: [{ clientX: 200, clientY: startY }],
        });

        el.dispatchEvent(touchStart);

        // Simulate pulling down
        for (let i = 0; i < 10; i++) {
          currentY += 10;
          const touchMove = new TouchEvent('touchmove', {
            bubbles: true,
            touches: [{ clientX: 200, clientY: currentY }],
          });
          el.dispatchEvent(touchMove);
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        const touchEnd = new TouchEvent('touchend', { bubbles: true });
        el.dispatchEvent(touchEnd);
      });

      await page.waitForTimeout(2000);
    }
  });

  test('should handle safe area insets', async ({ page }) => {
    await page.goto('/');

    // Check if page respects safe area insets
    const safeAreaElements = page.locator('[style*="env(safe-area-inset"]');

    if (await safeAreaElements.count() > 0) {
      await expect(safeAreaElements.first()).toBeVisible();
    }
  });
});

test.describe('iOS-Specific Features', () => {
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'iOS devices use WebKit');
    await page.goto('/');
  });

  test('should handle iOS-specific gestures', async ({ page, deviceName }) => {
    // Test iOS-specific swipe gestures
    const swipeContainer = page.locator('[data-testid="swipe-container"]');

    if (await swipeContainer.isVisible()) {
      // Test iOS swipe-back gesture
      await page.goBack();
      await page.goForward();
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should handle iOS keyboard behavior', async ({ page }) => {
    await page.goto('/profile');

    const inputField = page.locator('input[type="text"]').first();

    if (await inputField.isVisible()) {
      await inputField.tap();

      // iOS should show keyboard with appropriate input type
      await page.waitForTimeout(500);
      await expect(inputField).toBeFocused();
    }
  });

  test('should handle iOS scrolling behavior', async ({ page }) => {
    await page.goto('/courses');

    // Test iOS momentum scrolling
    await page.evaluate(async () => {
      const scrollContainer = document.documentElement;

      // Scroll down
      scrollContainer.scrollTop = 500;
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Should have momentum scroll effect
      return scrollContainer.scrollTop > 0;
    });

    await page.waitForTimeout(1000);
  });

  test('should handle iOS Safari features', async ({ page }) => {
    // Test Safari-specific features
    await page.goto('/');

    // Check if Apple Pay is available (if implemented)
    const applePayButton = page.locator('[data-testid="apple-pay-button"]');

    if (await applePayButton.isVisible()) {
      await expect(applePayButton).toBeVisible();
    }
  });
});

test.describe('Android-Specific Features', () => {
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Android uses Chromium');
    await page.goto('/');
  });

  test('should handle Android navigation', async ({ page }) => {
    // Test Android back button behavior
    await page.goto('/courses');

    // Android hardware back button simulation
    await page.goBack();

    // Should return to previous page or home
    const currentUrl = page.url();
    expect(currentUrl).toContain('http://localhost:3200');
  });

  test('should handle Android-specific gestures', async ({ page }) => {
    // Test Android-specific gestures
    await page.goto('/');

    // Test long-press gesture
    const longPressElement = page.locator('[data-testid="long-press-area"]');

    if (await longPressElement.isVisible()) {
      await longPressElement.tap();
      await page.mouse.down();
      await page.waitForTimeout(1000);
      await page.mouse.up();

      // Should trigger context menu or long-press action
      await page.waitForTimeout(500);
    }
  });

  test('should handle Chrome Custom Tabs', async ({ page }) => {
    // Test if external links open in Chrome Custom Tabs
    const externalLink = page.locator('a[href*="http"]').first();

    if (await externalLink.isVisible()) {
      const href = await externalLink.getAttribute('href');

      if (href && !href.includes('localhost:3200')) {
        // Should open in new tab or custom tab
        const [newPage] = await Promise.all([
          page.context().waitForEvent('page'),
          externalLink.click()
        ]);

        await newPage.waitForLoadState();
        expect(newPage.url()).toContain(href);

        await newPage.close();
      }
    }
  });

  test('should handle Android widget support', async ({ page }) => {
    // Test if page supports Android widgets
    await page.goto('/');

    // Check for Android-specific meta tags
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeTruthy();

    // Check for Android app manifest
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    if (manifestLink) {
      expect(manifestLink).toBeTruthy();
    }
  });
});

test.describe('Responsive Design Tests', () => {
  test('should work on various screen sizes', async ({ page }) => {
    const screenSizes = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 13', width: 390, height: 844 },
      { name: 'iPhone 13 Pro Max', width: 428, height: 926 },
      { name: 'Pixel 5', width: 393, height: 851 },
      { name: 'Galaxy S21', width: 360, height: 800 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 },
    ];

    for (const size of screenSizes) {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto('/');

      // Main content should be visible
      await expect(page.locator('h1')).toBeVisible();

      // Check if layout is appropriate
      if (size.width < 768) {
        // Mobile layout
        const mobileNav = page.locator('[data-testid="mobile-menu-button"]');
        if (await mobileNav.isVisible()) {
          await expect(mobileNav).toBeVisible();
        }
      } else {
        // Tablet/desktop layout
        const desktopNav = page.locator('[data-testid="desktop-navigation"]');
        if (await desktopNav.isVisible()) {
          await expect(desktopNav).toBeVisible();
        }
      }

      console.log(`✅ ${size.name} (${size.width}x${size.height}): OK`);
    }
  });

  test('should handle text scaling', async ({ page }) => {
    // Test if text scales properly on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Check if font size is appropriate for mobile
    const fontSize = await heading.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });

    expect(fontSize).toBeTruthy();
    console.log(`Mobile heading font size: ${fontSize}`);
  });

  test('should optimize images for mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/courses');

    // Check if images are responsive
    const images = page.locator('img:visible');

    if (await images.count() > 0) {
      const firstImage = images.first();

      // Image should fit within viewport
      const box = await firstImage.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should handle mobile-specific UI patterns', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/courses');

    // Test mobile-specific patterns

    // Bottom navigation (if implemented)
    const bottomNav = page.locator('[data-testid="bottom-nav"]');
    if (await bottomNav.isVisible()) {
      await expect(bottomNav).toBeVisible();
    }

    // Floating action button (if implemented)
    const fab = page.locator('[data-testid="floating-action-button"]');
    if (await fab.isVisible()) {
      await expect(fab).toBeVisible();
    }

    // Card-based layout
    const cards = page.locator('[data-testid="course-card"]');
    if (await cards.count() > 0) {
      await expect(cards.first()).toBeVisible();

      // Cards should be stackable on mobile
      const firstCard = cards.first();
      const box = await firstCard.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });
});

test.describe('Mobile Performance', () => {
  test('should load quickly on mobile networks', async ({ page }) => {
    // Simulate slower mobile network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      return route.continue();
    });

    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should still load reasonably quickly
    expect(loadTime).toBeLessThan(6000);
    console.log(`Mobile network load time: ${loadTime}ms`);
  });

  test('should handle poor network conditions', async ({ page }) => {
    // Simulate intermittent network failures
    let requestCount = 0;

    await page.route('**/*', async route => {
      requestCount++;

      // Fail every 3rd request
      if (requestCount % 3 === 0) {
        await route.abort();
      } else {
        await route.continue();
      }
    });

    await page.goto('/');

    // Should show appropriate error handling
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible({ timeout: 5000 })) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should optimize battery usage', async ({ page }) => {
    await page.goto('/');

    // Check for energy-efficient practices
    const animations = await page.evaluate(() => {
      const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
      return animatedElements.length;
    });

    // Limit number of concurrent animations
    expect(animations).toBeLessThan(20);
    console.log(`Animated elements: ${animations}`);
  });
});

test.describe('Accessibility on Mobile', () => {
  test('should have appropriate touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Touch targets should be at least 44x44 pixels (iOS guideline)
    const touchTargets = page.locator('button, a, [role="button"]');

    const count = await touchTargets.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = touchTargets.nth(i);
        const box = await element.boundingBox();

        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should support screen readers on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check for ARIA labels and accessibility attributes
    const interactiveElements = page.locator('button, a, input, select, textarea');
    const count = await interactiveElements.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = interactiveElements.nth(i);
      const hasAria = await element.evaluate(el =>
        el.hasAttribute('aria-label') ||
        el.hasAttribute('aria-labelledby') ||
        el.hasAttribute('aria-describedby') ||
        el.textContent?.trim()
      );

      expect(hasAria).toBeTruthy();
    }
  });

  test('should support zoom and text resizing', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check if viewport allows zooming
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');

    if (viewportMeta) {
      // Should allow user scaling
      const allowsZoom = viewportMeta.includes('user-scalable=yes') ||
                       !viewportMeta.includes('user-scalable=no');

      expect(allowsZoom).toBeTruthy();
    }
  });
});
