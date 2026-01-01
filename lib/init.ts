/**
 * @file 应用初始化模块
 * @description 在应用启动时执行初始化任务，包括环境变量验证
 * @module init
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-06
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */
import { validateEnvConfig, getEnvInfo } from './env';
import { logError } from './error-handler';

let isInitialized = false;

/**
 * 初始化应用配置
 */
export function initializeApp(): void {
  if (isInitialized) {
    return;
  }

  try {
    validateEnvConfig();
    isInitialized = true;

    if (process.env.NODE_ENV === 'development') {
      const envInfo = getEnvInfo();
      logger.debug('应用环境配置', envInfo);
    }
  } catch (error) {
    logError(error, { context: '应用初始化' });
    throw error;
  }
}

/**
 * 检查应用是否已初始化
 */
export function isAppInitialized(): boolean {
  return isInitialized;
}

/**
 * 获取应用初始化状态
 */
export function getInitializationStatus(): {
  initialized: boolean;
  envInfo?: Record<string, any>;
  error?: string;
} {
  if (isInitialized) {
    return {
      initialized: true,
      envInfo: getEnvInfo(),
    };
  }

  return {
    initialized: false,
    error: '应用尚未初始化',
  };
}
