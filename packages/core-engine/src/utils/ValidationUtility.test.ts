import { describe, it, expect } from '@jest/globals';
import ValidationUtility, { ValidationResult, ValidationRule, Schema } from './ValidationUtility';

describe('ValidationUtility', () => {
  const validator = ValidationUtility.getInstance();

  describe('validateString', () => {
    it('should validate a valid string', () => {
      const result: ValidationResult = validator.validateString('Hello World');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized).toBe('Hello World');
    });

    it('should enforce required field', () => {
      const result: ValidationResult = validator.validateString('', { required: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field is required');
    });

    it('should enforce minimum length', () => {
      const result: ValidationResult = validator.validateString('Hi', { minLength: 5 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('String must be at least 5 characters long');
    });

    it('should enforce maximum length', () => {
      const result: ValidationResult = validator.validateString('This is a very long string', { maxLength: 10 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('String must not exceed 10 characters');
    });

    it('should enforce pattern', () => {
      const result: ValidationResult = validator.validateString('abc123', { pattern: /^[a-z]+$/ });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('String does not match the required pattern');
    });

    it('should trim whitespace when requested', () => {
      const result: ValidationResult = validator.validateString('  Hello  ', { trim: true });
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('Hello');
    });

    it('should handle null and undefined', () => {
      const result1: ValidationResult = validator.validateString(null);
      expect(result1.isValid).toBe(true);
      expect(result1.sanitized).toBeNull();

      const result2: ValidationResult = validator.validateString(undefined);
      expect(result2.isValid).toBe(true);
      expect(result2.sanitized).toBeNull();
    });
  });

  describe('validateNumber', () => {
    it('should validate a valid number', () => {
      const result: ValidationResult = validator.validateNumber(42);
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe(42);
    });

    it('should convert string numbers', () => {
      const result: ValidationResult = validator.validateNumber('42');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe(42);
    });

    it('should enforce required field', () => {
      const result: ValidationResult = validator.validateNumber(null, { required: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field is required');
    });

    it('should enforce minimum value', () => {
      const result: ValidationResult = validator.validateNumber(5, { min: 10 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value must be at least 10');
    });

    it('should enforce maximum value', () => {
      const result: ValidationResult = validator.validateNumber(15, { max: 10 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value must not exceed 10');
    });

    it('should enforce integer', () => {
      const result: ValidationResult = validator.validateNumber(3.14, { integer: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value must be an integer');
    });

    it('should reject invalid numbers', () => {
      const result: ValidationResult = validator.validateNumber('not a number');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value must be a valid number');
    });
  });

  describe('validateEmail', () => {
    it('should validate a valid email', () => {
      const result: ValidationResult = validator.validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('test@example.com');
    });

    it('should convert to lowercase', () => {
      const result: ValidationResult = validator.validateEmail('TEST@EXAMPLE.COM');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('test@example.com');
    });

    it('should reject invalid email format', () => {
      const result: ValidationResult = validator.validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should enforce required field', () => {
      const result: ValidationResult = validator.validateEmail('', { required: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });
  });

  describe('validateURL', () => {
    it('should validate a valid URL', () => {
      const result: ValidationResult = validator.validateURL('https://example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('https://example.com');
    });

    it('should allow relative URLs when configured', () => {
      const result: ValidationResult = validator.validateURL('/path/to/resource', { allowRelative: true });
      expect(result.isValid).toBe(true);
    });

    it('should reject relative URLs by default', () => {
      const result: ValidationResult = validator.validateURL('/path/to/resource');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid URL format');
    });

    it('should reject invalid URLs', () => {
      const result: ValidationResult = validator.validateURL('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid URL format');
    });
  });

  describe('validatePhone', () => {
    it('should validate a valid phone number', () => {
      const result: ValidationResult = validator.validatePhone('1234567890');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('1234567890');
    });

    it('should clean phone number by removing non-digits', () => {
      const result: ValidationResult = validator.validatePhone('(123) 456-7890');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('1234567890');
    });

    it('should reject too short phone numbers', () => {
      const result: ValidationResult = validator.validatePhone('123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid phone number format');
    });

    it('should reject too long phone numbers', () => {
      const result: ValidationResult = validator.validatePhone('1234567890123456');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid phone number format');
    });
  });

  describe('validateDate', () => {
    it('should validate a valid date', () => {
      const date = new Date('2024-01-01');
      const result: ValidationResult = validator.validateDate(date);
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toEqual(date);
    });

    it('should parse date strings', () => {
      const result: ValidationResult = validator.validateDate('2024-01-01');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBeInstanceOf(Date);
    });

    it('should enforce minimum date', () => {
      const minDate = new Date('2024-01-01');
      const result: ValidationResult = validator.validateDate('2023-12-31', { minDate });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Date must be after');
    });

    it('should enforce maximum date', () => {
      const maxDate = new Date('2024-01-01');
      const result: ValidationResult = validator.validateDate('2024-01-02', { maxDate });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Date must be before');
    });

    it('should reject invalid dates', () => {
      const result: ValidationResult = validator.validateDate('invalid-date');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid date');
    });
  });

  describe('validateArray', () => {
    it('should validate a valid array', () => {
      const result: ValidationResult = validator.validateArray([1, 2, 3]);
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toEqual([1, 2, 3]);
    });

    it('should enforce minimum length', () => {
      const result: ValidationResult = validator.validateArray([1], { minLength: 3 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Array must contain at least 3 items');
    });

    it('should enforce maximum length', () => {
      const result: ValidationResult = validator.validateArray([1, 2, 3, 4, 5], { maxLength: 3 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Array must not exceed 3 items');
    });

    it('should validate array items with custom validator', () => {
      const result: ValidationResult = validator.validateArray([1, 2, 'three'], {
        itemValidator: (item) => validator.validateNumber(item)
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject non-array values', () => {
      const result: ValidationResult = validator.validateArray('not an array');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value must be an array');
    });
  });

  describe('validateObject', () => {
    it('should validate a valid object', () => {
      const schema: Schema = {
        name: { type: 'string', required: true },
        age: { type: 'number', required: true }
      };

      const result: ValidationResult = validator.validateObject({ name: 'John', age: 30 }, schema);
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toEqual({ name: 'John', age: 30 });
    });

    it('should enforce required fields', () => {
      const schema: Schema = {
        name: { type: 'string', required: true },
        age: { type: 'number', required: true }
      };

      const result: ValidationResult = validator.validateObject({ name: 'John' }, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('age is required');
    });

    it('should validate field types', () => {
      const schema: Schema = {
        name: { type: 'string', required: true },
        age: { type: 'number', required: true }
      };

      const result: ValidationResult = validator.validateObject({ name: 'John', age: 'thirty' }, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('age: Value must be a valid number');
    });

    it('should enforce allowed values', () => {
      const schema: Schema = {
        status: { type: 'string', required: true, allowedValues: ['active', 'inactive'] }
      };

      const result: ValidationResult = validator.validateObject({ status: 'pending' }, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('status must be one of: active, inactive');
    });

    it('should use custom validators', () => {
      const schema: Schema = {
        password: { type: 'string', required: true, customValidator: (value) => value.length >= 8 || 'Password too short' }
      };

      const result: ValidationResult = validator.validateObject({ password: 'short' }, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('password: Password too short');
    });
  });

  describe('sanitizeXSS', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const result = validator.sanitizeXSS(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
    });

    it('should remove iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>Hello';
      const result = validator.sanitizeXSS(input);
      expect(result).not.toContain('<iframe>');
    });

    it('should remove javascript: protocol', () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const result = validator.sanitizeXSS(input);
      expect(result).not.toContain('javascript:');
    });

    it('should escape HTML entities', () => {
      const input = '<div>Hello</div>';
      const result = validator.sanitizeXSS(input);
      expect(result).toBe('Hello');
    });
  });

  describe('sanitizeSQLInjection', () => {
    it('should remove SQL keywords', () => {
      const input = "name' OR '1'='1";
      const result = validator.sanitizeSQLInjection(input);
      expect(result).not.toContain('OR');
    });

    it('should remove comment markers', () => {
      const input = "name'--comment";
      const result = validator.sanitizeSQLInjection(input);
      expect(result).not.toContain('--');
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize strings by default', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const result = validator.sanitizeInput(input);
      expect(result).not.toContain('<script>');
    });

    it('should sanitize arrays', () => {
      const input = ['<script>alert(1)</script>', 'normal'];
      const result = validator.sanitizeInput(input);
      expect(result[0]).not.toContain('<script>');
    });

    it('should sanitize objects', () => {
      const input = { name: '<script>alert(1)</script>', age: 30 };
      const result = validator.sanitizeInput(input);
      expect(result.name).not.toContain('<script>');
    });

    it('should trim strings when requested', () => {
      const input = '  Hello  ';
      const result = validator.sanitizeInput(input, { trim: true });
      expect(result).toBe('Hello');
    });
  });

  describe('validateJSON', () => {
    it('should validate valid JSON string', () => {
      const result: ValidationResult = validator.validateJSON('{"name":"John"}');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toEqual({ name: 'John' });
    });

    it('should validate valid JSON object', () => {
      const result: ValidationResult = validator.validateJSON({ name: 'John' });
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toEqual({ name: 'John' });
    });

    it('should reject invalid JSON string', () => {
      const result: ValidationResult = validator.validateJSON('{invalid}');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid JSON format');
    });

    it('should reject non-serializable objects', () => {
      const result: ValidationResult = validator.validateJSON(() => {});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value cannot be serialized to JSON');
    });
  });

  describe('validateUUID', () => {
    it('should validate a valid UUID', () => {
      const result: ValidationResult = validator.validateUUID('550e8400-e29b-41d4-a716-446655440000');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should convert to lowercase', () => {
      const result: ValidationResult = validator.validateUUID('550E8400-E29B-41D4-A716-446655440000');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should reject invalid UUID format', () => {
      const result: ValidationResult = validator.validateUUID('not-a-uuid');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid UUID format');
    });
  });

  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const result: ValidationResult = validator.validatePassword('StrongP@ssw0rd', {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      });
      expect(result.isValid).toBe(true);
    });

    it('should enforce minimum length', () => {
      const result: ValidationResult = validator.validatePassword('Short', { minLength: 8 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should enforce uppercase requirement', () => {
      const result: ValidationResult = validator.validatePassword('lowercase', { requireUppercase: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should enforce lowercase requirement', () => {
      const result: ValidationResult = validator.validatePassword('UPPERCASE', { requireLowercase: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should enforce number requirement', () => {
      const result: ValidationResult = validator.validatePassword('NoNumbers', { requireNumbers: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should enforce special character requirement', () => {
      const result: ValidationResult = validator.validatePassword('NoSpecialChars1', { requireSpecialChars: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });
});
