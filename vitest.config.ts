import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

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
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
      include: [
        'lib/cn.ts',
        'lib/utils.ts',
        'lib/storage.ts',
        'lib/format.ts',
        'lib/date.ts',
        'lib/validators.ts',
        'lib/constants.ts',
        'lib/auth.ts',
        'lib/error-handler.ts',
        'lib/api-client.ts',
        'lib/database.ts',
        'lib/exam-utils.ts',
        'lib/logger.ts',
        'lib/performance.config.ts',
        'app/api/health/route.ts',
        'app/api/metrics/route.ts',
        'app/api/courses/route.ts',
      ],
    },

    // 测试超时时间
    testTimeout: 10000,

    // 测试文件匹配模式
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    // 排除的测试文件
    exclude: [
      'node_modules/**',
      'dist/',
      'build/',
      '.next/',
      '.pnpm-store/**',
      'coverage/',
      '**/node_modules/**',
      'services/**/node_modules/**',
      'packages/**/node_modules/**',
      'packages/**',
      '**/*.config.{js,ts}',
      '**/.next/**',
      '**/out/**',
      'e2e/**',
      'components/intelligent-ai-widget/**/*.test.*',
    ],

    // 监听模式配置
    watch: true,

    // 报告器配置
    reporters: ['default'],

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
