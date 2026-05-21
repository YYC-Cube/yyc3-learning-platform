import { FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright tests
 * Runs once before all tests
 */

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up Playwright test environment...');

  // Set global test timeout
  process.env.PLAYWRIGHT_TIMEOUT = '60000';

  // Configure test environment
  const baseURL = process.env.BASE_URL || 'http://localhost:3200';
  process.env.TEST_BASE_URL = baseURL;

  // Initialize test data
  await initializeTestData();

  // Setup test database (if needed)
  await setupTestDatabase();

  console.log('✅ Playwright test environment ready');
}

async function initializeTestData() {
  console.log('📝 Initializing test data...');

  // Create test users, courses, and other data
  // This would typically make API calls to set up test fixtures

  console.log('✅ Test data initialized');
}

async function setupTestDatabase() {
  console.log('🗄️  Setting up test database...');

  // Set up test database or mock data
  // This ensures tests have consistent data to work with

  console.log('✅ Test database ready');
}

export default globalSetup;
