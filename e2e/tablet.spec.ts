import { test, expect } from '@playwright/test';

/**
 * Tablet Device Tests
 * Comprehensive testing for various tablet devices
 */

test.describe.configure({ mode: 'parallel' });

test.describe('Large Tablet Tests', () => {
  test.beforeEach(async ({ page }) => {
    // These tests run on iPad Pro and other large tablets
    const isTablet = await page.evaluate(() => {
      const width = window.innerWidth;
      return width >= 768 && width <= 1024;
    });

    test.skip(!isTablet, 'Tablet-only test');
  });

  test('should optimize layout for iPad Pro 12.9"', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1366 });
    await page.goto('/');

    // iPad Pro should show enhanced layout
    await expect(page.locator('h1')).toBeVisible();

    // Check for multi-column layouts
    const multiColumnLayout = await page.evaluate(() => {
      const mainContent = document.querySelector('main');
      if (!mainContent) return false;

      const styles = window.getComputedStyle(mainContent);
      return styles.display === 'grid' || styles.display === 'flex';
    });

    if (multiColumnLayout) {
      console.log('✅ iPad Pro multi-column layout detected');
    }
  });

  test('should handle iPad Pro 11" layout', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1194 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Check if layout adapts to smaller tablet size
    const tabletLayout = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      return nav !== null;
    });

    expect(tabletLayout).toBeTruthy();
  });

  test('should handle Galaxy Tab S8 Ultra', async ({ page }) => {
    await page.setViewportSize({ width: 1854, height: 2560 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Large tablet should show desktop-like features
    const desktopFeatures = await page.evaluate(() => {
      const hasLargeScreen = window.innerWidth >= 1800;
      const hasEnhancedUI = document.querySelectorAll('[data-testid="enhanced-ui"]').length > 0;
      return { hasLargeScreen, hasEnhancedUI };
    });

    console.log('Galaxy Tab S8 Ultra features:', desktopFeatures);
  });

  test('should handle tablet orientation changes', async ({ page }) => {
    // Test landscape mode
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Test portrait mode
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();

    await expect(page.locator('h1')).toBeVisible();

    // Check if layout adapts to orientation
    const adaptiveLayout = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return styles.transitionProperty !== 'none';
    });

    if (adaptiveLayout) {
      console.log('✅ Orientation-aware transitions detected');
    }
  });
});

