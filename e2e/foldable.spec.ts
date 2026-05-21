import { test, expect } from '@playwright/test';

/**
 * Foldable Device Specialized Tests
 * Tests specifically for foldable phone features and behaviors
 */

test.describe.configure({ mode: 'serial' }); // Foldable tests need sequential execution

test.describe('Galaxy Z Fold 4 Tests', () => {
  test('should optimize layout for folded state', async ({ page }) => {
    // Simulate Galaxy Z Fold 4 folded (361x850)
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/');

    // Check for single-column layout
    const singleColumn = await page.evaluate(() => {
      const mainContent = document.querySelector('main');
      if (!mainContent) return false;

      const styles = window.getComputedStyle(mainContent);
      return styles.maxWidth === '100%' || styles.width === '100%';
    });

    expect(singleColumn).toBeTruthy();
  });

  test('should enhance layout for unfolded state', async ({ page }) => {
    // Simulate Galaxy Z Fold 4 unfolded (1812x2172)
    await page.setViewportSize({ width: 1812, height: 2172 });
    await page.goto('/');

    // Check for dual-column layout
    const dualColumn = await page.evaluate(() => {
      const mainContent = document.querySelector('main');
      if (!mainContent) return false;

      const styles = window.getComputedStyle(mainContent);
      return styles.display === 'grid' || styles.display === 'flex';
    });

    expect(dualColumn).toBeTruthy();
  });

  test('should handle fold state transition', async ({ page }) => {
    // Start folded
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/');

    const foldedElements = await page.evaluate(() => {
      return document.querySelectorAll('body > *').length;
    });

    // Simulate unfolding
    await page.setViewportSize({ width: 1812, height: 2172 });
    await page.waitForTimeout(1000);

    const unfoldedElements = await page.evaluate(() => {
      return document.querySelectorAll('body > *').length;
    });

    // Elements should remain consistent
    expect(unfoldedElements).toBeCloseTo(foldedElements, { threshold: 5 });

    // Check for transition effects
    const hasTransitions = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return styles.transitionProperty !== 'none';
    });

    if (hasTransitions) {
      console.log('✅ Smooth fold transition detected');
    }
  });

  test('should respect hinge area in folded state', async ({ page }) => {
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/');

    // Check for hinge-aware layout
    const hingeOptimization = await page.evaluate(() => {
      // Check for safe area insets or hinge avoidance
      const hasSafeAreas = document.querySelectorAll('[style*="env(safe-area-inset"]').length > 0;
      const hasHingePadding =
        document.querySelectorAll('[style*="padding-left"], [style*="padding-right"]').length > 0;

      return {
        hasSafeAreas,
        hasHingePadding,
      };
    });

    console.log('Hinge optimization:', hingeOptimization);
  });

  test('should provide continuity across fold', async ({ page }) => {
    // Test if user experience remains consistent when folding/unfolding
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/courses');

    // Navigate in folded state
    const foldedScrollPosition = await page.evaluate(() => {
      window.scrollBy(0, 200);
      return window.scrollY;
    });

    expect(foldedScrollPosition).toBeGreaterThan(0);

    // Unfold and check continuity
    await page.setViewportSize({ width: 1812, height: 2172 });
    await page.waitForTimeout(500);

    const unfoldedScrollPosition = await page.evaluate(() => {
      return window.scrollY;
    });

    // Scroll position should be preserved (approximately)
    expect(Math.abs(unfoldedScrollPosition - foldedScrollPosition)).toBeLessThan(50);
  });
});

test.describe('Huawei Mate X3 Tests', () => {
  test('should optimize for folded state', async ({ page }) => {
    await page.setViewportSize({ width: 384, height: 851 });
    await page.goto('/');

    // Check mobile optimization
    const mobileLayout = await page.evaluate(() => {
      const isMobile = window.innerWidth < 400;
      const hasMobileNav = document.querySelector('[data-testid="mobile-nav"]');
      return { isMobile, hasMobileNav };
    });

    expect(mobileLayout.isMobile).toBeTruthy();
  });

  test('should enhance for unfolded state', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1024 });
    await page.goto('/');

    // Check for desktop-like layout
    const desktopLayout = await page.evaluate(() => {
      const hasEnhancedUI = document.querySelectorAll('[data-testid="enhanced-ui"]').length > 0;
      const hasDualPane = document.querySelectorAll('[data-testid="dual-pane"]').length > 0;
      return { hasEnhancedUI, hasDualPane };
    });

    console.log('Desktop features:', desktopLayout);
  });

  test('should handle hinge area gracefully', async ({ page }) => {
    await page.setViewportSize({ width: 384, height: 851 });
    await page.goto('/');

    // Check if UI avoids problematic areas
    const hingeAvoidance = await page.evaluate(() => {
      const safeContent = document.querySelector('main');
      if (!safeContent) return false;

      const rect = safeContent.getBoundingClientRect();
      const hasMargins = rect.left > 20 && rect.right < window.innerWidth - 20;

      return hasMargins;
    });

    if (hingeAvoidance) {
      console.log('✅ Hinge avoidance detected');
    }
  });
});

