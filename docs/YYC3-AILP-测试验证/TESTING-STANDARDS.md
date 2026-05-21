# YYC³ Learning Platform - 测试规范文档

> **文档类型**: 测试规范
> **版本**: v1.0.0
> **创建日期**: 2026-01-03
> **测试框架**: Vitest
> **维护团队**: YYC³ AI Team

---

## 📋 目录

- [测试原则](#测试原则)
- [测试类型](#测试类型)
- [测试目录结构](#测试目录结构)
- [命名规范](#命名规范)
- [测试编写规范](#测试编写规范)
- [覆盖率要求](#覆盖率要求)
- [测试工具](#测试工具)
- [最佳实践](#最佳实践)
- [CI/CD集成](#cicd集成)

---

## 🎯 测试原则

### 测试金字塔

```
        /\
       /  \          E2E测试 (10%)
      /────\         - 用户场景测试
     /  集成  \       - API集成测试
    /   测试    \
   /────────────\    单元测试 (70%)
  /    单元测试    \  - 组件测试
 /─────────────────\ - 函数测试
/__________________\
```

### FIRST原则

- **F**ast - 快速: 测试应该快速运行
- **I**ndependent - 独立: 测试之间应该相互独立
- **R**epeatable - 可重复: 测试结果应该可重复
- **S**elf-Validating - 自我验证: 测试应该有明确的通过/失败结果
- **T**imely - 及时: 测试应该与代码同步编写

---

## 📚 测试类型

### 1. 单元测试 (Unit Tests)

**定义**: 测试单个函数、类或组件

**示例**:

```typescript
// lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2026-01-03');
    expect(formatDate(date)).toBe('2026-01-03');
  });

  it('should handle invalid date', () => {
    expect(formatDate(null)).toBe('Invalid Date');
  });
});
```

### 2. 组件测试 (Component Tests)

**定义**: 测试React组件的渲染和交互

**示例**:

```typescript
// components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick handler', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 3. 集成测试 (Integration Tests)

**定义**: 测试多个模块协同工作

**示例**:

```typescript
// __tests__/integration/auth.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { authenticate, getUserData } from '@/lib/api';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    // 设置测试环境
    await setupTestDatabase();
  });

  afterAll(async () => {
    // 清理测试环境
    await cleanupTestDatabase();
  });

  it('should authenticate and fetch user data', async () => {
    const token = await authenticate('test@example.com', 'password');
    expect(token).toBeDefined();

    const user = await getUserData(token);
    expect(user.email).toBe('test@example.com');
  });
});
```

### 4. E2E测试 (End-to-End Tests)

**定义**: 测试完整的用户流程

**示例**:

```typescript
// e2e/exam-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Exam Flow', () => {
  test('should complete exam flow', async ({ page }) => {
    await page.goto('/exam/demo-exam');

    // 开始考试
    await page.click('button:has-text("开始考试")');

    // 回答问题
    await page.click('label:has-text("选项A")');
    await page.click('button:has-text("下一题")');

    // 提交考试
    await page.click('button:has-text("提交")');

    // 查看结果
    await expect(page.locator('text=考试成绩')).toBeVisible();
  });
});
```

---

## 📁 测试目录结构

### 推荐结构

```
learning-platform/
├── __tests__/                    # 测试根目录
│   ├── unit/                    # 单元测试
│   │   ├── components/          # 组件测试
│   │   │   ├── Button.test.tsx
│   │   │   ├── Card.test.tsx
│   │   │   └── ...
│   │   ├── lib/                 # 工具函数测试
│   │   │   ├── utils.test.ts
│   │   │   ├── validators.test.ts
│   │   │   └── ...
│   │   └── hooks/               # Hooks测试
│   │       ├── useUser.test.ts
│   │       └── ...
│   ├── integration/             # 集成测试
│   │   ├── api/                 # API集成测试
│   │   ├── auth/                # 认证集成测试
│   │   └── ...
│   ├── e2e/                     # E2E测试
│   │   ├── exam-flow.spec.ts
│   │   ├── auth-flow.spec.ts
│   │   └── ...
│   ├── fixtures/                # 测试数据
│   │   ├── users.ts
│   │   ├── courses.ts
│   │   └── exams.ts
│   ├── mocks/                   # Mock文件
│   │   ├── handlers.ts
│   │   └── data.ts
│   └── utils/                   # 测试工具
│       ├── test-helpers.ts
│       └── render.ts
├── vitest.config.ts             # Vitest配置
├── vitest.setup.ts              # 全局设置
└── coverage/                    # 覆盖率报告
```

### co-locate原则（推荐）

也可以将测试文件放在源文件旁边：

```
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx         # 组件测试
│   └── Button.stories.tsx       # Storybook
lib/
├── utils.ts
└── utils.test.ts               # 工具测试
```

---

## 📝 命名规范

### 文件命名

```
单元测试:
  • 文件名: *.test.ts 或 *.test.tsx
  • 示例: Button.test.tsx, utils.test.ts

集成测试:
  • 文件名: *.integration.test.ts
  • 示例: auth.integration.test.ts

E2E测试:
  • 文件名: *.spec.ts (Playwright)
  • 示例: exam-flow.spec.ts
```

### 测试描述命名

使用清晰、描述性的测试名称：

```typescript
// ✅ 好的命名
describe('Button Component', () => {
  it('should render with correct text', () => {});
  it('should call onClick when clicked', () => {});
  it('should be disabled when disabled prop is true', () => {});
});

// ❌ 不好的命名
describe('Button', () => {
  it('works', () => {});
  it('test 1', () => {});
});
```

---

## ✍️ 测试编写规范

### 基本结构

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Feature/Component Name', () => {
  // 前置条件
  beforeEach(async () => {
    // 每个测试前执行
  });

  // 后置清理
  afterEach(() => {
    // 每个测试后执行
  });

  // 测试用例
  it('should do something when condition', async () => {
    // Arrange (准备)
    const input = 'test';

    // Act (执行)
    const result = functionUnderTest(input);

    // Assert (断言)
    expect(result).toBe('expected');
  });
});
```

### AAA模式

每个测试应该遵循 **Arrange-Act-Assert** 模式：

```typescript
it('should calculate exam score', () => {
  // Arrange - 准备测试数据
  const answers = [1, 2, 3, 4];
  const correctAnswers = [1, 2, 3, 4];

  // Act - 执行被测试的功能
  const score = calculateScore(answers, correctAnswers);

  // Assert - 验证结果
  expect(score).toBe(100);
  expect(score).toBeGreaterThan(0);
});
```

### 异步测试

```typescript
it('should fetch user data', async () => {
  // 使用 async/await
  const user = await fetchUser('user-123');
  expect(user).toBeDefined();
  expect(user.name).toBe('Test User');
});

it('should handle API errors', async () => {
  // 测试错误情况
  await expect(fetchUser('invalid-id')).rejects.toThrow('User not found');
});
```

### 测试分组

使用 `describe` 将相关测试分组：

```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should authenticate valid user', () => {});
    it('should reject invalid credentials', () => {});
    it('should handle network errors', () => {});
  });

  describe('register', () => {
    it('should create new user', () => {});
    it('should validate email format', () => {});
  });
});
```

---

## 📊 覆盖率要求

### 目标覆盖率

| 类别           | 当前目标 | 最终目标 | 截止日期   |
| -------------- | -------- | -------- | ---------- |
| **总体覆盖率** | 20%      | 80%      | 2026-09-30 |
| **单元测试**   | 30%      | 90%      | 2026-07-31 |
| **集成测试**   | 15%      | 70%      | 2026-08-31 |
| **E2E测试**    | 10%      | 50%      | 2026-09-30 |

### 分层覆盖率要求

#### 关键模块 (P0)

- 认证授权: > 90%
- 支付系统: > 90%
- 数据持久化: > 85%
- API路由: > 80%

#### 重要模块 (P1)

- 业务逻辑: > 70%
- 组件库: > 75%
- 工具函数: > 85%

#### 一般模块 (P2)

- UI组件: > 50%
- 辅助功能: > 40%

### 覆盖率命令

```bash
# 查看覆盖率
npm run test:coverage

# 按模块查看
npm run test:coverage -- --reporter=verbose

# 生成HTML报告
open coverage/index.html
```

---

## 🛠️ 测试工具

### Vitest CLI

```bash
# 运行所有测试
npm run test

# 监视模式
npm run test:watch

# 运行特定文件
npm run test Button.test.tsx

# 运行匹配模式的测试
npm run test -- --grep "Button"

# UI模式
npm run test:ui

# 覆盖率报告
npm run test:coverage
```

### 调试测试

```typescript
it.only('should debug this test', () => {
  // 只运行这个测试
  debugger; // 设置断点
  const result = someFunction();
  expect(result).toBe('expected');
});
```

### 快照测试

```typescript
it('should match snapshot', () => {
  const tree = renderer.create(<MyComponent />).toJSON();
  expect(tree).toMatchSnapshot();
});

// 更新快照
// npm run test -- -u
```

---

## 🏆 最佳实践

### 1. 测试独立性

```typescript
// ✅ 好的做法 - 每个测试独立
it('should create user', async () => {
  const user = await createUser({ name: 'Test' });
  expect(user.name).toBe('Test');
});

it('should update user', async () => {
  const user = await createUser({ name: 'Test2' });
  const updated = await updateUser(user.id, { name: 'Updated' });
  expect(updated.name).toBe('Updated');
});

// ❌ 不好的做法 - 测试依赖
let userId;
it('should create user', async () => {
  const user = await createUser({ name: 'Test' });
  userId = user.id; // 全局变量
});

it('should update user', async () => {
  // 依赖上一个测试的userId
  await updateUser(userId, { name: 'Updated' });
});
```

### 2. 使用描述性的断言

```typescript
// ✅ 好的做法
expect(user.age).toBe(18);
expect(user.email).toContain('@');

// ❌ 不好的做法
expect(user).toBeTruthy(); // 太模糊
expect(user.age > 0).toBe(true); // 不够具体
```

### 3. Mock外部依赖

```typescript
// ✅ Mock API调用
import { vi } from 'vitest';
import { fetchUser } from './api';

vi.mock('./api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ id: '1', name: 'Test' })),
}));

it('should display user name', async () => {
  const user = await fetchUser('1');
  expect(user.name).toBe('Test');
});
```

### 4. 测试边界条件

```typescript
describe('calculateScore', () => {
  it('should handle empty answers', () => {
    expect(calculateScore([], [])).toBe(0);
  });

  it('should handle perfect score', () => {
    expect(calculateScore([1, 1, 1], [1, 1, 1])).toBe(100);
  });

  it('should handle zero score', () => {
    expect(calculateScore([2, 2, 2], [1, 1, 1])).toBe(0);
  });
});
```

### 5. 清理副作用

```typescript
it('should update database', async () => {
  const db = await connectDatabase();

  try {
    await db.insert('users', { name: 'Test' });
    const user = await db.findOne('users', { name: 'Test' });
    expect(user).toBeDefined();
  } finally {
    // 总是清理
    await db.delete('users', { name: 'Test' });
    await db.close();
  }
});
```

---

## 🔄 CI/CD集成

### GitHub Actions配置

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### 测试钩子

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["vitest related --run"]
  }
}
```

---

## 📋 测试检查清单

### 提交代码前

- [ ] 新代码有对应测试
- [ ] 所有测试通过
- [ ] 测试覆盖率没有降低
- [ ] 没有跳过测试（`.skip`）
- [ ] 测试命名清晰

### PR审查前

- [ ] CI测试全部通过
- [ ] 覆盖率报告显示改进
- [ ] 没有测试警告
- [ ] E2E测试通过（如有）

---

## 🔗 相关资源

### 官方文档

- [Vitest文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)

### 内部文档

- [GLOBAL-ANALYSIS-REPORT.md](./GLOBAL-ANALYSIS-REPORT.md)
- [IMPROVEMENT-ROADMAP.md](./IMPROVEMENT-ROADMAP.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)

---

**文档维护**: YYC³ AI Team
**最后更新**: 2026-01-03
**下次审核**: 2026-02-03
