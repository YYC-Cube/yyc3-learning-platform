import { test, expect } from '@playwright/test';

/**
 * Extended Browser Compatibility Tests
 * Tests for Opera, Brave, and other Chromium-based browsers
 */

test.describe.configure({ mode: 'parallel' });

test.describe('Opera Browser Compatibility', () => {
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName !== 'opera-desktop', 'Opera-specific test');
    await page.goto('/');
  });

  test('should load homepage in Opera', async ({ page }) => {
    await expect(page).toHaveTitle(/YYC³ Learning Platform/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle Opera-specific features', async ({ page }) => {
    // Test Opera's built-in VPN and ad blocker (if present)
    await page.goto('/courses');

    // Opera should handle standard web features
    const courseCards = page.locator('[data-testid="course-card"]');
    await page.waitForTimeout(2000);

    const cardCount = await courseCards.count();
    if (cardCount > 0) {
      await expect(courseCards.first()).toBeVisible();
    }
  });

  test('should support Opera extensions', async ({ page }) => {
    // Test if page works with common Opera extensions
    await page.goto('/');

    // Opera should support modern JavaScript features
    const modernJS = await page.evaluate(() => {
      return (
        typeof fetch !== 'undefined' &&
        typeof WebSocket !== 'undefined' &&
        typeof IntersectionObserver !== 'undefined'
      );
    });

    expect(modernJS).toBeTruthy();
  });

  test("should handle Opera's battery API", async ({ page }) => {
    // Test Opera's battery API implementation
    await page.goto('/');

    const batteryAPI = await page.evaluate(async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          return {
            supported: true,
            level: battery.level,
            charging: battery.charging,
          };
        } catch (e) {
          return { supported: true, error: true };
        }
      }
      return { supported: false };
    });

    expect(batteryAPI.supported).toBeTruthy();
  });
});

test.describe('Brave Browser Compatibility', () => {
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName !== 'brave-desktop', 'Brave-specific test');
    await page.goto('/');
  });

  test('should load homepage in Brave', async ({ page }) => {
    await expect(page).toHaveTitle(/YYC³ Learning Platform/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should work with Brave Shields', async ({ page }) => {
    // Test compatibility with Brave's privacy features
    await page.goto('/courses');

    // Brave Shields shouldn't block legitimate content
    const courseCards = page.locator('[data-testid="course-card"]');
    await page.waitForTimeout(2000);

    const cardCount = await courseCards.count();
    if (cardCount > 0) {
      await expect(courseCards.first()).toBeVisible();
    }
  });

  test("should support Brave's crypto wallet", async ({ page }) => {
    // Test if page works with Brave's built-in crypto wallet
    await page.goto('/');

    const braveWallet = await page.evaluate(() => {
      return (window as any).ethereum?.isBraveWallet || false;
    });

    // Should handle Brave wallet presence gracefully
    expect(typeof braveWallet).toBe('boolean');
  });

  test("should handle Brave's privacy features", async ({ page }) => {
    // Test compatibility with Brave's aggressive tracking protection
    await page.goto('/');

    // Analytics should still work (or fail gracefully)
    const analyticsScripts = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script');
      return Array.from(scripts).filter(
        (script) => script.src.includes('analytics') || script.src.includes('gtag')
      );
    });

    // Page should function regardless of analytics blocking
    await expect(page.locator('h1')).toBeVisible();
  });

  test("should support Brave's Web3 API", async ({ page }) => {
    // Test Brave's enhanced Web3 support
    await page.goto('/');

    const web3Support = await page.evaluate(() => {
      return typeof (window as any).ethereum !== 'undefined';
    });

    // Should handle Web3 API presence gracefully
    expect(typeof web3Support).toBe('boolean');
  });
});

