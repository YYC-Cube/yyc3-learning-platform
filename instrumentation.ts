/**
 * @file 应用 instrumentation 模块
 * @description Next.js 应用启动时执行的初始化代码
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-06
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// 注意：此文件在 Edge Runtime 中运行，不能导入任何 Node.js 模块
// 因此我们使用动态导入来避免在 Edge Runtime 中加载 Node.js 依赖

export async function register() {
  // 只在 Node.js 运行时（非 Edge Runtime）中初始化应用
  // 使用动态导入避免 Edge Runtime 加载 Node.js 模块
  if (typeof process !== 'undefined' && process.env?.NEXT_RUNTIME === 'nodejs') {
    try {
      const { initializeApp } = await import('@/lib/init');
      initializeApp();
    } catch (error) {
      console.error('应用初始化失败:', error);
      throw error;
    }
  }
}
