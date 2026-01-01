/**
 * @file 应用 instrumentation 模块
 * @description Next.js 应用启动时执行的初始化代码
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-06
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */
import { initializeApp } from '@/lib/init';
import { logger } from '@/lib/logger';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      initializeApp();
    } catch (error) {
      logger.error('应用初始化失败', error);
      throw error;
    }
  }
}