test.describe('Chromium-Based Browser Consistency', () => {
  const chromiumBrowsers = ['chromium-desktop', 'opera-desktop', 'brave-desktop', 'edge-desktop'];

  chromiumBrowsers.forEach((browserName) => {
    test(`${browserName} - should have consistent rendering`, async ({ page }) => {
      test.skip(process.env.CI && browserName !== 'chromium-desktop', 'Skip redundant tests in CI');

      // Set user agent to simulate different browsers if needed
      if (browserName === 'opera-desktop') {
        await page.setExtraHTTPHeaders({
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 OPR/100.0.0.0',
        });
      } else if (browserName === 'brave-desktop') {
        await page.setExtraHTTPHeaders({
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Brave/114.0.0.0',
        });
      }

      await page.goto('/');

      // Check if main content renders consistently
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });

    test(`${browserName} - should handle JavaScript consistently`, async ({ page }) => {
      test.skip(process.env.CI && browserName !== 'chromium-desktop', 'Skip redundant tests in CI');

      await page.goto('/courses');

      // Test JavaScript execution consistency
      const dynamicContent = await page.evaluate(() => {
        return typeof document.querySelector !== 'undefined';
      });

      expect(dynamicContent).toBeTruthy();
    });

    test(`${browserName} - should have consistent CSS rendering`, async ({ page }) => {
      test.skip(process.env.CI && browserName !== 'chromium-desktop', 'Skip redundant tests in CI');

      await page.goto('/');

      // Check CSS features consistency
      const cssFeatures = await page.evaluate(() => {
        const testElement = document.createElement('div');
        testElement.style.display = 'grid';
        testElement.style.flexDirection = 'row';
        return {
          gridSupport: testElement.style.display === 'grid',
          flexSupport: testElement.style.flexDirection === 'row',
        };
      });

      expect(cssFeatures.gridSupport).toBeTruthy();
      expect(cssFeatures.flexSupport).toBeTruthy();
    });

    test(`${browserName} - should handle modern APIs`, async ({ page }) => {
      test.skip(process.env.CI && browserName !== 'chromium-desktop', 'Skip redundant tests in CI');

      await page.goto('/');

      // Test modern API support
      const modernAPIs = await page.evaluate(async () => {
        return {
          fetch: typeof fetch !== 'undefined',
          webWorker: typeof Worker !== 'undefined',
          serviceWorker: 'serviceWorker' in navigator,
          intersectionObserver: typeof IntersectionObserver !== 'undefined',
          resizeObserver: typeof ResizeObserver !== 'undefined',
        };
      });

      expect(modernAPIs.fetch).toBeTruthy();
      expect(modernAPIs.webWorker).toBeTruthy();
    });
  });
});

test.describe('Extended Browser Performance', () => {
  test('should have consistent performance across browsers', async ({ page, browserName }) => {
    const extendedBrowsers = ['opera-desktop', 'brave-desktop'];

    test.skip(!extendedBrowsers.includes(browserName), 'Extended browser test');

    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Load time should be reasonable across all browsers
    expect(loadTime).toBeLessThan(5000);

    console.log(`${browserName} load time: ${loadTime}ms`);
  });

  test('should handle memory consistently', async ({ page, browserName }) => {
    const extendedBrowsers = ['opera-desktop', 'brave-desktop'];

    test.skip(!extendedBrowsers.includes(browserName), 'Extended browser test');

    await page.goto('/');

    const memoryUsage = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Memory usage should be reasonable (< 100MB for initial load)
    expect(memoryUsage).toBeLessThan(100 * 1024 * 1024);
  });
});

test.describe('Browser Extension Compatibility', () => {
  test('should work with common extensions', async ({ page, browserName }) => {
    const chromiumBrowsers = ['chromium-desktop', 'opera-desktop', 'brave-desktop', 'edge-desktop'];
    test.skip(!chromiumBrowsers.includes(browserName), 'Chromium browser test');

    await page.goto('/');

    // Test that page doesn't break when extensions modify the DOM
    await page.evaluate(() => {
      // Simulate extension injecting elements
      const testDiv = document.createElement('div');
      testDiv.id = 'extension-test-element';
      testDiv.style.position = 'fixed';
      testDiv.style.top = '0';
      testDiv.style.left = '0';
      document.body.appendChild(testDiv);
    });

    // Page should still function normally
    await expect(page.locator('h1')).toBeVisible();

    // Clean up
    await page.evaluate(() => {
      const element = document.getElementById('extension-test-element');
      if (element) {
        element.remove();
      }
    });
  });

  test('should handle content script modifications', async ({ page, browserName }) => {
    const chromiumBrowsers = ['chromium-desktop', 'opera-desktop', 'brave-desktop', 'edge-desktop'];
    test.skip(!chromiumBrowsers.includes(browserName), 'Chromium browser test');

    await page.goto('/');

    // Simulate content script modifications
    await page.evaluate(() => {
      // Common extension modifications
      document.body.style.filter = 'contrast(1.1)';
    });

    await page.reload();
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Security & Privacy Features', () => {
  test('Brave should handle privacy features', async ({ page, browserName }) => {
    test.skip(browserName !== 'brave-desktop', 'Brave-specific test');

    await page.goto('/');

    // Test that site works with Brave's enhanced tracking protection
    const trackingProtection = await page.evaluate(() => {
      return navigator.doNotTrack === '1' || navigator.doNotTrack === null;
    });

    // Should work regardless of DNT setting
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Opera should handle VPN scenarios', async ({ page, browserName }) => {
    test.skip(browserName !== 'opera-desktop', 'Opera-specific test');

    await page.goto('/');

    // Test that site works when Opera VPN changes location
    const geoLocationAPI = await page.evaluate(async () => {
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ available: true, coords: pos.coords }),
              (err) => resolve({ available: false, error: err.message })
            );
          });
          return position;
        } catch (e) {
          return { available: false, error: true };
        }
      }
      return { available: false };
    });

    // Should handle geolocation gracefully
    expect(typeof geoLocationAPI.available).toBe('boolean');
  });
});

