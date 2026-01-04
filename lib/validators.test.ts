/**
 * @fileoverview Tests for validation schemas
 * @description Tests for Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  profileUpdateSchema,
  courseFilterSchema,
  examSubmitSchema,
} from './validators';

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('邮箱');
    }
  });

  it('should reject short password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '1234567',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validData = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'Password123',
    confirmPassword: 'Password123',
  };

  it('should validate correct registration data', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid username (too short)', () => {
    const result = registerSchema.safeParse({
      ...validData,
      username: 'ab',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid username (special characters)', () => {
    const result = registerSchema.safeParse({
      ...validData,
      username: 'user@name',
    });
    expect(result.success).toBe(false);
  });

  it('should reject weak password (missing uppercase)', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject weak password (missing number)', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Password',
      confirmPassword: 'Password',
    });
    expect(result.success).toBe(false);
  });

  it('should reject mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: 'Different123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('不一致');
    }
  });
});

describe('profileUpdateSchema', () => {
  it('should validate partial updates', () => {
    const result = profileUpdateSchema.safeParse({
      displayName: 'John Doe',
    });
    expect(result.success).toBe(true);
  });

  it('should reject short display name', () => {
    const result = profileUpdateSchema.safeParse({
      displayName: 'J',
    });
    expect(result.success).toBe(false);
  });

  it('should reject long bio', () => {
    const result = profileUpdateSchema.safeParse({
      bio: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid phone number', () => {
    const result = profileUpdateSchema.safeParse({
      phone: 'abc',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid website URL', () => {
    const result = profileUpdateSchema.safeParse({
      website: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('courseFilterSchema', () => {
  it('should validate empty filter', () => {
    const result = courseFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should validate valid filter', () => {
    const result = courseFilterSchema.safeParse({
      category: 'programming',
      level: 'beginner',
      search: 'React',
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid level', () => {
    const result = courseFilterSchema.safeParse({
      level: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative page number', () => {
    const result = courseFilterSchema.safeParse({
      page: -1,
    });
    expect(result.success).toBe(false);
  });

  it('should reject pageSize > 100', () => {
    const result = courseFilterSchema.safeParse({
      pageSize: 101,
    });
    expect(result.success).toBe(false);
  });
});

describe('examSubmitSchema', () => {
  it('should validate valid submission', () => {
    const result = examSubmitSchema.safeParse({
      examId: 'exam-123',
      answers: {
        q1: 'a',
        q2: ['b', 'c'],
        q3: 'd',
      },
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing examId', () => {
    const result = examSubmitSchema.safeParse({
      answers: {},
    });
    expect(result.success).toBe(false);
  });
});