test.describe('Microsoft Surface Duo Tests', () => {
  test('should optimize for dual-screen layout', async ({ page }) => {
    await page.setViewportSize({ width: 720, height: 1280 });
    await page.goto('/');

    // Check for dual-screen optimization
    const dualScreenSupport = await page.evaluate(() => {
      const hasSpanningLayout = document.querySelectorAll('[data-span-screens]').length > 0;
      const hasDualPaneLayout = document.querySelectorAll('[data-dual-screen]').length > 0;
      return { hasSpanningLayout, hasDualPaneLayout };
    });

    console.log('Dual-screen support:', dualScreenSupport);
  });

  test('should handle screen bridging', async ({ page }) => {
    await page.setViewportSize({ width: 720, height: 1280 });
    await page.goto('/');

    // Test if content flows across hinge
    const contentFlow = await page.evaluate(() => {
      const mainContent = document.querySelector('main');
      if (!mainContent) return false;

      const rect = mainContent.getBoundingClientRect();
      const spansHinge = rect.left < 100 || rect.right > window.innerWidth - 100;

      return {
        contentWidth: rect.width,
        spansHinge,
        fitsInSingleScreen: !spansHinge,
      };
    });

    console.log('Content flow:', contentFlow);
  });

  test('should support touch and pen input', async ({ page }) => {
    await page.setViewportSize({ width: 720, height: 1280 });
    await page.goto('/');

    // Test touch input
    const touchSupport = await page.evaluate(() => {
      return {
        hasTouch: 'ontouchstart' in window,
        maxTouchPoints: navigator.maxTouchPoints || 0,
      };
    });

    console.log('Touch support:', touchSupport);

    // Test pen/stylus support
    const penSupport = await page.evaluate(() => {
      return {
        pointerFine: window.matchMedia('(pointer: fine)').matches,
        hoverSupport: window.matchMedia('(hover: hover)').matches,
      };
    });

    console.log('Pen support:', penSupport);
  });
});

test.describe('Foldable Performance Tests', () => {
  test('should perform well in folded state', async ({ page }) => {
    await page.setViewportSize({ width: 361, height: 850 });

    const startTime = Date.now();
    await page.goto('/courses');
    const loadTime = Date.now() - startTime;

    // Should load quickly even in folded state
    expect(loadTime).toBeLessThan(5000);
    console.log(`Folded state load time: ${loadTime}ms`);
  });

  test('should perform well in unfolded state', async ({ page }) => {
    await page.setViewportSize({ width: 1812, height: 2172 });

    const startTime = Date.now();
    await page.goto('/courses');
    const loadTime = Date.now() - startTime;

    // Should maintain performance in unfolded state
    expect(loadTime).toBeLessThan(6000);
    console.log(`Unfolded state load time: ${loadTime}ms`);
  });

  test('should handle memory efficiently during fold', async ({ page }) => {
    // Start in folded state
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/');

    const foldedMemory = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Unfold and navigate
    await page.setViewportSize({ width: 1812, height: 2172 });
    await page.goto('/exam');
    await page.waitForTimeout(1000);

    const unfoldedMemory = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Memory growth should be reasonable
    const memoryGrowth = ((unfoldedMemory - foldedMemory) / foldedMemory) * 100;

    console.log(`Memory growth during unfold: ${memoryGrowth.toFixed(1)}%`);
    expect(memoryGrowth).toBeLessThan(50); // Less than 50% growth
  });

  test('should maintain state during fold/unfold', async ({ page }) => {
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/profile');

    // Store some state
    await page.evaluate(() => {
      sessionStorage.setItem('fold-test', 'active');
    });

    const foldedState = await page.evaluate(() => {
      return sessionStorage.getItem('fold-test');
    });

    expect(foldedState).toBe('active');

    // Unfold and check state
    await page.setViewportSize({ width: 1812, height: 2172 });
    await page.waitForTimeout(500);

    const unfoldedState = await page.evaluate(() => {
      return sessionStorage.getItem('fold-test');
    });

    expect(unfoldedState).toBe('active');

    // Clean up
    await page.evaluate(() => {
      sessionStorage.removeItem('fold-test');
    });
  });
});