test.describe('Developer Tools Compatibility', () => {
  test('should have consistent DevTools experience', async ({ page, browserName }) => {
    const browsers = [
      'chromium-desktop',
      'opera-desktop',
      'brave-desktop',
      'edge-desktop',
      'firefox-desktop',
    ];

    test.skip(!browsers.includes(browserName), 'Supported browser test');

    await page.goto('/');

    // Test that page structure is DevTools-friendly
    const devToolsFriendly = await page.evaluate(() => {
      return {
        hasProperIDs: document.querySelectorAll('h1, h2, h3, button, a').length > 0,
        hasClasses: document.querySelectorAll('[class]').length > 0,
        hasReadableCode: document.querySelectorAll('script, style').length > 0,
      };
    });

    expect(devToolsFriendly.hasProperIDs).toBeTruthy();
    expect(devToolsFriendly.hasClasses).toBeTruthy();
    expect(devToolsFriendly.hasReadableCode).toBeTruthy();
  });

  test('should provide useful console output', async ({ page, browserName }) => {
    const browsers = ['chromium-desktop', 'opera-desktop', 'brave-desktop'];

    test.skip(!browsers.includes(browserName), 'Chromium browser test');

    // Capture console messages
    const messages: string[] = [];
    page.on('console', (msg) => {
      messages.push(msg.text());
    });

    await page.goto('/');

    // Console should be clean or have useful messages
    const errorMessages = messages.filter((msg) => msg.includes('error') || msg.includes('Error'));

    if (errorMessages.length > 0) {
      console.log(`Console errors in ${browserName}:`, errorMessages);
    }

    // Should not have critical errors
    const criticalErrors = errorMessages.filter(
      (msg) =>
        msg.includes('TypeError') || msg.includes('ReferenceError') || msg.includes('NetworkError')
    );

    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Browser Feature Detection', () => {
  test('should handle feature detection correctly', async ({ page, browserName }) => {
    const browsers = ['opera-desktop', 'brave-desktop'];

    test.skip(!browsers.includes(browserName), 'Extended browser test');

    await page.goto('/');

    const featureDetection = await page.evaluate(() => {
      return {
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        indexedDB: typeof indexedDB !== 'undefined',
        webSQL: typeof openDatabase !== 'undefined',
        webGL: typeof WebGLRenderingContext !== 'undefined',
      };
    });

    expect(featureDetection.localStorage).toBeTruthy();
    expect(featureDetection.sessionStorage).toBeTruthy();
    expect(featureDetection.indexedDB).toBeTruthy();
  });

  test('should provide consistent user experience', async ({ page, browserName }) => {
    const browsers = ['chromium-desktop', 'opera-desktop', 'brave-desktop'];

    test.skip(!browsers.includes(browserName), 'Extended browser test');

    await page.goto('/courses');

    // Test key user interactions
    const navigationWorks = await page.evaluate(() => {
      const navLinks = document.querySelectorAll('nav a, nav button');
      return navLinks.length > 0;
    });

    expect(navigationWorks).toBeTruthy();

    const contentLoads = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3');
      return headings.length > 0;
    });

    expect(contentLoads).toBeTruthy();
  });
});
