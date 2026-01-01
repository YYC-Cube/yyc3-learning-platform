import crypto from 'crypto';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: any;
}

export interface ValidationRule {
  type: 'string' | 'number' | 'email' | 'url' | 'phone' | 'date' | 'array' | 'object' | 'boolean';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  allowedValues?: any[];
  customValidator?: (value: any) => boolean | string;
}

export interface Schema {
  [key: string]: ValidationRule;
}

export class ValidationUtility {
  private static instance: ValidationUtility;
  private xssPatterns: RegExp[] = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<[^>]*>/g,
  ];

  private sqlInjectionPatterns: RegExp[] = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE|TRUNCATE)\b)/gi,
    /(['"]\s*(OR|AND)\s*['"])/gi,
    /(\-\-|\#|\/\*|\*\/)/gi,
  ];

  private constructor() {}

  static getInstance(): ValidationUtility {
    if (!ValidationUtility.instance) {
      ValidationUtility.instance = new ValidationUtility();
    }
    return ValidationUtility.instance;
  }

  validateString(value: any, options: { required?: boolean; minLength?: number; maxLength?: number; pattern?: RegExp; trim?: boolean } = {}): ValidationResult {
    const errors: string[] = [];
    let sanitized = value;

    if (options.required && (value === null || value === undefined || value === '')) {
      errors.push('Field is required');
      return { isValid: false, errors };
    }

    if (value === null || value === undefined) {
      return { isValid: true, errors: [], sanitized: null };
    }

    if (typeof value !== 'string') {
      errors.push('Value must be a string');
      return { isValid: false, errors };
    }

    if (options.trim) {
      sanitized = value.trim();
    }

    if (options.minLength && sanitized.length < options.minLength) {
      errors.push(`String must be at least ${options.minLength} characters long`);
    }

    if (options.maxLength && sanitized.length > options.maxLength) {
      errors.push(`String must not exceed ${options.maxLength} characters`);
    }

    if (options.pattern && !options.pattern.test(sanitized)) {
      errors.push('String does not match the required pattern');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  validateNumber(value: any, options: { required?: boolean; min?: number; max?: number; integer?: boolean } = {}): ValidationResult {
    const errors: string[] = [];

    if (options.required && (value === null || value === undefined)) {
      errors.push('Field is required');
      return { isValid: false, errors };
    }

    if (value === null || value === undefined) {
      return { isValid: true, errors: [], sanitized: null };
    }

    const num = Number(value);

    if (isNaN(num)) {
      errors.push('Value must be a valid number');
      return { isValid: false, errors };
    }

    if (options.integer && !Number.isInteger(num)) {
      errors.push('Value must be an integer');
    }

    if (options.min !== undefined && num < options.min) {
      errors.push(`Value must be at least ${options.min}`);
    }

    if (options.max !== undefined && num > options.max) {
      errors.push(`Value must not exceed ${options.max}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: num
    };
  }

  validateEmail(value: any, options: { required?: boolean } = {}): ValidationResult {
    const errors: string[] = [];

    if (options.required && (value === null || value === undefined || value === '')) {
      errors.push('Email is required');
      return { isValid: false, errors };
    }

    if (value === null || value === undefined || value === '') {
      return { isValid: true, errors: [], sanitized: null };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      errors.push('Invalid email format');
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors: [],
      sanitized: value.toLowerCase().trim()
    };
  }

  validateURL(value: any, options: { required?: boolean; allowRelative?: boolean } = {}): ValidationResult {
    const errors: string[] = [];

    if (options.required && (value === null || value === undefined || value === '')) {
      errors.push('URL is required');
      return { isValid: false, errors };
    }

    if (value === null || value === undefined || value === '') {
      return { isValid: true, errors: [], sanitized: null };
    }

    let urlPattern: RegExp;
    if (options.allowRelative) {
      urlPattern = /^(https?:\/\/|\/)/i;
    } else {
      urlPattern = /^https?:\/\/.+/i;
    }

    if (!urlPattern.test(value)) {
      errors.push('Invalid URL format');
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors: [],
      sanitized: value.trim()
    };
  }

  validatePhone(value: any, options: { required?: boolean; countryCode?: string } = {}): ValidationResult {
    const errors: string[] = [];

    if (options.required && (value === null || value === undefined || value === '')) {
      errors.push('Phone number is required');
      return { isValid: false, errors };
    }

    if (value === null || value === undefined || value === '') {
      return { isValid: true, errors: [], sanitized: null };
    }

    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length < 10 || cleaned.length > 15) {
      errors.push('Invalid phone number format');
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors: [],
      sanitized: cleaned
    };
  }

  validateDate(value: any, options: { required?: boolean; minDate?: Date; maxDate?: Date } = {}): ValidationResult {
    const errors: string[] = [];

    if (options.required && (value === null || value === undefined)) {
      errors.push('Date is required');
      return { isValid: false, errors };
    }

    if (value === null || value === undefined) {
      return { isValid: true, errors: [], sanitized: null };
    }

    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else {
      errors.push('Invalid date format');
      return { isValid: false, errors };
    }

    if (isNaN(date.getTime())) {
      errors.push('Invalid date');
      return { isValid: false, errors };
    }

    if (options.minDate && date < options.minDate) {
      errors.push(`Date must be after ${options.minDate.toISOString()}`);
    }

    if (options.maxDate && date > options.maxDate) {
      errors.push(`Date must be before ${options.maxDate.toISOString()}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: date
    };
  }

  validateArray(value: any, options: { required?: boolean; minLength?: number; maxLength?: number; itemValidator?: (item: any) => ValidationResult } = {}): ValidationResult {
    const errors: string[] = [];

    if (options.required && (value === null || value === undefined)) {
      errors.push('Array is required');
      return { isValid: false, errors };
    }

    if (value === null || value === undefined) {
      return { isValid: true, errors: [], sanitized: null };
    }

    if (!Array.isArray(value)) {
      errors.push('Value must be an array');
      return { isValid: false, errors };
    }

    if (options.minLength && value.length < options.minLength) {
      errors.push(`Array must contain at least ${options.minLength} items`);
    }

    if (options.maxLength && value.length > options.maxLength) {
      errors.push(`Array must not exceed ${options.maxLength} items`);
    }

    let sanitized = value;
    if (options.itemValidator) {
      const itemErrors: string[] = [];
      sanitized = value.map((item, index) => {
        const result = options.itemValidator!(item);
        if (!result.isValid) {
          itemErrors.push(`Item ${index}: ${result.errors.join(', ')}`);
        }
        return result.sanitized !== undefined ? result.sanitized : item;
      });

      if (itemErrors.length > 0) {
        errors.push(...itemErrors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  validateObject(value: any, schema: Schema): ValidationResult {
    const errors: string[] = [];
    const sanitized: any = {};

    if (value === null || value === undefined) {
      return { isValid: true, errors: [], sanitized: null };
    }

    if (typeof value !== 'object' || Array.isArray(value)) {
      errors.push('Value must be an object');
      return { isValid: false, errors };
    }

    for (const [key, rule] of Object.entries(schema)) {
      const fieldValue = value[key];

      if (rule.required && (fieldValue === null || fieldValue === undefined)) {
        errors.push(`${key} is required`);
        continue;
      }

      if (fieldValue === null || fieldValue === undefined) {
        continue;
      }

      let result: ValidationResult;
      switch (rule.type) {
        case 'string':
          result = this.validateString(fieldValue, {
            required: rule.required,
            minLength: rule.minLength,
            maxLength: rule.maxLength,
            pattern: rule.pattern
          });
          break;
        case 'number':
          result = this.validateNumber(fieldValue, {
            required: rule.required,
            min: rule.min,
            max: rule.max
          });
          break;
        case 'email':
          result = this.validateEmail(fieldValue, { required: rule.required });
          break;
        case 'url':
          result = this.validateURL(fieldValue, { required: rule.required });
          break;
        case 'phone':
          result = this.validatePhone(fieldValue, { required: rule.required });
          break;
        case 'date':
          result = this.validateDate(fieldValue, { required: rule.required });
          break;
        case 'array':
          result = this.validateArray(fieldValue, { required: rule.required });
          break;
        case 'boolean':
          if (typeof fieldValue !== 'boolean') {
            errors.push(`${key} must be a boolean`);
            continue;
          }
          result = { isValid: true, errors: [], sanitized: fieldValue };
          break;
        case 'object':
          if (typeof fieldValue !== 'object' || Array.isArray(fieldValue)) {
            errors.push(`${key} must be an object`);
            continue;
          }
          result = { isValid: true, errors: [], sanitized: fieldValue };
          break;
        default:
          result = { isValid: true, errors: [], sanitized: fieldValue };
      }

      if (!result.isValid) {
        errors.push(`${key}: ${result.errors.join(', ')}`);
      } else {
        sanitized[key] = result.sanitized !== undefined ? result.sanitized : fieldValue;
      }

      if (rule.allowedValues && !rule.allowedValues.includes(sanitized[key])) {
        errors.push(`${key} must be one of: ${rule.allowedValues.join(', ')}`);
      }

      if (rule.customValidator) {
        const customResult = rule.customValidator(sanitized[key]);
        if (customResult !== true) {
          errors.push(`${key}: ${typeof customResult === 'string' ? customResult : 'Custom validation failed'}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  sanitizeXSS(input: string): string {
    let sanitized = input;

    for (const pattern of this.xssPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    return sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  sanitizeSQLInjection(input: string): string {
    let sanitized = input;

    for (const pattern of this.sqlInjectionPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    return sanitized;
  }

  sanitizeInput(input: any, options: { xss?: boolean; sqlInjection?: boolean; trim?: boolean } = {}): any {
    const { xss = true, sqlInjection = true, trim = true } = options;

    if (typeof input === 'string') {
      let sanitized = input;

      if (trim) {
        sanitized = sanitized.trim();
      }

      if (xss) {
        sanitized = this.sanitizeXSS(sanitized);
      }

      if (sqlInjection) {
        sanitized = this.sanitizeSQLInjection(sanitized);
      }

      return sanitized;
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item, options));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value, options);
      }
      return sanitized;
    }

    return input;
  }

  validateJSON(value: any): ValidationResult {
    const errors: string[] = [];

    if (typeof value === 'function') {
      errors.push('Value cannot be serialized to JSON');
      return { isValid: false, errors };
    }

    if (typeof value === 'string') {
      try {
        JSON.parse(value);
        return { isValid: true, errors: [], sanitized: JSON.parse(value) };
      } catch (error) {
        errors.push('Invalid JSON format');
        return { isValid: false, errors };
      }
    }

    try {
      const serialized = JSON.stringify(value);
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const deserialized = JSON.parse(serialized);
        if (typeof deserialized !== 'object' || deserialized === null) {
          errors.push('Value cannot be serialized to JSON');
          return { isValid: false, errors };
        }
      }
      return { isValid: true, errors: [], sanitized: value };
    } catch (error) {
      errors.push('Value cannot be serialized to JSON');
      return { isValid: false, errors };
    }
  }

  validateUUID(value: any, options: { required?: boolean } = {}): ValidationResult {
    const errors: string[] = [];

    if (options.required && (value === null || value === undefined || value === '')) {
      errors.push('UUID is required');
      return { isValid: false, errors };
    }

    if (value === null || value === undefined || value === '') {
      return { isValid: true, errors: [], sanitized: null };
    }

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(value)) {
      errors.push('Invalid UUID format');
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors: [],
      sanitized: value.toLowerCase()
    };
  }

  validatePassword(value: any, options: { required?: boolean; minLength?: number; requireUppercase?: boolean; requireLowercase?: boolean; requireNumbers?: boolean; requireSpecialChars?: boolean } = {}): ValidationResult {
    const errors: string[] = [];

    if (options.required && (value === null || value === undefined || value === '')) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (value === null || value === undefined || value === '') {
      return { isValid: true, errors: [], sanitized: null };
    }

    if (typeof value !== 'string') {
      errors.push('Password must be a string');
      return { isValid: false, errors };
    }

    const minLength = options.minLength || 8;

    if (value.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    if (options.requireUppercase && !/[A-Z]/.test(value)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (options.requireLowercase && !/[a-z]/.test(value)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (options.requireNumbers && !/[0-9]/.test(value)) {
      errors.push('Password must contain at least one number');
    }

    if (options.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: value
    };
  }
}

export default ValidationUtility;
