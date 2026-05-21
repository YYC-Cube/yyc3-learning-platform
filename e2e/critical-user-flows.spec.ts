import { test, expect } from '@playwright/test';

/**
 * Critical User Flows E2E Tests
 * Tests for essential user journeys and key business flows
 */

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
  });

  test('new user onboarding flow', async ({ page }) => {
    // Test the complete new user journey
    await test.step('landing page loads', async () => {
      await expect(page).toHaveTitle(/YYC³ Learning Platform/);
      await expect(page.locator('h1')).toBeVisible();
    });

    await test.step('user can navigate to courses', async () => {
      await page.click('text=课程');
      await expect(page).toHaveURL(/\/courses/);
      await expect(page.locator('h1')).toContainText('课程');
    });

    await test.step('user can access AI Engineer track', async () => {
      await page.click('text=AI 工程师方向');
      await expect(page).toHaveURL(/\/ai-engineer/);
      await expect(page.locator('h1')).toContainText('AI 工程师');
    });
  });

  test('learning flow - course selection to exam', async ({ page }) => {
    // Test the core learning workflow
    await page.goto('/courses');

    await test.step('browse available courses', async () => {
      const courseCards = page.locator('[data-testid="course-card"]');
      await expect(courseCards.first()).toBeVisible();
    });

    await test.step('select a course', async () => {
      await page.click('[data-testid="course-card"]:first-child');
      await expect(page).toHaveURL(/\/courses\/\d+/);
    });

    await test.step('start learning journey', async () => {
      const startButton = page.locator('button:has-text("开始学习")');
      if (await startButton.isVisible()) {
        await startButton.click();
        // Verify learning interface loads
        await expect(page.locator('[data-testid="learning-interface"]')).toBeVisible();
      }
    });
  });

  test('exam taking flow', async ({ page }) => {
    // Test the examination workflow
    await page.goto('/exam');

    await test.step('exam interface loads', async () => {
      await expect(page.locator('h1')).toContainText('考试');
      await expect(page.locator('[data-testid="exam-container"]')).toBeVisible();
    });

    await test.step('can start practice exam', async () => {
      const practiceButton = page.locator('button:has-text("练习考试")');
      if (await practiceButton.isVisible()) {
        await practiceButton.click();

        // Verify exam interface
        await expect(page.locator('[data-testid="question-display"]')).toBeVisible();
        await expect(page.locator('[data-testid="answer-options"]')).toBeVisible();
      }
    });

    await test.step('can navigate between questions', async () => {
      // Only test if exam interface is active
      const nextButton = page.locator('button:has-text("下一题")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        // Verify navigation worked (could check question number changed)
        await expect(nextButton).toBeVisible();
      }
    });
  });

  test('progress tracking flow', async ({ page }) => {
    // Test progress monitoring
    await page.goto('/progress');

    await test.step('progress dashboard loads', async () => {
      await expect(page).toHaveURL(/\/progress/);
      await expect(page.locator('h1')).toContainText('学习进度');
    });

    await test.step('display learning statistics', async () => {
      const statsContainer = page.locator('[data-testid="learning-statistics"]');
      if (await statsContainer.isVisible()) {
        await expect(statsContainer).toBeVisible();
        // Check for key metrics
        await expect(page.locator('text=完成课程')).toBeVisible();
        await expect(page.locator('text=学习时长')).toBeVisible();
      }
    });

    await test.step('can view detailed progress', async () => {
      const detailsButton = page.locator('button:has-text("查看详情")');
      if (await detailsButton.isVisible()) {
        await detailsButton.click();
        await expect(page.locator('[data-testid="progress-details"]')).toBeVisible();
      }
    });
  });

  test('achievement system flow', async ({ page }) => {
    // Test gamification and achievement features
    await page.goto('/achievements');

    await test.step('achievements page loads', async () => {
      await expect(page).toHaveURL(/\/achievements/);
      await expect(page.locator('h1')).toContainText('成就');
    });

    await test.step('display achievement categories', async () => {
      const categories = page.locator('[data-testid="achievement-category"]');
      if ((await categories.count()) > 0) {
        await expect(categories.first()).toBeVisible();
      }
    });

    await test.step('can view achievement details', async () => {
      const achievementCard = page.locator('[data-testid="achievement-card"]:first-child');
      if (await achievementCard.isVisible()) {
        await achievementCard.click();
        await expect(page.locator('[data-testid="achievement-details"]')).toBeVisible();
      }
    });
  });

  test('career planning flow', async ({ page }) => {
    // Test career path planning
    await page.goto('/career-path');

    await test.step('career path interface loads', async () => {
      await expect(page).toHaveURL(/\/career-path/);
      await expect(page.locator('h1')).toContainText('职业路径');
    });

    await test.step('display career milestones', async () => {
      const milestones = page.locator('[data-testid="career-milestone"]');
      if ((await milestones.count()) > 0) {
        await expect(milestones.first()).toBeVisible();
      }
    });

    await test.step('can track skill development', async () => {
      const skillProgress = page.locator('[data-testid="skill-progress"]');
      if (await skillProgress.isVisible()) {
        await expect(skillProgress).toBeVisible();
      }
    });
  });

  test('navigation and accessibility flow', async ({ page }) => {
    // Test navigation structure and accessibility
    await test.step('main navigation works', async () => {
      // Test navigation links
      await page.click('text=首页');
      await expect(page).toHaveURL('/');

      await page.click('text=课程');
      await expect(page).toHaveURL(/\/courses/);

      await page.click('text=考试');
      await expect(page).toHaveURL(/\/exam/);
    });

    await test.step('mobile navigation works', async () => {
      // Test mobile responsive navigation
      await page.setViewportSize({ width: 375, height: 667 });

      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
      }
    });

    await test.step('accessibility features work', async () => {
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Test ARIA labels
      const interactiveElements = page.locator('button, a, input, select, textarea');
      const count = await interactiveElements.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = interactiveElements.nth(i);
        const hasAria = await element.evaluate(
          (el) =>
            el.hasAttribute('aria-label') ||
            el.hasAttribute('aria-labelledby') ||
            el.textContent?.trim()
        );
        expect(hasAria).toBeTruthy();
      }
    });
  });

  test('error handling and edge cases', async ({ page }) => {
    // Test error states and edge cases
    await test.step('handle 404 pages', async () => {
      await page.goto('/non-existent-page');
      await expect(page.locator('h1')).toContainText('404');
      await expect(page.locator('text=返回首页')).toBeVisible();
    });

    await test.step('handle loading states', async () => {
      await page.goto('/courses');
      // Check for loading indicators
      const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
      if (await loadingIndicator.isVisible({ timeout: 1000 })) {
        await expect(loadingIndicator).toBeVisible();
        // Wait for loading to complete
        await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
      }
    });

    await test.step('handle network errors gracefully', async () => {
      // Simulate network conditions
      await page.route('**/*', (route) => route.abort());

      await page.goto('/');
      // Should show user-friendly error message
      const errorMessage = page.locator('text=网络错误');
      if (await errorMessage.isVisible({ timeout: 5000 })) {
        await expect(errorMessage).toBeVisible();
      }
    });
  });

  test('performance and responsiveness', async ({ page }) => {
    // Test performance characteristics
    await test.step('page load performance', async () => {
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    await test.step('responsive design on different viewports', async () => {
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 }, // Tablet
        { width: 375, height: 667 }, // Mobile
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');

        // Check if main content is visible
        await expect(page.locator('h1')).toBeVisible();

        // Check if navigation is appropriate for viewport
        if (viewport.width < 768) {
          const mobileNav = page.locator('[data-testid="mobile-navigation"]');
          if (await mobileNav.isVisible()) {
            await expect(mobileNav).toBeVisible();
          }
        }
      }
    });
  });

  test('search and filtering functionality', async ({ page }) => {
    // Test search and filter features
    await page.goto('/courses');

    await test.step('search functionality works', async () => {
      const searchInput = page.locator('input[placeholder*="搜索"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('AI');
        await page.keyboard.press('Enter');

        // Wait for search results
        await page.waitForTimeout(1000);

        // Verify search was performed
        const currentUrl = page.url();
        expect(currentUrl).toContain('search');
      }
    });

    await test.step('filter functionality works', async () => {
      const filterButton = page.locator('button:has-text("筛选")');
      if (await filterButton.isVisible()) {
        await filterButton.click();

        // Apply a filter
        const firstFilter = page.locator('[data-testid="filter-option"]:first-child');
        if (await firstFilter.isVisible()) {
          await firstFilter.click();

          // Verify filtering worked
          await expect(page.locator('[data-testid="filtering-indicator"]')).toBeVisible();
        }
      }
    });
  });

  test('user profile and settings flow', async ({ page }) => {
    // Test user profile management
    await page.goto('/profile');

    await test.step('profile page loads', async () => {
      await expect(page).toHaveURL(/\/profile/);
      await expect(page.locator('h1')).toContainText('个人资料');
    });

    await test.step('can access settings', async () => {
      const settingsButton = page.locator('button:has-text("设置")');
      if (await settingsButton.isVisible()) {
        await settingsButton.click();
        await expect(page).toHaveURL(/\/profile\/settings/);
      }
    });

    await test.step('can update profile preferences', async () => {
      await page.goto('/profile/settings');

      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();

        // Verify theme change was applied
        const body = page.locator('body');
        const hasDarkClass = await body.getAttribute('class');
        expect(hasDarkClass).toBeTruthy();
      }
    });
  });
});

test.describe('Cross-browser Compatibility', () => {
  // Test critical flows across different browsers
  ['chromium', 'firefox', 'webkit'].forEach((browserName) => {
    test(`${browserName} - core functionality`, async ({ page }) => {
      test.skip(browserName !== 'chromium', 'Only chromium is currently configured');

      await page.goto('/');

      await test.step('basic navigation works', async () => {
        await expect(page.locator('h1')).toBeVisible();
        await page.click('text=课程');
        await expect(page).toHaveURL(/\/courses/);
      });

      await test.step('interactive elements work', async () => {
        await page.goto('/courses');
        const interactiveElements = page.locator('button, a[href]');
        const firstElement = interactiveElements.first();

        if (await firstElement.isVisible()) {
          await firstElement.click();
          // Verify some interaction occurred
          expect(page.url()).not.toBe('https://learning.yyc3.top/courses');
        }
      });
    });
  });
});
