import { test, expect } from '@playwright/test';

/**
 * API Performance Baseline Tests
 * Establishes and validates performance benchmarks for all API endpoints
 */

test.describe.configure({ mode: 'serial' }); // Baseline tests must run sequentially

// Performance baseline thresholds (in milliseconds)
const BASELINE_THRESHOLDS = {
  // Health endpoints
  health: { p50: 50, p95: 100, p99: 200 },

  // Course endpoints
  coursesList: { p50: 200, p95: 500, p99: 1000 },
  courseDetail: { p50: 150, p95: 400, p99: 800 },
  courseCreate: { p50: 300, p95: 700, p99: 1500 },

  // Exam endpoints
  examList: { p50: 200, p95: 500, p99: 1000 },
  examDetail: { p50: 150, p95: 400, p99: 800 },
  examSubmit: { p50: 500, p95: 1200, p99: 2500 },

  // User endpoints
  userProfile: { p50: 150, p95: 400, p99: 800 },
  userLogin: { p50: 300, p95: 800, p99: 1500 },
  userUpdate: { p50: 250, p95: 600, p99: 1200 },

  // Statistics endpoints
  statsOverview: { p50: 300, p95: 700, p99: 1400 },
  statsDetailed: { p50: 500, p95: 1200, p99: 2500 },
};

// Performance regression tolerance (percentage)
const REGRESSION_TOLERANCE = 10;

test.describe('API Performance Baseline Establishment', () => {
  const performanceResults: Record<string, number[]> = {};

  test.beforeAll(async ({ request }) => {
    console.log('🎯 Establishing API Performance Baselines');
  });

  test('should baseline GET /api/health', async ({ request }) => {
    const timings: number[] = [];

    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      const response = await request.get('/api/health');
      const duration = Date.now() - startTime;

      expect(response.status()).toBe(200);
      timings.push(duration);
    }

    performanceResults.health = timings;

    const metrics = calculateMetrics(timings);
    console.log('📍 Health Check Baseline:', metrics);

    // Validate against baseline thresholds
    expect(metrics.p50).toBeLessThanOrEqual(BASELINE_THRESHOLDS.health.p50);
    expect(metrics.p95).toBeLessThanOrEqual(BASELINE_THRESHOLDS.health.p95);
    expect(metrics.p99).toBeLessThanOrEqual(BASELINE_THRESHOLDS.health.p99);
  });

  test('should baseline GET /api/courses', async ({ request }) => {
    const timings: number[] = [];

    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      const response = await request.get('/api/courses');
      const duration = Date.now() - startTime;

      expect(response.status()).toBe(200);
      timings.push(duration);
    }

    performanceResults.coursesList = timings;

    const metrics = calculateMetrics(timings);
    console.log('📍 Courses List Baseline:', metrics);

    expect(metrics.p50).toBeLessThanOrEqual(BASELINE_THRESHOLDS.coursesList.p50);
    expect(metrics.p95).toBeLessThanOrEqual(BASELINE_THRESHOLDS.coursesList.p95);
    expect(metrics.p99).toBeLessThanOrEqual(BASELINE_THRESHOLDS.coursesList.p99);
  });

  test('should baseline GET /api/courses/:id', async ({ request }) => {
    const timings: number[] = [];

    // First, get a valid course ID
    const coursesResponse = await request.get('/api/courses');
    const courses = await coursesResponse.json();
    const courseId = courses[0]?.id || 1;

    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      const response = await request.get(`/api/courses/${courseId}`);
      const duration = Date.now() - startTime;

      expect(response.status()).toBe(200);
      timings.push(duration);
    }

    performanceResults.courseDetail = timings;

    const metrics = calculateMetrics(timings);
    console.log('📍 Course Detail Baseline:', metrics);

    expect(metrics.p50).toBeLessThanOrEqual(BASELINE_THRESHOLDS.courseDetail.p50);
    expect(metrics.p95).toBeLessThanOrEqual(BASELINE_THRESHOLDS.courseDetail.p95);
    expect(metrics.p99).toBeLessThanOrEqual(BASELINE_THRESHOLDS.courseDetail.p99);
  });

  test('should baseline GET /api/exam', async ({ request }) => {
    const timings: number[] = [];

    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      const response = await request.get('/api/exam');
      const duration = Date.now() - startTime;

      expect(response.status()).toBe(200);
      timings.push(duration);
    }

    performanceResults.examList = timings;

    const metrics = calculateMetrics(timings);
    console.log('📍 Exam List Baseline:', metrics);

    expect(metrics.p50).toBeLessThanOrEqual(BASELINE_THRESHOLDS.examList.p50);
    expect(metrics.p95).toBeLessThanOrEqual(BASELINE_THRESHOLDS.examList.p95);
    expect(metrics.p99).toBeLessThanOrEqual(BASELINE_THRESHOLDS.examList.p99);
  });

  test('should baseline GET /api/profile', async ({ request }) => {
    const timings: number[] = [];

    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      const response = await request.get('/api/profile');
      const duration = Date.now() - startTime;

      // May be 401 if not authenticated, but should be fast
      expect([200, 401]).toContain(response.status());
      timings.push(duration);
    }

    performanceResults.userProfile = timings;

    const metrics = calculateMetrics(timings);
    console.log('📍 User Profile Baseline:', metrics);

    expect(metrics.p50).toBeLessThanOrEqual(BASELINE_THRESHOLDS.userProfile.p50);
    expect(metrics.p95).toBeLessThanOrEqual(BASELINE_THRESHOLDS.userProfile.p95);
    expect(metrics.p99).toBeLessThanOrEqual(BASELINE_THRESHOLDS.userProfile.p99);
  });

  test.afterAll(async ({}) => {
    console.log('✅ API Performance Baselines Established');
    console.log('📊 Performance Summary:', summarizePerformance(performanceResults));
  });
});

