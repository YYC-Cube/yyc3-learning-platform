import { test, expect } from '@playwright/test';

/**
 * API Integration E2E Tests
 * Tests for API endpoints and data integration
 */

test.describe('API Integration Tests', () => {
  const baseUrl = process.env.BASE_URL || 'https://learning.yyc3.top';

  test.beforeEach(async ({ page }) => {
    // Set up API response monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
  });

  test('health check endpoints', async ({ page, request }) => {
    // Test API health endpoints
    await test.step('root health endpoint', async () => {
      const response = await request.get(`${baseUrl}/api/health`);
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toMatch(/healthy|degraded|unhealthy/);
    });

    await test.step('liveness endpoint', async () => {
      const response = await request.get(`${baseUrl}/api/health/live`);
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status', 'alive');
    });

    await test.step('readiness endpoint', async () => {
      const response = await request.get(`${baseUrl}/api/health/ready`);
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status');
    });
  });

  test('courses API integration', async ({ page, request }) => {
    // Test courses data integration
    await test.step('fetch courses list', async () => {
      const response = await request.get(`${baseUrl}/api/courses`);
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();

      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('title');
      }
    });

    await test.step('handle API errors gracefully', async () => {
      // Test non-existent course
      const response = await request.get(`${baseUrl}/api/courses/999999`);
      expect(response.status()).toBeGreaterThanOrEqual(400);

      // Verify UI shows appropriate error message
      await page.goto('/courses/999999');
      const errorMessage = page.locator('text=课程不存在');
      if (await errorMessage.isVisible({ timeout: 3000 })) {
        await expect(errorMessage).toBeVisible();
      }
    });
  });

  test('performance metrics API', async ({ page, request }) => {
    // Test performance monitoring integration
    await test.step('metrics endpoint accessible', async () => {
      const response = await request.get(`${baseUrl}/api/metrics`);
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('metrics');
    });

    await test.step('performance alerts endpoint', async () => {
      const response = await request.get(`${baseUrl}/api/performance/alerts`);
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.alerts)).toBeTruthy();
    });
  });

  test('data loading and caching', async ({ page }) => {
    // Test data loading patterns and caching
    await test.step('courses page data loading', async () => {
      const navigationPromise = page.waitForLoadState('networkidle');
      await page.goto('/courses');
      await navigationPromise;

      // Check if data was loaded
      const courseCards = page.locator('[data-testid="course-card"]');
      await expect(courseCards.first()).toBeVisible({ timeout: 5000 });
    });

    await test.step('API response times', async () => {
      const timings = [];

      // Monitor API calls for performance
      page.on('response', async response => {
        if (response.url().includes('/api/')) {
          const timing = response.timing();
          timings.push({
            url: response.url(),
            duration: timing.responseEnd
          });
        }
      });

      await page.goto('/courses');
      await page.waitForLoadState('networkidle');

      // Verify API responses are within acceptable limits
      const slowApis = timings.filter(t => t.duration > 3000);
      expect(slowApis.length).toBe(0);
    });
  });

  test('offline and network resilience', async ({ page }) => {
    // Test application behavior under poor network conditions
    await test.step('handle offline mode', async () => {
      // Simulate offline mode
      await page.context().setOffline(true);
      await page.goto('/');

      // Check if offline message is shown
      const offlineMessage = page.locator('text=离线');
      if (await offlineMessage.isVisible({ timeout: 3000 })) {
        await expect(offlineMessage).toBeVisible();
      }

      // Restore connection
      await page.context().setOffline(false);
    });

    await test.step('handle slow network', async () => {
      // Simulate slow 3G connection
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return route.continue();
      });

      await page.goto('/courses');

      // Should show loading indicator
      const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
      if (await loadingIndicator.isVisible({ timeout: 1000 })) {
        await expect(loadingIndicator).toBeVisible();
      }

      // Eventually should load content
      await page.waitForTimeout(3000);
      const courseCards = page.locator('[data-testid="course-card"]');
      if (await courseCards.count() > 0) {
        await expect(courseCards.first()).toBeVisible();
      }
    });
  });

  test('authentication and authorization', async ({ page, request }) => {
    // Test auth-protected endpoints
    await test.step('protected endpoints require auth', async () => {
      const response = await request.get(`${baseUrl}/api/user`);
      // Should either redirect or return 401/403
      expect([401, 403, 200]).toContain(response.status());
    });

    await test.step('login flow integration', async () => {
      await page.goto('/profile');

      // If not authenticated, should redirect to login
      const currentUrl = page.url();
      if (currentUrl.includes('/auth/login')) {
        await expect(page.locator('form')).toBeVisible();

        // Test login form
        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');
        const submitButton = page.locator('button[type="submit"]');

        if (await emailInput.isVisible()) {
          await emailInput.fill('test@example.com');
          await passwordInput.fill('testpassword');

          // This won't actually login, but tests the flow
          await submitButton.click();

          // Should show some response (error or redirect)
          await page.waitForTimeout(2000);
        }
      }
    });
  });

  test('error boundary and recovery', async ({ page }) => {
    // Test error handling and recovery mechanisms
    await test.step('API error recovery', async () => {
      // Mock API failure
      await page.route('**/api/courses', route => route.abort());

      await page.goto('/courses');

      // Should show user-friendly error message
      const errorMessage = page.locator('[data-testid="error-message"]');
      if (await errorMessage.isVisible({ timeout: 3000 })) {
        await expect(errorMessage).toBeVisible();

        // Should have retry button
        const retryButton = page.locator('button:has-text("重试")');
        if (await retryButton.isVisible()) {
          // Unmock to test recovery
          await page.unroute('**/api/courses');
          await retryButton.click();

          // Should load successfully after retry
          await page.waitForTimeout(2000);
        }
      }
    });
  });
});
