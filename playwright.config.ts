import { defineConfig, devices } from '@playwright/test';

/**
 * Comprehensive Playwright Configuration
 * Multi-browser support: Chromium, Firefox, WebKit, Edge, Opera, Brave
 * Mobile device support: iOS, Android, Tablets, Foldables
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

  // Enhanced multi-browser projects configuration
  projects: [
    // === Core Desktop Browsers ===
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

    {
      name: 'edge-desktop',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },

    // === Extended Browser Support ===
    {
      name: 'opera-desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'opera', // Opera is Chromium-based
        launchOptions: {
          args: ['--disable-web-security'], // For testing purposes
        },
      },
    },

    {
      name: 'brave-desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'brave', // Brave is Chromium-based
        launchOptions: {
          args: ['--disable-web-security'], // For testing purposes
        },
      },
    },

    // === iOS Devices ===
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
      name: 'iphone-14-pro',
      use: {
        ...devices['iPhone 14 Pro'],
        viewport: { width: 393, height: 852 },
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

    {
      name: 'ipad-air',
      use: {
        ...devices['iPad Air'],
        viewport: { width: 820, height: 1180 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },

    // === Android Devices ===
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
      name: 'pixel-6-pro',
      use: {
        ...devices['Pixel 6 Pro'],
        viewport: { width: 412, height: 915 },
        deviceScaleFactor: 3.5,
        isMobile: true,
        hasTouch: true,
      },
    },

    {
      name: 'pixel-7',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 412, height: 915 },
        deviceScaleFactor: 3.5,
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
      name: 'galaxy-s23',
      use: {
        ...devices['Galaxy S23'],
        viewport: { width: 360, height: 800 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },

    {
      name: 'galaxy-tab-s4',
      use: {
        ...devices['Galaxy Tab S4'],
        viewport: { width: 712, height: 1138 },
        deviceScaleFactor: 2.625,
        isMobile: true,
        hasTouch: true,
      },
    },

    {
      name: 'galaxy-tab-s8',
      use: {
        ...devices['Galaxy Tab S8'],
        viewport: { width: 800, height: 1280 },
        deviceScaleFactor: 2.625,
        isMobile: true,
        hasTouch: true,
      },
    },

    // === Foldable Devices ===
    {
      name: 'galaxy-z-fold4',
      use: {
        viewport: { width: 361, height: 850 }, // Folded state
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-F936B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
      },
    },

    {
      name: 'galaxy-z-fold4-unfolded',
      use: {
        viewport: { width: 1812, height: 2172 }, // Unfolded state
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-F936B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
      },
    },

    {
      name: 'huawei-mate-x3',
      use: {
        viewport: { width: 384, height: 851 }, // Folded state
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; ALT-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
      },
    },

    {
      name: 'huawei-mate-x3-unfolded',
      use: {
        viewport: { width: 1920, height: 1024 }, // Unfolded state
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; ALT-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
      },
    },

    {
      name: 'microsoft-surface-duo',
      use: {
        viewport: { width: 720, height: 1280 }, // Tablet mode
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      },
    },

    // === Large Tablets ===
    {
      name: 'ipad-pro-12-9',
      use: {
        viewport: { width: 1024, height: 1366 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },

    {
      name: 'ipad-pro-11',
      use: {
        viewport: { width: 834, height: 1194 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },

    {
      name: 'galaxy-tab-s8-ultra',
      use: {
        viewport: { width: 1854, height: 2560 },
        deviceScaleFactor: 2.625,
        isMobile: true,
        hasTouch: true,
      },
    },

    // === Specialized Testing Projects ===
    {
      name: 'cross-browser-regression',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.mobile\.spec\.ts/,
    },

    {
      name: 'extended-browser-compatibility',
      testMatch: /e2e\/extended-browsers\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'mobile-tests',
      use: { ...devices['iPhone 13'] },
      testMatch: /.*\.mobile\.spec\.ts/,
    },

    {
      name: 'foldable-tests',
      testMatch: /e2e\/foldable\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'tablet-tests',
      testMatch: /e2e\/tablet\.spec\.ts/,
      use: { ...devices['iPad Pro'] },
    },

    {
      name: 'api-performance',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security'],
        },
      },
    },

    {
      name: 'performance-baseline',
      testMatch: /e2e\/performance-baseline\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
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
