/**
 * @fileoverview 验证器模块测试
 * @description 测试所有Zod验证schemas
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  profileUpdateSchema,
  courseFilterSchema,
  examSubmitSchema,
} from '@/lib/validators';

describe('loginSchema', () => {
  it('应该验证有效的登录数据', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该拒绝无效的邮箱格式', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('无效的邮箱地址');
    }
  });

  it('应该拒绝少于8位的密码', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'pass123',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('密码至少8位');
    }
  });

  it('应该拒绝缺少字段的数据', () => {
    const invalidData = {
      email: 'test@example.com',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('应该验证有效的注册数据', () => {
    const validData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该拒绝少于3位的用户名', () => {
    const invalidData = {
      email: 'test@example.com',
      username: 'ab',
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('用户名至少3位');
    }
  });

  it('应该拒绝超过20位的用户名', () => {
    const invalidData = {
      email: 'test@example.com',
      username: 'a'.repeat(21),
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('用户名最多20位');
    }
  });

  it('应该拒绝包含非法字符的用户名', () => {
    const invalidData = {
      email: 'test@example.com',
      username: 'test-user',
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('用户名只能包含字母、数字和下划线');
    }
  });

  it('应该拒绝不包含大小写字母和数字的密码', () => {
    const invalidData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password',
      confirmPassword: 'password',
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('密码必须包含大小写字母和数字');
    }
  });

  it('应该拒绝不匹配的确认密码', () => {
    const invalidData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123',
      confirmPassword: 'Password456',
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('两次密码不一致');
    }
  });

  it('应该拒绝少于8位的密码', () => {
    const invalidData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Pass1',
      confirmPassword: 'Pass1',
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const hasPasswordError = result.error.errors.some(e => e.message.includes('密码至少8位'));
      expect(hasPasswordError).toBe(true);
    }
  });
});

describe('profileUpdateSchema', () => {
  it('应该接受空对象（所有字段可选）', () => {
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('应该验证有效的显示名称', () => {
    const validData = {
      displayName: '测试用户',
    };

    const result = profileUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该拒绝少于2位的显示名称', () => {
    const invalidData = {
      displayName: '测',
    };

    const result = profileUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('显示名称至少2位');
    }
  });

  it('应该拒绝超过500字的简介', () => {
    const invalidData = {
      bio: 'a'.repeat(501),
    };

    const result = profileUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('简介最多500字');
    }
  });

  it('应该验证有效的手机号', () => {
    const validData = {
      phone: '+8613800138000',
    };

    const result = profileUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该拒绝无效的手机号', () => {
    const invalidData = {
      phone: '0', // 以0开头
    };

    const result = profileUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('无效的手机号');
    }
  });

  it('应该拒绝以0开头的手机号', () => {
    const invalidData = {
      phone: '0123456789',
    };

    const result = profileUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('无效的手机号');
    }
  });

  it('应该拒绝过长的手机号', () => {
    const invalidData = {
      phone: '+1234567890123456', // 16位数字，超过15位限制
    };

    const result = profileUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('无效的手机号');
    }
  });

  it('应该验证有效的网址', () => {
    const validData = {
      website: 'https://example.com',
    };

    const result = profileUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该拒绝无效的网址', () => {
    const invalidData = {
      website: 'not-a-url',
    };

    const result = profileUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('无效的网址');
    }
  });

  it('应该接受所有可选字段', () => {
    const validData = {
      displayName: '测试用户',
      bio: '这是我的简介',
      phone: '+8613800138000',
      website: 'https://example.com',
    };

    const result = profileUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('courseFilterSchema', () => {
  it('应该接受空对象（所有字段可选）', () => {
    const result = courseFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('应该验证有效的分类', () => {
    const validData = {
      category: 'programming',
    };

    const result = courseFilterSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该验证有效的难度级别', () => {
    const validData = {
      level: 'beginner' as const,
    };

    const result = courseFilterSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该拒绝无效的难度级别', () => {
    const invalidData = {
      level: 'invalid',
    };

    const result = courseFilterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('应该验证有效的搜索关键词', () => {
    const validData = {
      search: 'React',
    };

    const result = courseFilterSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该验证有效的分页参数', () => {
    const validData = {
      page: 1,
      pageSize: 20,
    };

    const result = courseFilterSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该拒绝非正数的页码', () => {
    const invalidData = {
      page: 0,
    };

    const result = courseFilterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('应该拒绝超过100的pageSize', () => {
    const invalidData = {
      pageSize: 101,
    };

    const result = courseFilterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('应该接受所有字段', () => {
    const validData = {
      category: 'programming',
      level: 'intermediate' as const,
      search: 'React',
      page: 2,
      pageSize: 30,
    };

    const result = courseFilterSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('examSubmitSchema', () => {
  it('应该验证有效的考试提交数据', () => {
    const validData = {
      examId: 'exam-123',
      answers: {
        q1: 'option-a',
        q2: ['option-a', 'option-b'],
        q3: 'text answer',
      },
    };

    const result = examSubmitSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该拒绝缺少examId', () => {
    const invalidData = {
      answers: {
        q1: 'option-a',
      },
    };

    const result = examSubmitSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('应该拒绝缺少answers', () => {
    const invalidData = {
      examId: 'exam-123',
    };

    const result = examSubmitSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('应该接受字符串答案', () => {
    const validData = {
      examId: 'exam-123',
      answers: {
        q1: 'single answer',
      },
    };

    const result = examSubmitSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该接受数组答案', () => {
    const validData = {
      examId: 'exam-123',
      answers: {
        q1: ['answer1', 'answer2', 'answer3'],
      },
    };

    const result = examSubmitSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该接受混合类型的答案', () => {
    const validData = {
      examId: 'exam-123',
      answers: {
        q1: 'single choice',
        q2: ['multiple', 'choice'],
        q3: 'another single',
        q4: ['another', 'multiple'],
      },
    };

    const result = examSubmitSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该接受空答案对象', () => {
    const validData = {
      examId: 'exam-123',
      answers: {},
    };

    const result = examSubmitSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