test.describe('API Performance Regression Detection', () => {
  test('should detect performance regressions', async ({ request }) => {
    console.log('🔍 Testing for performance regressions...');

    const endpoints = [
      { path: '/api/health', name: 'health', threshold: BASELINE_THRESHOLDS.health },
      { path: '/api/courses', name: 'coursesList', threshold: BASELINE_THRESHOLDS.coursesList },
      { path: '/api/exam', name: 'examList', threshold: BASELINE_THRESHOLDS.examList },
    ];

    for (const endpoint of endpoints) {
      const timings: number[] = [];

      // Collect 5 samples
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        const response = await request.get(endpoint.path);
        const duration = Date.now() - startTime;

        expect(response.status()).toBe(200);
        timings.push(duration);
      }

      const metrics = calculateMetrics(timings);
      const threshold = endpoint.threshold;

      // Check for regressions
      const p50Regression = metrics.p50 > threshold.p50 * (1 + REGRESSION_TOLERANCE / 100);
      const p95Regression = metrics.p95 > threshold.p95 * (1 + REGRESSION_TOLERANCE / 100);
      const p99Regression = metrics.p99 > threshold.p99 * (1 + REGRESSION_TOLERANCE / 100);

      if (p50Regression || p95Regression || p99Regression) {
        console.warn(`⚠️  Potential regression detected in ${endpoint.name}:`);
        console.warn(
          `   Current: p50=${metrics.p50}ms, p95=${metrics.p95}ms, p99=${metrics.p99}ms`
        );
        console.warn(
          `   Baseline: p50=${threshold.p50}ms, p95=${threshold.p95}ms, p99=${threshold.p99}ms`
        );
      } else {
        console.log(`✅ ${endpoint.name}: No regression detected`);
      }

      // Fail test if significant regression detected (> 20% degradation)
      const CRITICAL_TOLERANCE = 20;
      const criticalRegression = metrics.p95 > threshold.p95 * (1 + CRITICAL_TOLERANCE / 100);
      expect(criticalRegression).toBeFalsy();
    }
  });
});