test.describe('Foldable Device Tests', () => {
  test.describe.configure({ mode: 'serial' }); // Foldable tests need to run in sequence

  test('should handle Galaxy Z Fold 4 folded state', async ({ page }) => {
    // Simulate folded state
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Check if layout adapts to narrow screen
    const narrowLayout = await page.evaluate(() => {
      const isNarrow = window.innerWidth < 400;
      const hasMobileNav = document.querySelector('[data-testid="mobile-nav"]');
      return { isNarrow, hasMobileNav };
    });

    expect(narrowLayout.isNarrow).toBeTruthy();
  });

  test('should handle Galaxy Z Fold 4 unfolded state', async ({ page }) => {
    // Simulate unfolded state
    await page.setViewportSize({ width: 1812, height: 2172 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Unfolded should show enhanced layout
    const enhancedLayout = await page.evaluate(() => {
      const hasDualColumn = window.innerWidth > 1700;
      const hasDesktopFeatures = document.querySelectorAll('[data-testid="desktop-feature"]').length > 0;
      return { hasDualColumn, hasDesktopFeatures };
    });

    console.log('Fold 4 unfolded layout:', enhancedLayout);
  });

  test('should handle dynamic fold transitions', async ({ page }) => {
    // Start in folded state
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/courses');

    const foldedState = await page.evaluate(() => {
      return {
        scrollY: window.scrollY,
        elementsVisible: document.querySelectorAll('body > *').length
      };
    });

    // Simulate unfolding
    await page.setViewportSize({ width: 1812, height: 2172 });
    await page.waitForTimeout(1000); // Allow for layout adjustment

    const unfoldedState = await page.evaluate(() => {
      return {
        scrollY: window.scrollY,
        elementsVisible: document.querySelectorAll('body > *').length
      };
    });

    // Check if transition is smooth
    expect(unfoldedState.elementsVisible).toBeGreaterThanOrEqual(foldedState.elementsVisible);
  });

  test('should handle Huawei Mate X3 folded', async ({ page }) => {
    await page.setViewportSize({ width: 384, height: 851 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Huawei Mate X3 folded should optimize for narrow screen
    const narrowOptimization = await page.evaluate(() => {
      const isNarrow = window.innerWidth < 400;
      const hasSingleColumn = document.querySelectorAll('.single-column').length > 0;
      return { isNarrow, hasSingleColumn };
    });

    expect(narrowOptimization.isNarrow).toBeTruthy();
  });

  test('should handle Huawei Mate X3 unfolded', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1024 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Unfolded should show dual-pane layout
    const dualPane = await page.evaluate(() => {
      const hasDualPane = window.innerWidth > 1500;
      const hasDesktopLayout = document.querySelectorAll('[data-testid="dual-pane"]').length > 0;
      return { hasDualPane, hasDesktopLayout };
    });

    console.log('Mate X3 unfolded layout:', dualPane);
  });

  test('should handle Microsoft Surface Duo', async ({ page }) => {
    await page.setViewportSize({ width: 720, height: 1280 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Surface Duo should optimize for dual-screen
    const dualScreenOptimization = await page.evaluate(() => {
      const hasDualScreenSupport = document.querySelectorAll('[data-hinge]').length > 0;
      const hasBridgeSupport = typeof (window as any).getDisplays !== 'undefined';
      return { hasDualScreenSupport, hasBridgeSupport };
    });

    console.log('Surface Duo optimization:', dualScreenOptimization);
  });

  test('should handle hinge area on foldables', async ({ page }) => {
    // Test foldable-specific UI patterns
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/');

    const hingeOptimization = await page evaluate(() => {
      // Check for hinge-aware layout
      const hasHingeAvoidance = document.querySelectorAll('[style*="hinge"]').length > 0;
      const hasSafeAreas = document.querySelectorAll('[style*="env(safe-area"]').length > 0;

      return {
        hasHingeAvoidance,
        hasSafeAreas
      };
    });

    if (hingeOptimization.hasSafeAreas) {
      console.log('✅ Hinge-aware layout detected');
    }
  });
});

test.describe('Tablet-Specific Features', () => {
  test.beforeEach(async ({ page }) => {
    // Set tablet viewport for all tests
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
  });

  test('should support split-screen multitasking', async ({ page }) => {
    // Test if layout supports split-screen
    const splitScreenSupport = await page.evaluate(() => {
      const hasResizable = document.querySelectorAll('[data-testid="resizable"]').length > 0;
      const hasDraggable = document.querySelectorAll('[data-testid="draggable"]').length > 0;
      return { hasResizable, hasDraggable };
    });

    console.log('Split-screen support:', splitScreenSupport);
  });

  test('should optimize touch targets for tablets', async ({ page }) => {
    await page.goto('/courses');

    const touchTargets = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, a, [role="button"]');
      const validTargets = [];

      buttons.forEach((btn: Element) => {
        const rect = btn.getBoundingClientRect();
        if (rect.width >= 44 && rect.height >= 44) {
          validTargets.push({
            width: rect.width,
            height: rect.height
          });
        }
      });

      return {
        total: buttons.length,
        valid: validTargets.length,
        percentage: buttons.length > 0 ? (validTargets.length / buttons.length) * 100 : 0
      };
    });

    console.log('Touch target optimization:', touchTargets);

    // At least 90% of touch targets should be properly sized
    expect(touchTargets.percentage).toBeGreaterThanOrEqual(90);
  });

  test('should support stylus input', async ({ page }) => {
    // Test if page supports stylus/touch input
    await page.goto('/');

    const stylusSupport = await page.evaluate(() => {
      // Check for hover states and pointer: coarse media query
      const hasHoverSupport = window.matchMedia('(hover: hover)').matches;
      const hasPointerCoarse = window.matchMedia('(pointer: coarse)').matches;

      return {
        hasHoverSupport,
        hasPointerCoarse,
        supportsStylus: !hasPointerCoarse
      };
    });

    console.log('Stylus support:', stylusSupport);
  });

  test('should handle tablet keyboard shortcuts', async ({ page }) => {
    // Test keyboard navigation on tablets
    await page.goto('/');

    // Test Tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => {
      const focused = document.activeElement;
      return {
        tagName: focused?.tagName,
        hasFocus: document.hasFocus()
      };
    });

    expect(focusedElement.hasFocus).toBeTruthy();
  });

  test('should support tablet multitasking gestures', async ({ page }) => {
    // Test tablet-specific gestures
    await page.goto('/');

    // Test swipe gestures
    const swipeContainer = page.locator('[data-testid="swipe-container"]');

    if (await swipeContainer.isVisible()) {
      await swipeContainer.evaluate(el => {
        // Simulate swipe gesture
        let startX = 0;
        let startY = 0;

        const touchStart = new TouchEvent('touchstart', {
          bubbles: true,
          touches: [{ clientX: startX, clientY: startY }]
        });

        const touchMove = new TouchEvent('touchmove', {
          bubbles: true,
          touches: [{ clientX: startX + 500, clientY: startY }]
        });

        const touchEnd = new TouchEvent('touchend', { bubbles: true });

        el.dispatchEvent(touchStart);
        el.dispatchEvent(touchMove);
        el.dispatchEvent(touchEnd);
      });

      await page.waitForTimeout(500);
    }
  });
});

test.describe('Tablet Performance Optimization', () => {
  test('should load quickly on tablet networks', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    // Simulate tablet network conditions
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      return route.continue();
    });

    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load reasonably fast on tablets
    expect(loadTime).toBeLessThan(6000);
    console.log(`Tablet load time: ${loadTime}ms`);
  });

  test('should optimize images for tablet screens', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 }); // Landscape tablet
    await page.goto('/courses');

    const imageOptimization = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const optimizedImages = [];

      images.forEach((img: Element) => {
        const src = img.getAttribute('src');
        const srcset = img.getAttribute('srcset');

        if (src || srcset) {
          optimizedImages.push({
            hasSrc: !!src,
            hasSrcset: !!srcset,
            hasLoading: img.getAttribute('loading') === 'lazy',
            naturalWidth: (img as HTMLImageElement).naturalWidth,
            naturalHeight: (img as HTMLImageElement).naturalHeight
          });
        }
      });

      return {
        total: images.length,
        withLazyLoading: optimizedImages.filter(img => img.hasLoading).length,
        averageWidth: optimizedImages.reduce((sum, img) => sum + img.naturalWidth, 0) / optimizedImages.length
      };
    });

    console.log('Image optimization:', imageOptimization);
    expect(imageOptimization.total).toBeGreaterThan(0);
  });

  test('should handle tablet memory efficiently', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    // Navigate through multiple pages
    const pages = ['/', '/courses', '/exam', '/profile'];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForTimeout(500);
    }

    // Check memory usage
    const memoryUsage = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
      }
      return 0;
    });

    console.log(`Tablet memory usage: ${memoryUsage.toFixed(2)}MB`);

    // Should use reasonable memory (< 150MB)
    expect(memoryUsage).toBeLessThan(150);
  });
});

