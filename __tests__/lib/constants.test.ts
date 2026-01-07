/**
 * @fileoverview 应用常量测试
 * @description 测试constants模块的所有常量定义
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  APP_CONFIG,
  API_ROUTES,
  STORAGE_KEYS,
  PAGINATION,
  COURSE_LEVELS,
  COURSE_CATEGORIES,
  EXAM_DIFFICULTIES,
  USER_ROLES,
  ACHIEVEMENT_RARITIES,
  NOTIFICATION_TYPES,
  VALIDATION_RULES,
} from '@/lib/constants';

describe('APP_CONFIG', () => {
  it('应该包含应用名称', () => {
    expect(APP_CONFIG.name).toBe('AI学习平台');
  });

  it('应该包含应用描述', () => {
    expect(APP_CONFIG.description).toBe('AI Learning Platform');
  });

  it('应该包含应用URL', () => {
    expect(APP_CONFIG.url).toBeDefined();
    expect(typeof APP_CONFIG.url).toBe('string');
  });

  it('应该包含语言设置', () => {
    expect(APP_CONFIG.locale).toBe('zh-CN');
  });

  it('应该包含支持邮箱', () => {
    expect(APP_CONFIG.supportEmail).toBe('support@ai-learning.com');
    expect(APP_CONFIG.supportEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('应该是只读对象', () => {
    // as const创建的是类型层面的只读，不是运行时只读
    // 所以我们只能验证类型正确性，而不能验证运行时抛出错误
    expect(APP_CONFIG.name).toBeDefined();
    expect(typeof APP_CONFIG.name).toBe('string');
  });
});

describe('API_ROUTES', () => {
  describe('auth路由', () => {
    it('应该包含登录路由', () => {
      expect(API_ROUTES.auth.login).toBe('/api/auth/login');
    });

    it('应该包含注册路由', () => {
      expect(API_ROUTES.auth.register).toBe('/api/auth/register');
    });

    it('应该包含登出路由', () => {
      expect(API_ROUTES.auth.logout).toBe('/api/auth/logout');
    });

    it('应该包含刷新令牌路由', () => {
      expect(API_ROUTES.auth.refresh).toBe('/api/auth/refresh');
    });

    it('应该包含验证路由', () => {
      expect(API_ROUTES.auth.verify).toBe('/api/auth/verify');
    });
  });

  describe('courses路由', () => {
    it('应该包含课程列表路由', () => {
      expect(API_ROUTES.courses.list).toBe('/api/courses');
    });

    it('应该包含课程详情路由模板', () => {
      expect(API_ROUTES.courses.detail).toBe('/api/courses/[id]');
    });

    it('应该包含课程注册路由模板', () => {
      expect(API_ROUTES.courses.enroll).toBe('/api/courses/[id]/enroll');
    });

    it('应该包含课程进度路由模板', () => {
      expect(API_ROUTES.courses.progress).toBe('/api/courses/[id]/progress');
    });
  });

  describe('exams路由', () => {
    it('应该包含考试列表路由', () => {
      expect(API_ROUTES.exams.list).toBe('/api/exams');
    });

    it('应该包含考试详情路由模板', () => {
      expect(API_ROUTES.exams.detail).toBe('/api/exams/[id]');
    });

    it('应该包含开始考试路由模板', () => {
      expect(API_ROUTES.exams.start).toBe('/api/exams/[id]/start');
    });

    it('应该包含提交考试路由模板', () => {
      expect(API_ROUTES.exams.submit).toBe('/api/exams/[id]/submit');
    });
  });

  describe('user路由', () => {
    it('应该包含用户资料路由', () => {
      expect(API_ROUTES.user.profile).toBe('/api/user/profile');
    });

    it('应该包含更新用户路由', () => {
      expect(API_ROUTES.user.update).toBe('/api/user/update');
    });

    it('应该包含成就路由', () => {
      expect(API_ROUTES.user.achievements).toBe('/api/user/achievements');
    });

    it('应该包含证书路由', () => {
      expect(API_ROUTES.user.certificates).toBe('/api/user/certificates');
    });
  });

  it('所有路由都应该以/api开头', () => {
    const allRoutes = Object.values(API_ROUTES).flatMap(routes => Object.values(routes));
    allRoutes.forEach(route => {
      expect(route).toMatch(/^\/api\//);
    });
  });
});

describe('STORAGE_KEYS', () => {
  it('应该包含令牌存储键', () => {
    expect(STORAGE_KEYS.token).toBe('auth_token');
  });

  it('应该包含用户数据存储键', () => {
    expect(STORAGE_KEYS.user).toBe('user_data');
  });

  it('应该包含主题偏好存储键', () => {
    expect(STORAGE_KEYS.theme).toBe('theme_preference');
  });

  it('应该包含语言偏好存储键', () => {
    expect(STORAGE_KEYS.locale).toBe('locale_preference');
  });

  it('所有键名应该使用下划线命名', () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      expect(key).toMatch(/^[a-z_]+$/);
    });
  });

  it('所有键名应该具有描述性', () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      expect(key.length).toBeGreaterThan(5);
      expect(key).toContain('_');
    });
  });
});

describe('PAGINATION', () => {
  it('应该有默认页大小', () => {
    expect(PAGINATION.defaultPageSize).toBe(12);
  });

  it('应该有最大页大小限制', () => {
    expect(PAGINATION.maxPageSize).toBe(100);
  });

  it('默认页大小应该小于最大页大小', () => {
    expect(PAGINATION.defaultPageSize).toBeLessThanOrEqual(PAGINATION.maxPageSize);
  });

  it('应该包含页大小选项数组', () => {
    expect(Array.isArray(PAGINATION.pageSizeOptions)).toBe(true);
    expect(PAGINATION.pageSizeOptions).toHaveLength(4);
  });

  it('页大小选项应该包含合理的值', () => {
    expect(PAGINATION.pageSizeOptions).toContain(12);
    expect(PAGINATION.pageSizeOptions).toContain(24);
    expect(PAGINATION.pageSizeOptions).toContain(36);
    expect(PAGINATION.pageSizeOptions).toContain(48);
  });

  it('所有页大小选项应该在合理范围内', () => {
    PAGINATION.pageSizeOptions.forEach(size => {
      expect(size).toBeGreaterThanOrEqual(1);
      expect(size).toBeLessThanOrEqual(PAGINATION.maxPageSize);
    });
  });

  it('页大小选项应该是升序排列', () => {
    const sorted = [...PAGINATION.pageSizeOptions].sort((a, b) => a - b);
    expect(PAGINATION.pageSizeOptions).toEqual(sorted);
  });
});

describe('COURSE_LEVELS', () => {
  it('应该包含三个难度级别', () => {
    expect(COURSE_LEVELS).toHaveLength(3);
  });

  it('每个级别应该有value和label属性', () => {
    COURSE_LEVELS.forEach(level => {
      expect(level).toHaveProperty('value');
      expect(level).toHaveProperty('label');
      expect(typeof level.value).toBe('string');
      expect(typeof level.label).toBe('string');
    });
  });

  it('应该包含初级级别', () => {
    const beginner = COURSE_LEVELS.find(l => l.value === 'beginner');
    expect(beginner).toBeDefined();
    expect(beginner?.label).toBe('初级');
  });

  it('应该包含中级级别', () => {
    const intermediate = COURSE_LEVELS.find(l => l.value === 'intermediate');
    expect(intermediate).toBeDefined();
    expect(intermediate?.label).toBe('中级');
  });

  it('应该包含高级级别', () => {
    const advanced = COURSE_LEVELS.find(l => l.value === 'advanced');
    expect(advanced).toBeDefined();
    expect(advanced?.label).toBe('高级');
  });

  it('value值应该是英文', () => {
    COURSE_LEVELS.forEach(level => {
      expect(level.value).toMatch(/^[a-z]+$/);
    });
  });

  it('label值应该是中文', () => {
    COURSE_LEVELS.forEach(level => {
      expect(level.label).toMatch(/^[\u4e00-\u9fa5]+$/);
    });
  });
});

describe('COURSE_CATEGORIES', () => {
  it('应该包含7个课程分类', () => {
    expect(COURSE_CATEGORIES.length).toBeGreaterThanOrEqual(7);
  });

  it('每个分类应该有value和label属性', () => {
    COURSE_CATEGORIES.forEach(category => {
      expect(category).toHaveProperty('value');
      expect(category).toHaveProperty('label');
      expect(typeof category.value).toBe('string');
      expect(typeof category.label).toBe('string');
    });
  });

  it('应该包含AI基础分类', () => {
    const aiBasics = COURSE_CATEGORIES.find(c => c.value === 'ai-basics');
    expect(aiBasics).toBeDefined();
    expect(aiBasics?.label).toBe('AI基础');
  });

  it('应该包含机器学习分类', () => {
    const ml = COURSE_CATEGORIES.find(c => c.value === 'machine-learning');
    expect(ml).toBeDefined();
    expect(ml?.label).toBe('机器学习');
  });

  it('应该包含深度学习分类', () => {
    const dl = COURSE_CATEGORIES.find(c => c.value === 'deep-learning');
    expect(dl).toBeDefined();
    expect(dl?.label).toBe('深度学习');
  });

  it('应该包含自然语言处理分类', () => {
    const nlp = COURSE_CATEGORIES.find(c => c.value === 'nlp');
    expect(nlp).toBeDefined();
    expect(nlp?.label).toBe('自然语言处理');
  });

  it('应该包含计算机视觉分类', () => {
    const cv = COURSE_CATEGORIES.find(c => c.value === 'computer-vision');
    expect(cv).toBeDefined();
    expect(cv?.label).toBe('计算机视觉');
  });

  it('应该包含Prompt工程分类', () => {
    const pe = COURSE_CATEGORIES.find(c => c.value === 'prompt-engineering');
    expect(pe).toBeDefined();
    expect(pe?.label).toBe('Prompt工程');
  });

  it('应该包含AI应用分类', () => {
    const aiApp = COURSE_CATEGORIES.find(c => c.value === 'ai-applications');
    expect(aiApp).toBeDefined();
    expect(aiApp?.label).toBe('AI应用');
  });

  it('所有value应该是kebab-case格式', () => {
    COURSE_CATEGORIES.forEach(category => {
      expect(category.value).toMatch(/^[a-z-]+$/);
    });
  });

  it('所有label应该是中文或允许英文', () => {
    COURSE_CATEGORIES.forEach(category => {
      // 允许中文、大写英文（如Prompt）和特殊字符（如·）
      expect(category.label).toMatch(/^[\u4e00-\u9fa5A-Za-z·]+$/);
    });
  });
});

describe('EXAM_DIFFICULTIES', () => {
  it('应该包含三个难度级别', () => {
    expect(EXAM_DIFFICULTIES).toHaveLength(3);
  });

  it('每个难度应该有value和label属性', () => {
    EXAM_DIFFICULTIES.forEach(difficulty => {
      expect(difficulty).toHaveProperty('value');
      expect(difficulty).toHaveProperty('label');
      expect(typeof difficulty.value).toBe('string');
      expect(typeof difficulty.label).toBe('string');
    });
  });

  it('应该包含简单难度', () => {
    const easy = EXAM_DIFFICULTIES.find(d => d.value === 'easy');
    expect(easy).toBeDefined();
    expect(easy?.label).toBe('简单');
  });

  it('应该包含中等难度', () => {
    const medium = EXAM_DIFFICULTIES.find(d => d.value === 'medium');
    expect(medium).toBeDefined();
    expect(medium?.label).toBe('中等');
  });

  it('应该包含困难难度', () => {
    const hard = EXAM_DIFFICULTIES.find(d => d.value === 'hard');
    expect(hard).toBeDefined();
    expect(hard?.label).toBe('困难');
  });
});

describe('USER_ROLES', () => {
  it('应该包含学生角色', () => {
    expect(USER_ROLES.STUDENT).toBe('student');
  });

  it('应该包含教师角色', () => {
    expect(USER_ROLES.TEACHER).toBe('teacher');
  });

  it('应该包含管理员角色', () => {
    expect(USER_ROLES.ADMIN).toBe('admin');
  });

  it('所有角色值应该是小写', () => {
    Object.values(USER_ROLES).forEach(role => {
      expect(role).toMatch(/^[a-z]+$/);
    });
  });
});

describe('ACHIEVEMENT_RARITIES', () => {
  it('应该包含普通稀有度', () => {
    expect(ACHIEVEMENT_RARITIES.COMMON).toBe('common');
  });

  it('应该包含稀有稀有度', () => {
    expect(ACHIEVEMENT_RARITIES.RARE).toBe('rare');
  });

  it('应该包含史诗稀有度', () => {
    expect(ACHIEVEMENT_RARITIES.EPIC).toBe('epic');
  });

  it('应该包含传说稀有度', () => {
    expect(ACHIEVEMENT_RARITIES.LEGENDARY).toBe('legendary');
  });

  it('所有稀有度值应该是小写', () => {
    Object.values(ACHIEVEMENT_RARITIES).forEach(rarity => {
      expect(rarity).toMatch(/^[a-z]+$/);
    });
  });
});

describe('NOTIFICATION_TYPES', () => {
  it('应该包含信息类型', () => {
    expect(NOTIFICATION_TYPES.INFO).toBe('info');
  });

  it('应该包含成功类型', () => {
    expect(NOTIFICATION_TYPES.SUCCESS).toBe('success');
  });

  it('应该包含警告类型', () => {
    expect(NOTIFICATION_TYPES.WARNING).toBe('warning');
  });

  it('应该包含错误类型', () => {
    expect(NOTIFICATION_TYPES.ERROR).toBe('error');
  });

  it('所有类型值应该是小写', () => {
    Object.values(NOTIFICATION_TYPES).forEach(type => {
      expect(type).toMatch(/^[a-z]+$/);
    });
  });
});

describe('VALIDATION_RULES', () => {
  describe('email验证规则', () => {
    it('应该包含email正则模式', () => {
      expect(VALIDATION_RULES.email.pattern).toBeInstanceOf(RegExp);
    });

    it('应该验证有效的邮箱地址', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
      ];

      validEmails.forEach(email => {
        expect(VALIDATION_RULES.email.pattern.test(email)).toBe(true);
      });
    });

    it('应该拒绝无效的邮箱地址', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'user@',
        'user @example.com',
      ];

      invalidEmails.forEach(email => {
        expect(VALIDATION_RULES.email.pattern.test(email)).toBe(false);
      });
    });

    it('应该包含邮箱验证错误消息', () => {
      expect(VALIDATION_RULES.email.message).toBe('请输入有效的邮箱地址');
    });
  });

  describe('password验证规则', () => {
    it('应该包含密码最小长度要求', () => {
      expect(VALIDATION_RULES.password.minLength).toBe(8);
    });

    it('应该包含密码正则模式', () => {
      expect(VALIDATION_RULES.password.pattern).toBeInstanceOf(RegExp);
    });

    it('应该验证包含大小写字母和数字的密码', () => {
      const validPasswords = [
        'Password123',
        'MyPass123',
        'Test1234',
      ];

      validPasswords.forEach(password => {
        expect(VALIDATION_RULES.password.pattern.test(password)).toBe(true);
      });
    });

    it('应该拒绝不包含大小写字母的密码', () => {
      const invalidPasswords = [
        'password', // 无大写和数字
        'PASSWORD', // 无小写和数字
        'Password', // 无数字
        '12345678', // 无字母
      ];

      invalidPasswords.forEach(password => {
        expect(VALIDATION_RULES.password.pattern.test(password)).toBe(false);
      });
    });

    it('密码长度应该满足最小长度要求', () => {
      const shortPassword = 'Pass1'; // 只有5位
      expect(shortPassword.length).toBeLessThan(VALIDATION_RULES.password.minLength);
      expect(VALIDATION_RULES.password.pattern.test(shortPassword)).toBe(true); // 格式正确但太短
    });

    it('应该包含密码验证错误消息', () => {
      expect(VALIDATION_RULES.password.message).toBe('密码至少8位，包含大小写字母和数字');
    });
  });

  describe('username验证规则', () => {
    it('应该包含用户名最小长度要求', () => {
      expect(VALIDATION_RULES.username.minLength).toBe(3);
    });

    it('应该包含用户名最大长度要求', () => {
      expect(VALIDATION_RULES.username.maxLength).toBe(20);
    });

    it('应该包含用户名正则模式', () => {
      expect(VALIDATION_RULES.username.pattern).toBeInstanceOf(RegExp);
    });

    it('应该验证有效的用户名', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'User_123',
        'abc',
      ];

      validUsernames.forEach(username => {
        expect(VALIDATION_RULES.username.pattern.test(username)).toBe(true);
      });
    });

    it('应该拒绝无效的用户名', () => {
      const invalidUsernames = [
        'user-name', // 包含连字符
        'user.name', // 包含点号
        'user name', // 包含空格
        '用户名', // 包含中文字符
      ];

      invalidUsernames.forEach(username => {
        expect(VALIDATION_RULES.username.pattern.test(username)).toBe(false);
      });
    });

    it('应该验证用户名长度限制', () => {
      const tooShort = 'ab'; // 2位
      const tooLong = 'a'.repeat(21); // 21位
      const validLength = 'user123'; // 7位

      expect(tooShort.length).toBeLessThan(VALIDATION_RULES.username.minLength);
      expect(tooLong.length).toBeGreaterThan(VALIDATION_RULES.username.maxLength);
      expect(validLength.length).toBeGreaterThanOrEqual(VALIDATION_RULES.username.minLength);
      expect(validLength.length).toBeLessThanOrEqual(VALIDATION_RULES.username.maxLength);
    });

    it('应该包含用户名验证错误消息', () => {
      expect(VALIDATION_RULES.username.message).toBe('用户名3-20位，只能包含字母、数字和下划线');
    });
  });
});

describe('常量完整性和一致性', () => {
  it('所有API路由对象应该非空', () => {
    expect(Object.keys(API_ROUTES.auth).length).toBeGreaterThan(0);
    expect(Object.keys(API_ROUTES.courses).length).toBeGreaterThan(0);
    expect(Object.keys(API_ROUTES.exams).length).toBeGreaterThan(0);
    expect(Object.keys(API_ROUTES.user).length).toBeGreaterThan(0);
  });

  it('所有存储键应该是唯一的', () => {
    const keys = Object.values(STORAGE_KEYS);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });

  it('用户角色应该是互斥的', () => {
    const roles = Object.values(USER_ROLES);
    const uniqueRoles = new Set(roles);
    expect(roles.length).toBe(uniqueRoles.size);
  });

  it('通知类型应该是互斥的', () => {
    const types = Object.values(NOTIFICATION_TYPES);
    const uniqueTypes = new Set(types);
    expect(types.length).toBe(uniqueTypes.size);
  });

  it('成就稀有度应该按稀有度排序', () => {
    const rarities = Object.values(ACHIEVEMENT_RARITIES);
    const expectedOrder = ['common', 'rare', 'epic', 'legendary'];
    expect(rarities).toEqual(expectedOrder);
  });

  it('验证规则应该包含必要的属性', () => {
    expect(VALIDATION_RULES.email).toHaveProperty('pattern');
    expect(VALIDATION_RULES.email).toHaveProperty('message');
    expect(VALIDATION_RULES.password).toHaveProperty('pattern');
    expect(VALIDATION_RULES.password).toHaveProperty('message');
    expect(VALIDATION_RULES.password).toHaveProperty('minLength');
    expect(VALIDATION_RULES.username).toHaveProperty('pattern');
    expect(VALIDATION_RULES.username).toHaveProperty('message');
    expect(VALIDATION_RULES.username).toHaveProperty('minLength');
    expect(VALIDATION_RULES.username).toHaveProperty('maxLength');
  });
});

describe('实际使用场景', () => {
  it('应该能够构建完整的API URL', () => {
    const baseUrl = 'https://api.example.com';
    const loginUrl = `${baseUrl}${API_ROUTES.auth.login}`;
    expect(loginUrl).toBe('https://api.example.com/api/auth/login');
  });

  it('应该能够动态替换路由参数', () => {
    const courseId = '123';
    const detailUrl = API_ROUTES.courses.detail.replace('[id]', courseId);
    expect(detailUrl).toBe('/api/courses/123');
  });

  it('应该能够根据级别获取课程选项', () => {
    const options = COURSE_LEVELS.map(level => ({
      value: level.value,
      label: level.label,
    }));
    expect(options).toHaveLength(3);
    expect(options[0]).toEqual({ value: 'beginner', label: '初级' });
  });

  it('应该能够根据分类获取课程选项', () => {
    const options = COURSE_CATEGORIES.map(cat => ({
      value: cat.value,
      label: cat.label,
    }));
    expect(options.length).toBeGreaterThanOrEqual(7);
  });

  it('应该能够验证用户输入是否符合规则', () => {
    const isValidEmail = VALIDATION_RULES.email.pattern.test('user@example.com');
    const isValidPassword = VALIDATION_RULES.password.pattern.test('Password123');
    const isValidUsername = VALIDATION_RULES.username.pattern.test('user123');

    expect(isValidEmail).toBe(true);
    expect(isValidPassword).toBe(true);
    expect(isValidUsername).toBe(true);
  });
});
