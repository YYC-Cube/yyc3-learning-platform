import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // 全局测试环境
    globals: true,

    // 测试环境配置
    environment: 'jsdom',

    // 设置全局变量
    setupFiles: ['./vitest.setup.tsx'],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'coverage/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
        '**/__tests__/**',
        '**/mocks/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
      // 覆盖率阈值
      lines: 20,
      functions: 20,
      branches: 20,
      statements: 20,
      // 所有文件都包含在覆盖率中
      all: true,
    },

    // 测试超时时间
    testTimeout: 10000,

    // 测试文件匹配模式
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],

    // 排除的测试文件
    exclude: [
      'node_modules/**',
      'dist/',
      'build/',
      '.next/',
      'coverage/',
      '**/node_modules/**',
      'services/**/node_modules/**',
      'packages/**/node_modules/**',
      '**/*.config.{js,ts}',
      '**/.next/**',
      '**/out/**',
    ],

    // 监听模式配置
    watch: true,

    // 报告器配置
    reporters: ['verbose', 'json', 'html'],

    // 并行执行
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // 别名配置
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/app': path.resolve(__dirname, './app'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/data': path.resolve(__dirname, './data'),
      '@/hooks': path.resolve(__dirname, './hooks'),
    },
  },

  // 解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/app': path.resolve(__dirname, './app'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks'),
    },
  },
});
