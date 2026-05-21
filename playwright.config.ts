import { defineConfig, devices } from '@playwright/test';

/**
 * Enhanced Playwright Configuration
 * Multi-browser support: Chromium, Firefox, WebKit
 * Mobile device support: iOS, Android
 * API performance testing integration
 */

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Multi-browser projects configuration
  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
    },

    // Microsoft Edge (Chromium-based)
    {
      name: 'edge-desktop',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },

    // Mobile devices - iOS
    {
      name: 'iphone-13',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },

    {
      name: 'iphone-13-pro-max',
      use: {
        ...devices['iPhone 13 Pro Max'],
        viewport: { width: 428, height: 926 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },

    {
      name: 'ipad-pro',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },

    // Mobile devices - Android
    {
      name: 'pixel-5',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
        deviceScaleFactor: 2.625,
        isMobile: true,
        hasTouch: true,
      },
    },

    {
      name: 'galaxy-s21',
      use: {
        ...devices['Galaxy S21'],
        viewport: { width: 360, height: 800 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },

    {
      name: 'tablet-android',
      use: {
        ...devices['Galaxy Tab S4'],
        viewport: { width: 712, height: 1138 },
        deviceScaleFactor: 2.625,
        isMobile: true,
        hasTouch: true,
      },
    },

    // Cross-browser regression tests
    {
      name: 'cross-browser-regression',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.mobile\.spec\.ts/,
    },

    // API performance testing
    {
      name: 'api-performance',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security'], // For API testing
        },
      },
    },

    // Mobile-only tests
    {
      name: 'mobile-tests',
      use: { ...devices['iPhone 13'] },
      testMatch: /.*\.mobile\.spec\.ts/,
    },
  ],

  // Development server configuration
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3200',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Test output configuration
  outputDir: 'test-results/',

  // Global setup and teardown
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',

  // Timeout configuration
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
});
