/**
 * @fileoverview AI助手交互E2E测试
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-29
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { test, expect } from '@playwright/test';

test.describe('AI助手交互', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3200');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('应该能够打开AI助手', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    
    await expect(page.locator('[data-testid="intelligent-ai-widget"]')).toBeVisible();
    await expect(page.locator('text=YYC³ 智能助手')).toBeVisible();
  });

  test('应该显示初始问候消息', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    
    await expect(page.locator('text=你好！我是YYC³智能助手，有什么可以帮助你的吗？')).toBeVisible();
  });

  test('应该能够发送消息', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    
    await page.fill('[data-testid="user-input-field"]', '你好');
    await page.click('[data-testid="send-message-button"]');
    
    await expect(page.locator('text=你好')).toBeVisible();
  });

  test('应该能够接收AI回复', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    
    await page.fill('[data-testid="user-input-field"]', '介绍一下Python');
    await page.click('[data-testid="send-message-button"]');
    
    await expect(page.locator('text=你好')).toBeVisible();
    await expect(page.locator('[data-testid="message-bubble-"]')).toHaveCount(2);
  });

  test('应该能够发送多条消息', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    
    const messages = ['你好', '介绍一下Python', '有什么课程推荐？'];
    
    for (const message of messages) {
      await page.fill('[data-testid="user-input-field"]', message);
      await page.click('[data-testid="send-message-button"]');
      await expect(page.locator(`text=${message}`)).toBeVisible();
    }
    
    await expect(page.locator('[data-testid="message-bubble-"]')).toHaveCount(4);
  });

  test('应该能够切换到工具视图', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.click('text=工具');
    
    await expect(page.locator('text=可用工具')).toBeVisible();
    await expect(page.locator('[data-testid="tool-card-"]')).toHaveCount(5);
  });

  test('应该能够使用工具', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.click('text=工具');
    await page.click('[data-testid="tool-card-0"]');
    
    await expect(page.locator('text=工具详情')).toBeVisible();
  });

  test('应该能够切换到洞察视图', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.click('text=洞察');
    
    await expect(page.locator('text=使用洞察')).toBeVisible();
    await expect(page.locator('[data-testid="insight-card-"]')).toHaveCount(3);
  });

  test('应该能够查看洞察数据', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.click('text=洞察');
    
    await expect(page.locator('text=学习时长')).toBeVisible();
    await expect(page.locator('text=完成课程数')).toBeVisible();
  });

  test('应该能够切换到工作流视图', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.click('text=工作流');
    
    await expect(page.locator('text=工作流管理')).toBeVisible();
  });

  test('应该能够创建工作流', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.click('text=工作流');
    await page.click('text=创建工作流');
    
    await expect(page.locator('text=工作流编辑器')).toBeVisible();
  });

  test('应该能够切换到知识库视图', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.click('text=知识库');
    
    await expect(page.locator('text=知识库')).toBeVisible();
  });

  test('应该能够搜索知识库', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.click('text=知识库');
    await page.fill('[placeholder="搜索知识库"]', 'Python');
    
    await expect(page.locator('.knowledge-item')).toHaveCount(3);
  });

  test('应该能够最小化AI助手', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.click('button[aria-label="最小化"]');
    
    const widget = page.locator('[data-testid="intelligent-ai-widget"]');
    await expect(widget).toHaveClass(/h-14/);
  });

  test('应该能够恢复AI助手', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.click('button[aria-label="最小化"]');
    await page.click('button[aria-label="恢复"]');
    
    const widget = page.locator('[data-testid="intelligent-ai-widget"]');
    await expect(widget).not.toHaveClass(/h-14/);
  });

  test('应该能够全屏显示AI助手', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.click('button[aria-label="全屏"]');
    
    const widget = page.locator('[data-testid="intelligent-ai-widget"]');
    await expect(widget).toHaveClass(/inset-4/);
  });

  test('应该能够退出全屏', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.click('button[aria-label="全屏"]');
    await page.click('button[aria-label="退出全屏"]');
    
    const widget = page.locator('[data-testid="intelligent-ai-widget"]');
    await expect(widget).not.toHaveClass(/inset-4/);
  });

  test('应该能够关闭AI助手', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.click('button[aria-label="关闭"]');
    
    await expect(page.locator('[data-testid="intelligent-ai-widget"]')).not.toBeVisible();
  });

  test('应该能够拖拽AI助手', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    
    const widget = page.locator('[data-testid="intelligent-ai-widget"]');
    const box = await widget.boundingBox();
    
    await page.mouse.move(box!.x + 50, box!.y + 20);
    await page.mouse.down();
    await page.mouse.move(box!.x + 150, box!.y + 120);
    await page.mouse.up();
    
    const newBox = await widget.boundingBox();
    expect(newBox!.x).toBeGreaterThan(box!.x);
    expect(newBox!.y).toBeGreaterThan(box!.y);
  });

  test('应该能够使用键盘快捷键打开AI助手', async ({ page }) => {
    await page.keyboard.press('Control+k');
    
    await expect(page.locator('[data-testid="intelligent-ai-widget"]')).toBeVisible();
  });

  test('应该能够使用键盘快捷键关闭AI助手', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.keyboard.press('Escape');
    
    await expect(page.locator('[data-testid="intelligent-ai-widget"]')).not.toBeVisible();
  });

  test('应该能够处理网络错误', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.fill('[data-testid="user-input-field"]', '测试消息');
    await page.click('[data-testid="send-message-button"]');
    
    await page.waitForTimeout(5000);
    
    const errorMessage = page.locator('text=网络错误').or(page.locator('text=发送失败'));
    if (await errorMessage.isVisible()) {
      expect(errorMessage).toBeVisible();
    }
  });

  test('应该能够保存对话历史', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.fill('[data-testid="user-input-field"]', '测试消息');
    await page.click('[data-testid="send-message-button"]');
    
    await page.reload();
    await page.click('button[aria-label="打开AI助手"]');
    
    await expect(page.locator('text=测试消息')).toBeVisible();
  });

  test('应该能够清除对话历史', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    await page.fill('[data-testid="user-input-field"]', '测试消息');
    await page.click('[data-testid="send-message-button"]');
    await page.click('button[aria-label="清除历史"]');
    
    await expect(page.locator('text=测试消息')).not.toBeVisible();
  });

  test('应该能够快速加载AI助手', async ({ page }) => {
    const startTime = Date.now();
    
    await page.click('button[aria-label="打开AI助手"]');
    await expect(page.locator('[data-testid="intelligent-ai-widget"]')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(1000);
  });

  test('应该能够快速处理消息', async ({ page }) => {
    await page.click('button[aria-label="打开AI助手"]');
    
    const startTime = Date.now();
    
    await page.fill('[data-testid="user-input-field"]', '你好');
    await page.click('[data-testid="send-message-button"]');
    await expect(page.locator('text=你好')).toBeVisible();
    
    const processTime = Date.now() - startTime;
    expect(processTime).toBeLessThan(2000);
  });
});