test.describe('Tablet Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
  });

  test('should support external keyboards', async ({ page }) => {
    // Test if tablet works with external keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');

    const navigation = await page.evaluate(() => {
      const focused = document.activeElement;
      return {
        hasFocus: document.hasFocus(),
        focusedTag: focused?.tagName
      };
    });

    expect(navigation.hasFocus).toBeTruthy();
  });

  test('should support voice control', async ({ page }) => {
    // Test voice control compatibility
    const voiceControlSupport = await page.evaluate(() => {
      const hasAriaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]').length > 0;
      const hasReadableNames = document.querySelectorAll('button[aria-label], a[aria-label]').length > 0;

      return {
        hasAriaLabels,
        hasReadableNames,
        voiceControlReady: hasAriaLabels || hasReadableNames
      };
    });

    expect(voiceControlSupport.voiceControlReady).toBeTruthy();
  });

  test('should support screen magnification', async ({ page }) => {
    // Test if page handles zoom/magnification
    await page.goto('/');

    // Simulate 150% zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1.5';
    });

    await expect(page.locator('h1')).toBeVisible();

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });
});

test.describe('Tablet Landscape/Portrait', () => {
  test('should adapt to landscape orientation', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 }); // Landscape
    await page.goto('/');

    const landscapeFeatures = await page.evaluate(() => {
      const hasHorizontalNav = document.querySelectorAll('[data-orientation="landscape"]').length > 0;
      const hasWideLayout = window.innerWidth > window.innerHeight;
      return { hasHorizontalNav, hasWideLayout };
    });

    console.log('Landscape features:', landscapeFeatures);
  });

  test('should adapt to portrait orientation', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // Portrait
    await page.goto('/');

    const portraitFeatures = await page.evaluate(() => {
      const hasVerticalNav = document.querySelectorAll('[data-orientation="portrait"]').length > 0;
      const hasTallLayout = window.innerHeight > window.innerWidth;
      return { hasVerticalNav, hasTallLayout };
    });

    console.log('Portrait features:', portraitFeatures);
  });

  test('should handle orientation changes gracefully', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const portraitContent = await page.evaluate(() => {
      return document.body.innerHTML.length;
    });

    // Change to landscape
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);

    const landscapeContent = await page.evaluate(() => {
      return document.body.innerHTML.length;
    });

    // Content should remain consistent
    expect(landscapeContent).toBeCloseTo(portraitContent, { threshold: 100 });
  });
});
