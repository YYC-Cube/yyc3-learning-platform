import { test, expect } from '@playwright/test';

/**
 * Performance & Regression E2E Tests
 * Tests for application performance characteristics
 */

test.describe('Performance & Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up performance monitoring
    await page.goto('/');
  });

  test('Core Web Vitals performance', async ({ page }) => {
    // Test Core Web Vitals metrics
    await test.step('Largest Contentful Paint (LCP)', async () => {
      const startTime = Date.now();
      await page.goto('/');

      // Wait for largest content element
      await page.waitForSelector('h1', { state: 'attached' });
      await page.waitForTimeout(1000); // Allow content to load

      const lcp = Date.now() - startTime;

      // LCP should be under 2.5 seconds
      expect(lcp).toBeLessThan(2500);
      console.log(`LCP: ${lcp}ms`);
    });

    await test.step('First Input Delay (FID)', async () => {
      await page.goto('/');

      // Measure interaction delay
      const fidStart = Date.now();
      await page.click('button:visible');
      const fid = Date.now() - fidStart;

      // FID should be under 100ms
      expect(fid).toBeLessThan(100);
      console.log(`FID: ${fid}ms`);
    });

    await test.step('Cumulative Layout Shift (CLS)', async () => {
      await page.goto('/');

      // Monitor layout shifts
      let layoutShifts = 0;

      await page.evaluate(() => {
        return new Promise((resolve) => {
          let cls = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                cls += entry.value;
              }
            }
          });
          observer.observe({ entryTypes: ['layout-shift'] });
          setTimeout(() => resolve(cls), 3000);
        });
      }).then((cls: number) => {
        layoutShifts = cls;
      });

      // CLS should be under 0.1
      expect(layoutShifts).toBeLessThan(0.1);
      console.log(`CLS: ${layoutShifts}`);
    });
  });

  test('page load performance', async ({ page }) => {
    // Test page loading characteristics
    await test.step('Time to First Byte (TTFB)', async () => {
      const ttfbStart = Date.now();
      await page.goto('/');

      const navigationEntry = await page.evaluate(() => {
        return performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      });

      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;

      // TTFB should be under 600ms
      expect(ttfb).toBeLessThan(600);
      console.log(`TTFB: ${ttfb}ms`);
    });

    await test.step('DOM Content Loaded', async () => {
      const dclStart = Date.now();
      await page.goto('/');

      await page.waitForLoadState('domcontentloaded');
      const dcl = Date.now() - dclStart;

      // DOM Content Loaded should be under 1.5 seconds
      expect(dcl).toBeLessThan(1500);
      console.log(`DOM Content Loaded: ${dcl}ms`);
    });

    await test.step('Window Onload', async () => {
      const loadStart = Date.now();
      await page.goto('/');

      await page.waitForLoadState('load');
      const load = Date.now() - loadStart;

      // Window onload should be under 3 seconds
      expect(load).toBeLessThan(3000);
      console.log(`Window Onload: ${load}ms`);
    });
  });

  test('resource loading performance', async ({ page }) => {
    // Test resource optimization
    await test.step('JavaScript bundle sizes', async () => {
      await page.goto('/');

      const jsResources = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        return resources
          .filter(r => r.name.endsWith('.js'))
          .map(r => ({
            name: r.name.split('/').pop(),
            size: r.transferSize,
            duration: r.duration
          }));
      });

      console.log('JavaScript Resources:', jsResources);

      // Check for large bundles (>200KB)
      const largeBundles = jsResources.filter(r => r.size > 200 * 1024);
      expect(largeBundles.length).toBe(0);
    });

    await test.step('CSS bundle sizes', async () => {
      await page.goto('/');

      const cssResources = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        return resources
          .filter(r => r.name.endsWith('.css'))
          .map(r => ({
            name: r.name.split('/').pop(),
            size: r.transferSize,
            duration: r.duration
          }));
      });

      console.log('CSS Resources:', cssResources);

      // Check for large stylesheets (>50KB)
      const largeStylesheets = cssResources.filter(r => r.size > 50 * 1024);
      expect(largeStylesheets.length).toBe(0);
    });

    await test.step('image optimization', async () => {
      await page.goto('/courses');

      const images = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        return resources
          .filter(r => r.name.match(/\.(jpg|jpeg|png|webp|avif)$/))
          .map(r => ({
            name: r.name.split('/').pop(),
            size: r.transferSize,
            duration: r.duration
          }));
      });

      console.log('Images:', images);

      // Check for unoptimized images (>200KB)
      const unoptimizedImages = images.filter(r => r.size > 200 * 1024);
      expect(unoptimizedImages.length).toBeLessThan(2); // Allow some hero images
    });
  });

  test('runtime performance', async ({ page }) => {
    // Test JavaScript execution performance
    await test.step('script execution time', async () => {
      await page.goto('/');

      const scriptTiming = await page.evaluate(() => {
        const measures = performance.getEntriesByType('measure') as PerformanceMeasure[];
        return measures.map(m => ({
          name: m.name,
          duration: m.duration
        }));
      });

      console.log('Script Timings:', scriptTiming);

      // Check for long-running tasks (>50ms)
      const longTasks = scriptTiming.filter(t => t.duration > 50);
      expect(longTasks.length).toBeLessThan(3);
    });

    await test.step('rendering performance', async () => {
      await page.goto('/');

      const renderMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domComplete: navigation.domComplete - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart
        };
      });

      console.log('Render Metrics:', renderMetrics);

      // Check rendering completion times
      expect(renderMetrics.domComplete).toBeLessThan(3000);
      expect(renderMetrics.loadComplete).toBeLessThan(5000);
    });
  });

  test('memory performance', async ({ page }) => {
    // Test memory usage characteristics
    await test.step('memory usage', async () => {
      await page.goto('/');

      const memoryInfo = await page.evaluate(() => {
        if ((performance as any).memory) {
          return {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      if (memoryInfo) {
        const usedMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
        const limitMB = memoryInfo.jsHeapSizeLimit / (1024 * 1024);
        const usagePercent = (usedMB / limitMB) * 100;

        console.log(`Memory Usage: ${usedMB.toFixed(2)}MB / ${limitMB.toFixed(2)}MB (${usagePercent.toFixed(1)}%)`);

        // Memory usage should be under 80%
        expect(usagePercent).toBeLessThan(80);
      }
    });

    await test.step('memory leak detection', async () => {
      const initialMemory = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });

      // Navigate through multiple pages
      await page.goto('/courses');
      await page.goto('/exam');
      await page.goto('/profile');

      const finalMemory = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });

      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = ((finalMemory - initialMemory) / initialMemory) * 100;

        console.log(`Memory Growth: ${memoryGrowth.toFixed(1)}%`);

        // Memory growth should be under 50% after navigation
        expect(memoryGrowth).toBeLessThan(50);
      }
    });
  });

  test('network performance', async ({ page }) => {
    // Test network efficiency
    await test.step('request count', async () => {
      await page.goto('/');

      const requestCount = await page.evaluate(() => {
        return performance.getEntriesByType('resource').length;
      });

      console.log(`Total Requests: ${requestCount}`);

      // Total requests should be under 30 (optimized)
      expect(requestCount).toBeLessThan(30);
    });

    await test.step('total transfer size', async () => {
      await page.goto('/');

      const totalSize = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        return resources.reduce((total, resource) => total + resource.transferSize, 0);
      });

      const sizeMB = totalSize / (1024 * 1024);

      console.log(`Total Transfer Size: ${sizeMB.toFixed(2)}MB`);

      // Page size should be under 1MB
      expect(sizeMB).toBeLessThan(1);
    });

    await test.step('caching effectiveness', async () => {
      await page.goto('/');

      // Load page again to test caching
      const secondLoadStart = Date.now();
      await page.goto('/');
      const secondLoadTime = Date.now() - secondLoadStart;

      console.log(`Second Load Time: ${secondLoadTime}ms`);

      // Second load should be faster due to caching
      expect(secondLoadTime).toBeLessThan(1500);
    });
  });

  test('user experience performance', async ({ page }) => {
    // Test user-centric performance metrics
    await test.step('time to interactive', async () => {
      await page.goto('/');

      // Wait for page to be interactive
      await page.waitForSelector('button:visible', { state: 'attached' });
      await page.waitForTimeout(500);

      const tti = await page.evaluate(() => {
        return performance.now();
      });

      // TTI should be under 3 seconds
      expect(tti).toBeLessThan(3000);
      console.log(`Time to Interactive: ${tti.toFixed(0)}ms`);
    });

    await test.step('interaction readiness', async () => {
      await page.goto('/');

      // Test if page responds quickly to user interaction
      const interactionStart = Date.now();

      await page.click('text=课程');
      await page.waitForURL('/courses');

      const interactionTime = Date.now() - interactionStart;

      // Interaction should complete within 1 second
      expect(interactionTime).toBeLessThan(1000);
      console.log(`Interaction Response: ${interactionTime}ms`);
    });

    await test.step('scrolling performance', async () => {
      await page.goto('/courses');

      // Test scrolling performance
      const scrollStart = Date.now();

      await page.evaluate(() => {
        return new Promise((resolve) => {
          let scrollCount = 0;
          const interval = setInterval(() => {
            window.scrollBy(0, 100);
            scrollCount++;
            if (scrollCount >= 10) {
              clearInterval(interval);
              resolve(true);
            }
          }, 50);
        });
      });

      const scrollTime = Date.now() - scrollStart;

      // Scrolling should be smooth (<1 second for 10 scrolls)
      expect(scrollTime).toBeLessThan(1000);
      console.log(`Scroll Performance: ${scrollTime}ms`);
    });
  });
});