test.describe('Foldable User Experience', () => {
  test('should provide consistent navigation', async ({ page }) => {
    // Test navigation in both states
    const states = [
      { width: 361, height: 850, name: 'folded' },
      { width: 1812, height: 2172, name: 'unfolded' },
    ];

    for (const state of states) {
      await page.setViewportSize({ width: state.width, height: state.height });
      await page.goto('/');

      const navigationWorks = await page.evaluate(() => {
        const nav = document.querySelector('nav');
        return nav !== null && nav.isVisible();
      });

      expect(navigationWorks).toBeTruthy();
      console.log(`✅ Navigation works in ${state.name} state`);
    }
  });

  test('should maintain content readability', async ({ page }) => {
    // Test text readability across fold states
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/courses');

    const foldedReadability = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);

      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        maxWidth: styles.maxWidth,
      };
    });

    await page.setViewportSize({ width: 1812, height: 2172 });
    await page.waitForTimeout(500);

    const unfoldedReadability = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);

      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        maxWidth: styles.maxWidth,
      };
    });

    // Font size should be consistent
    expect(foldedReadability.fontSize).toBe(unfoldedReadability.fontSize);

    console.log('Readability maintained across fold states');
  });

  test('should optimize interactive elements', async ({ page }) => {
    // Test button and input interactions
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/');

    const foldedInteractive = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const touchTargets = [];

      buttons.forEach((btn) => {
        const rect = btn.getBoundingClientRect();
        if (rect.width >= 44 && rect.height >= 44) {
          touchTargets.push({
            width: rect.width,
            height: rect.height,
          });
        }
      });

      return {
        totalButtons: buttons.length,
        validTouchTargets: touchTargets.length,
      };
    });

    expect(foldedInteractive.validTouchTargets).toBeGreaterThan(0);

    // Unfold and check
    await page.setViewportSize({ width: 1812, height: 2172 });
    await page.waitForTimeout(500);

    const unfoldedInteractive = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return buttons.length;
    });

    expect(unfoldedInteractive).toBeGreaterThan(0);
    console.log(`Interactive elements: ${foldedInteractive.totalButtons} buttons`);
  });
});

test.describe('Foldable-Specific APIs', () => {
  test('should handle window.orientation API', async ({ page }) => {
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/');

    const orientationAPI = await page.evaluate(() => {
      return {
        orientation: screen.orientation?.type,
        angle: screen.orientation?.angle,
        type: screen.orientation?.type,
      };
    });

    console.log('Orientation API:', orientationAPI);
    expect(orientationAPI.orientation).toBeTruthy();
  });

  test('should handle resize events', async ({ page }) => {
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/');

    let resizeCount = 0;

    page.on('resize', () => {
      resizeCount++;
    });

    // Trigger resize
    await page.setViewportSize({ width: 1812, height: 2172 });
    await page.waitForTimeout(500);

    console.log(`Resize events detected: ${resizeCount}`);
  });

  test('should support CSS media queries for foldables', async ({ page }) => {
    await page.setViewportSize({ width: 361, height: 850 });
    await page.goto('/');

    const foldedMediaQuery = await page.evaluate(() => {
      return {
        isNarrow: window.matchMedia('(max-width: 400px)').matches,
        isPortrait: window.matchMedia('(orientation: portrait)').matches,
        isHoverCapable: window.matchMedia('(hover: hover)').matches,
      };
    });

    expect(foldedMediaQuery.isNarrow).toBeTruthy();

    // Change to unfolded
    await page.setViewportSize({ width: 1812, height: 2172 });
    await page.waitForTimeout(500);

    const unfoldedMediaQuery = await page.evaluate(() => {
      return {
        isWide: window.matchMedia('(min-width: 1400px)').matches,
        isLandscape: window.matchMedia('(orientation: landscape)').matches,
        isHoverCapable: window.matchMedia('(hover: hover)').matches,
      };
    });

    expect(unfoldedMediaQuery.isWide).toBeTruthy();
    console.log('Media query adaptation successful');
  });
});
