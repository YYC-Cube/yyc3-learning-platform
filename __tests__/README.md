# 测试框架快速开始指南

> **版本**: v1.0.0
> **更新日期**: 2026-01-03
> **测试框架**: Vitest

---

## 📦 已安装的测试框架组件

### ✅ 配置文件

```
learning-platform/
├── vitest.config.ts          # Vitest主配置
├── vitest.setup.ts           # 全局设置
└── package.json              # 已更新测试脚本
```

### 📁 测试目录结构

```
__tests__/
├── unit/                     # 单元测试
│   ├── components/           # 组件测试示例
│   ├── lib/                  # 工具函数测试示例
│   └── ...
├── integration/              # 集成测试
├── e2e/                      # E2E测试
├── fixtures/                 # 测试数据
│   ├── users.ts
│   └── courses.ts
└── utils/                    # 测试工具
    └── test-helpers.ts
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装Vitest和相关依赖
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# 安装Playwright (E2E测试)
pnpm add -D @playwright/test
npx playwright install
```

### 2. 运行测试

```bash
# 运行所有测试
pnpm test

# 监视模式（开发时使用）
pnpm test:watch

# UI模式（可视化测试结果）
pnpm test:ui

# 查看覆盖率
pnpm test:coverage

# 只运行单元测试
pnpm test:unit

# 只运行集成测试
pnpm test:integration

# 运行E2E测试
pnpm test:e2e
```

---

## 📝 编写测试

### 单元测试示例

```typescript
// __tests__/unit/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2026-01-03');
    expect(formatDate(date)).toBe('2026-01-03');
  });
});
```

### 组件测试示例

```tsx
// __tests__/unit/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/button';

describe('Button', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
});
```

---

## 📊 覆盖率目标

### 阶段性目标

| 时间 | 目标覆盖率 |
|------|-----------|
| 第1周 | 10% |
| 第2周 | 15% |
| 第4周 | 20% |
| 第8周 | 30% |
| 第12周 | 50% |

### 当前状态 (第0周)

```
总文件数: 392
测试文件: 25
覆盖率: 6.4% 🔴

本周目标: 10% 🟡
```

---

## 🎯 本周任务清单

### ✅ 已完成
- [x] 配置Vitest
- [x] 创建测试规范文档
- [x] 建立测试目录结构
- [x] 创建测试工具和fixture

### ⏳ 进行中
- [ ] 编写核心组件测试（目标：20个组件）
- [ ] 编写工具函数测试（目标：15个函数）
- [ ] 编写API测试（目标：10个端点）

### 📝 待完成

- [ ] 安装Vitest依赖包
- [ ] 配置CI/CD集成
- [ ] 建立测试数据管理
- [ ] 编写测试模板文档

---

## 📖 参考文档

### 内部文档
- [TESTING-STANDARDS.md](../docs/TESTING-STANDARDS.md) - 完整测试规范
- [GLOBAL-ANALYSIS-EXECUTIVE-SUMMARY.md](../docs/GLOBAL-ANALYSIS-EXECUTIVE-SUMMARY.md) - 改进计划

### 官方文档
- [Vitest文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright文档](https://playwright.dev/docs/intro)

---

## 💡 提示

### 测试文件位置
- 单元测试可以放在源文件旁边：`Component.tsx` → `Component.test.tsx`
- 集成测试和E2E测试放在 `__tests__/` 目录

### 测试命名
- 使用 `.test.ts` 或 `.test.tsx` 后缀
- 使用 `describe` 分组相关测试
- 使用清晰的测试描述

### 快速测试特定文件
```bash
# 测试单个文件
pnpm test Button.test.tsx

# 测试匹配模式
pnpm test -- --grep "Button"

# 只运行失败的测试
pnpm test -- --reporter=verbose --run
```

---

**更新**: 2026-01-03
**维护**: YYC³ AI Team
