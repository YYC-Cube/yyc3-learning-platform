# 代码规范文档

## TypeScript规范

### 类型定义

使用显式类型，避免使用 `any`

\`\`\`typescript
// Good
interface User {
  id: string
  name: string
  email: string
}

function getUser(id: string): Promise<User | null> {
  // ...
}

// Bad
function getUser(id: any): any {
  // ...
}
\`\`\`

### 导入顺序

\`\`\`typescript
// 1. React相关
import { useState, useEffect } from "react"

// 2. Next.js相关
import { useRouter } from 'next/navigation'

// 3. 第三方库
import { z } from "zod"

// 4. 内部组件
import { Button } from "@/components/ui/button"

// 5. 工具函数
import { cn } from "@/lib/utils"

// 6. 类型定义
import type { User } from "@/types"

// 7. 样式
import "./styles.css"
\`\`\`

## React规范

### 组件定义

使用函数组件和TypeScript

\`\`\`typescript
interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: "default" | "outline"
}

export function Button({ onClick, children, variant = "default" }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
\`\`\`

### Hooks使用

\`\`\`typescript
// 将复杂逻辑抽取为自定义Hook
function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 认证逻辑
  }, [])

  return { user, loading }
}
\`\`\`

## 命名规范

### 文件命名

- 组件文件: `kebab-case.tsx` (例: `user-profile.tsx`)
- 工具文件: `kebab-case.ts` (例: `format-date.ts`)
- 类型文件: `kebab-case.ts` (例: `user-types.ts`)
- 常量文件: `UPPER_CASE.ts` (例: `API_URLS.ts`)

### 变量命名

\`\`\`typescript
// 常量: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3

// 变量和函数: camelCase
const userId = "123"
function getUserById(id: string) {}

// 类型和接口: PascalCase
interface UserProfile {}
type ApiResponse = {}

// 组件: PascalCase
function UserCard() {}

// 私有成员: _camelCase
class Service {
  private _token: string
}
\`\`\`

## 代码格式

### 缩进和空格

- 使用2个空格缩进
- 文件末尾保留一个空行
- 行尾不留空格

### 字符串

优先使用模板字符串

\`\`\`typescript
// Good
const message = `Hello, ${name}!`

// Bad
const message = "Hello, " + name + "!"
\`\`\`

### 条件语句

\`\`\`typescript
// 简单条件使用三元运算符
const status = isActive ? "active" : "inactive"

// 复杂条件使用if语句
if (user.isAdmin && user.hasPermission("edit")) {
  // ...
} else {
  // ...
}
\`\`\`

## 注释规范

### 函数注释

\`\`\`typescript
/**
 * 获取用户信息
 * @param userId - 用户ID
 * @returns 用户对象或null
 * @throws {Error} 当用户不存在时
 */
async function getUser(userId: string): Promise<User | null> {
  // ...
}
\`\`\`

### 行内注释

\`\`\`typescript
// TODO: 实现缓存逻辑
// FIXME: 修复并发问题
// NOTE: 这里的逻辑需要优化
\`\`\`

## 错误处理

### Try-Catch

\`\`\`typescript
async function fetchData() {
  try {
    const response = await fetch("/api/data")
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch data:", error)
    throw new Error("Data fetch failed")
  }
}
\`\`\`

### 错误边界

\`\`\`typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <MyComponent />
</ErrorBoundary>
\`\`\`

## 最佳实践

### 1. 避免魔法数字

\`\`\`typescript
// Good
const MAX_USERS = 100
if (users.length > MAX_USERS) {}

// Bad
if (users.length > 100) {}
\`\`\`

### 2. 使用可选链

\`\`\`typescript
// Good
const userName = user?.profile?.name

// Bad
const userName = user && user.profile && user.profile.name
\`\`\`

### 3. 对象解构

\`\`\`typescript
// Good
const { name, email } = user

// Bad
const name = user.name
const email = user.email
\`\`\`

### 4. 数组方法

\`\`\`typescript
// Good
const activeUsers = users.filter((u) => u.isActive)

// Bad
const activeUsers = []
for (let i = 0; i < users.length; i++) {
  if (users[i].isActive) {
    activeUsers.push(users[i])
  }
}
\`\`\`

### 5. 避免嵌套过深

\`\`\`typescript
// Good
async function processUser(userId: string) {
  const user = await getUser(userId)
  if (!user) return null

  const profile = await getProfile(user.id)
  if (!profile) return null

  return { user, profile }
}

// Bad
async function processUser(userId: string) {
  const user = await getUser(userId)
  if (user) {
    const profile = await getProfile(user.id)
    if (profile) {
      return { user, profile }
    }
  }
  return null
}
\`\`\`

## 测试规范

### 测试文件命名

- 单元测试: `*.test.ts`
- 集成测试: `*.integration.test.ts`
- E2E测试: `*.e2e.test.ts`

### 测试结构

\`\`\`typescript
describe("UserService", () => {
  describe("getUser", () => {
    it("should return user when found", async () => {
      // Arrange
      const userId = "123"

      // Act
      const user = await getUser(userId)

      // Assert
      expect(user).toBeDefined()
      expect(user?.id).toBe(userId)
    })

    it("should return null when not found", async () => {
      // ...
    })
  })
})
\`\`\`

## Git提交规范

### 提交消息格式

\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### 类型

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

### 示例

\`\`\`
feat(auth): add JWT authentication

- Implement login endpoint
- Add JWT token generation
- Create auth middleware

Closes #123
\`\`\`

## Code Review检查清单

- [ ] 代码符合项目规范
- [ ] 类型定义完整
- [ ] 错误处理完善
- [ ] 有必要的注释
- [ ] 没有安全漏洞
- [ ] 性能考虑合理
- [ ] 测试覆盖充分
- [ ] 文档已更新
