/**
 * @fileoverview 简单认证测试
 * @description 用于测试auth模块的基本导入和函数调用
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-06
 * @modified 2025-12-06
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// 直接导入，不使用模块别名
import { generateToken } from './lib/auth';

describe('Auth Simple Test', () => {
  it('should import and call generateToken', () => {
    // 测试导入是否成功
    expect(typeof generateToken).toBe('function');
  });
});