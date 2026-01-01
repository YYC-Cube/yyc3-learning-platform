/** @type {import('jest').Config} */
const config = {
  // 指明测试环境
  testEnvironment: 'jsdom',

  // 设置根目录
  roots: ['<rootDir>', '<rootDir>/packages'],

  // 设置模块名称映射，将@/别名映射到src目录
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@yyc3/(.*)$': '<rootDir>/packages/$1/src',
    '^next/server$': '<rootDir>/__mocks__/next-server.js',
    '\.(css|scss|sass)$': 'identity-obj-proxy',
  },

  // 设置测试文件的匹配模式
  testMatch: [
    '**/__tests__/**/*.(test|spec).[jt]s?(x)',
    '**/?(*.)+(test|spec).[tj]s?(x)',
  ],

  // 明确忽略的测试路径
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/.turbo/',
  ],

  // Haste模块配置，避免命名冲突
  haste: {
    enableSymlinks: false,
  },

  // 设置测试前需要执行的文件
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '@testing-library/jest-dom'],

  // 设置转换配置，使用ts-jest处理TypeScript文件
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
    '^.+\.(js|jsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // 设置转换忽略的文件
  transformIgnorePatterns: [
    '/node_modules/',
    '\.next/',
    'node_modules/(?!(@yyc3)/)'
  ],

  // 添加全局变量
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },

  // 收集测试覆盖率信息
  collectCoverage: true,
  collectCoverageFrom: [
    '**/app/**/*.{ts,tsx}',
    '**/components/**/*.{ts,tsx}',
    '**/lib/**/*.{ts,tsx}',
    '**/services/**/*.{ts,tsx}',
    '**/utils/**/*.{ts,tsx}',
    '**/packages/**/src/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/__tests__/**',
    '!**/*.d.ts',
    '!**/types/**/*.{ts,tsx}'
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
};

module.exports = config;