test.describe('API Performance Under Load', () => {
  test('should maintain performance under concurrent load', async ({ request }) => {
    console.log('🔥 Testing performance under concurrent load...');

    const endpoint = '/api/courses';
    const concurrentRequests = 20;
    const timings: number[] = [];

    // Fire concurrent requests
    const requests = Array.from({ length: concurrentRequests }, async () => {
      const startTime = Date.now();
      try {
        const response = await request.get(endpoint);
        const duration = Date.now() - startTime;
        timings.push(duration);
        expect(response.status()).toBe(200);
      } catch (error) {
        console.error('Request failed:', error);
      }
    });

    await Promise.all(requests);

    const metrics = calculateMetrics(timings);
    console.log('📊 Concurrent Load Performance:', metrics);

    // Performance should not degrade significantly under load
    expect(metrics.p95).toBeLessThan(BASELINE_THRESHOLDS.coursesList.p95 * 2);
    expect(metrics.p99).toBeLessThan(BASELINE_THRESHOLDS.coursesList.p99 * 2);

    // Success rate should be high
    const successRate = timings.length / concurrentRequests;
    expect(successRate).toBeGreaterThan(0.95); // 95% success rate
  });
});

test.describe('API Performance Trends', () => {
  test('should track performance trends over time', async ({ request }) => {
    console.log('📈 Analyzing performance trends...');

    const iterations = 5;
    const endpoint = '/api/health';
    const trendData: Array<{ iteration: number; p50: number; p95: number; p99: number }> = [];

    for (let i = 0; i < iterations; i++) {
      const timings: number[] = [];

      for (let j = 0; j < 5; j++) {
        const startTime = Date.now();
        const response = await request.get(endpoint);
        const duration = Date.now() - startTime;

        expect(response.status()).toBe(200);
        timings.push(duration);
      }

      const metrics = calculateMetrics(timings);
      trendData.push({ iteration: i + 1, ...metrics });

      // Small delay between iterations
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('📊 Performance Trend Data:', trendData);

    // Check if performance is stable (no significant upward trend)
    const firstP95 = trendData[0].p95;
    const lastP95 = trendData[trendData.length - 1].p95;
    const trendChange = ((lastP95 - firstP95) / firstP95) * 100;

    console.log(`📈 P95 Trend Change: ${trendChange.toFixed(2)}%`);

    // Performance should not degrade significantly during test
    expect(trendChange).toBeLessThan(REGRESSION_TOLERANCE);
  });
});

test.describe('Network Performance', () => {
  test('should test performance with slow network', async ({ page }) => {
    console.log('🐢 Testing with slow network conditions...');

    // Simulate slow 3G network
    await page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 200)); // Add 200ms delay
      return route.continue();
    });

    const timings: number[] = [];

    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      const response = await page.request.get('/api/health');
      const duration = Date.now() - startTime;

      expect(response.status()).toBe(200);
      timings.push(duration);
    }

    const metrics = calculateMetrics(timings);
    console.log('📊 Slow Network Performance:', metrics);

    // Should still respond within reasonable time (< 3s P95)
    expect(metrics.p95).toBeLessThan(3000);
  });
});

test.describe('Resource Utilization', () => {
  test('should monitor memory usage during API calls', async ({ page }) => {
    console.log('💾 Monitoring memory usage...');

    await page.goto('/');

    const memoryBefore = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Make multiple API calls
    for (let i = 0; i < 10; i++) {
      await page.evaluate(async () => {
        const response = await fetch('/api/courses');
        return response.ok;
      });
      await page.waitForTimeout(100);
    }

    const memoryAfter = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    const memoryGrowth = ((memoryAfter - memoryBefore) / memoryBefore) * 100;

    console.log(`💾 Memory Growth: ${memoryGrowth.toFixed(2)}%`);

    // Memory growth should be reasonable (< 50%)
    expect(memoryGrowth).toBeLessThan(50);
  });
});

// Helper functions
function calculateMetrics(timings: number[]) {
  const sorted = [...timings].sort((a, b) => a - b);
  const len = sorted.length;

  return {
    p50: sorted[Math.floor(len * 0.5)],
    p95: sorted[Math.floor(len * 0.95)],
    p99: sorted[Math.floor(len * 0.99)],
    avg: sorted.reduce((sum, val) => sum + val, 0) / len,
    min: sorted[0],
    max: sorted[len - 1],
    count: len,
  };
}

function summarizePerformance(results: Record<string, number[]>) {
  const summary: Record<string, any> = {};

  for (const [endpoint, timings] of Object.entries(results)) {
    summary[endpoint] = calculateMetrics(timings);
  }

  return summary;
}
