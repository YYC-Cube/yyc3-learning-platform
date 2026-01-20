/**
 * @fileoverview 课程学习流程E2E测试
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-29
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { test, expect } from '@playwright/test';

test.describe('课程学习流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3200');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('应该能够查看课程列表', async ({ page }) => {
    await page.click('text=课程');
    
    await expect(page).toHaveURL(/.*courses/);
    await expect(page.locator('h1')).toContainText('课程');
    await expect(page.locator('.course-card')).toHaveCount(10);
  });

  test('应该能够搜索课程', async ({ page }) => {
    await page.click('text=课程');
    
    await page.fill('input[placeholder="搜索课程"]', 'Python');
    await page.click('button[aria-label="搜索"]');
    
    await expect(page.locator('.course-card')).toHaveCount(3);
  });

  test('应该能够筛选课程', async ({ page }) => {
    await page.click('text=课程');
    
    await page.click('text=分类');
    await page.click('text=编程');
    
    await expect(page.locator('.course-card')).toHaveCount(5);
  });

  test('应该能够查看课程详情', async ({ page }) => {
    await page.click('text=课程');
    await page.click('.course-card:first-child');
    
    await expect(page).toHaveURL(/.*courses\/.*/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=课程介绍')).toBeVisible();
    await expect(page.locator('text=课程大纲')).toBeVisible();
  });

  test('应该能够开始学习课程', async ({ page }) => {
    await page.click('text=课程');
    await page.click('.course-card:first-child');
    await page.click('text=开始学习');
    
    await expect(page).toHaveURL(/.*courses\/.*\/learn/);
    await expect(page.locator('text=学习进度')).toBeVisible();
  });

  test('应该能够观看视频课程', async ({ page }) => {
    await page.click('text=课程');
    await page.click('.course-card:first-child');
    await page.click('text=开始学习');
    await page.click('.lesson-item:first-child');
    
    await expect(page.locator('video')).toBeVisible();
    await expect(page.locator('text=播放')).toBeVisible();
  });

  test('应该能够完成课程章节', async ({ page }) => {
    await page.click('text=课程');
    await page.click('.course-card:first-child');
    await page.click('text=开始学习');
    await page.click('.lesson-item:first-child');
    
    await page.click('text=标记为完成');
    
    await expect(page.locator('.lesson-item:first-child .completed')).toBeVisible();
  });

  test('应该能够查看学习进度', async ({ page }) => {
    await page.click('text=课程');
    await page.click('.course-card:first-child');
    
    await expect(page.locator('text=学习进度')).toBeVisible();
    await expect(page.locator('.progress-bar')).toBeVisible();
  });

  test('应该能够下载课程资料', async ({ page }) => {
    await page.click('text=课程');
    await page.click('.course-card:first-child');
    await page.click('text=资料');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=下载');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('应该能够收藏课程', async ({ page }) => {
    await page.click('text=课程');
    await page.click('.course-card:first-child');
    await page.click('button[aria-label="收藏"]');
    
    await expect(page.locator('button[aria-label="已收藏"]')).toBeVisible();
  });

  test('应该能够查看收藏的课程', async ({ page }) => {
    await page.click('text=我的课程');
    await page.click('text=收藏');
    
    await expect(page.locator('.course-card')).toHaveCount(3);
  });

  test('应该能够查看学习历史', async ({ page }) => {
    await page.click('text=我的课程');
    await page.click('text=学习历史');
    
    await expect(page.locator('.history-item')).toHaveCount(5);
  });

  test('应该能够继续上次学习', async ({ page }) => {
    await page.click('text=我的课程');
    await page.click('text=继续学习');
    
    await expect(page).toHaveURL(/.*courses\/.*\/learn/);
  });

  test('应该能够查看学习统计', async ({ page }) => {
    await page.click('text=我的课程');
    await page.click('text=学习统计');
    
    await expect(page.locator('text=总学习时长')).toBeVisible();
    await expect(page.locator('text=完成课程数')).toBeVisible();
    await expect(page.locator('text=学习天数')).toBeVisible();
  });

  test('应该能够评价课程', async ({ page }) => {
    await page.click('text=课程');
    await page.click('.course-card:first-child');
    await page.click('text=评价');
    
    await page.click('.star-rating .star:nth-child(5)');
    await page.fill('textarea[name="comment"]', '非常好的课程！');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=评价成功')).toBeVisible();
  });

  test('应该能够查看课程评价', async ({ page }) => {
    await page.click('text=课程');
    await page.click('.course-card:first-child');
    await page.click('text=评价');
    
    await expect(page.locator('.review-item')).toHaveCount(10);
  });

  test('应该能够分享课程', async ({ page }) => {
    await page.click('text=课程');
    await page.click('.course-card:first-child');
    await page.click('button[aria-label="分享"]');
    
    await expect(page.locator('.share-modal')).toBeVisible();
  });

  test('应该能够退出课程', async ({ page }) => {
    await page.click('text=课程');
    await page.click('.course-card:first-child');
    await page.click('text=开始学习');
    await page.click('text=退出学习');
    
    await expect(page).toHaveURL(/.*courses/);
  });
});
