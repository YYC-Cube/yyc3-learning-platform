/**
 * @fileoverview 用户注册流程E2E测试
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-29
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { test, expect } from '@playwright/test';

test.describe('用户注册流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3200');
  });

  test('应该能够访问注册页面', async ({ page }) => {
    await page.click('text=注册');
    
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('h1')).toContainText('注册');
  });

  test('应该显示注册表单', async ({ page }) => {
    await page.click('text=注册');
    
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('应该验证必填字段', async ({ page }) => {
    await page.click('text=注册');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=用户名不能为空')).toBeVisible();
    await expect(page.locator('text=邮箱不能为空')).toBeVisible();
    await expect(page.locator('text=密码不能为空')).toBeVisible();
  });

  test('应该验证邮箱格式', async ({ page }) => {
    await page.click('text=注册');
    
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=邮箱格式不正确')).toBeVisible();
  });

  test('应该验证密码长度', async ({ page }) => {
    await page.click('text=注册');
    
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=密码长度至少为8位')).toBeVisible();
  });

  test('应该验证密码确认', async ({ page }) => {
    await page.click('text=注册');
    
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password456');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=两次密码不一致')).toBeVisible();
  });

  test('应该成功注册新用户', async ({ page }) => {
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    const email = `test${timestamp}@example.com`;
    
    await page.click('text=注册');
    
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator(`text=${username}`)).toBeVisible();
  });

  test('应该处理用户名已存在的情况', async ({ page }) => {
    await page.click('text=注册');
    
    await page.fill('input[name="username"]', 'existinguser');
    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=用户名已存在')).toBeVisible();
  });

  test('应该处理邮箱已存在的情况', async ({ page }) => {
    await page.click('text=注册');
    
    await page.fill('input[name="username"]', 'newuser');
    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=邮箱已被注册')).toBeVisible();
  });

  test('应该能够返回登录页面', async ({ page }) => {
    await page.click('text=注册');
    await page.click('text=返回登录');
    
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1')).toContainText('登录');
  });
});

test.describe('用户登录流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3200');
  });

  test('应该能够访问登录页面', async ({ page }) => {
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1')).toContainText('登录');
  });

  test('应该显示登录表单', async ({ page }) => {
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=注册')).toBeVisible();
  });

  test('应该验证必填字段', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=用户名不能为空')).toBeVisible();
    await expect(page.locator('text=密码不能为空')).toBeVisible();
  });

  test('应该成功登录', async ({ page }) => {
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=testuser')).toBeVisible();
  });

  test('应该处理错误的用户名或密码', async ({ page }) => {
    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=用户名或密码错误')).toBeVisible();
  });

  test('应该能够记住我', async ({ page }) => {
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.check('input[name="remember"]');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard/);
    
    const cookies = await page.context().cookies();
    const rememberCookie = cookies.find(c => c.name === 'remember_token');
    expect(rememberCookie).toBeDefined();
  });

  test('应该能够跳转到注册页面', async ({ page }) => {
    await page.click('text=注册');
    
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('h1')).toContainText('注册');
  });

  test('应该能够忘记密码', async ({ page }) => {
    await page.click('text=忘记密码');
    
    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.locator('h1')).toContainText('重置密码');
  });
});
