# 项目架构文档

## 技术架构

### 前端架构

\`\`\`
┌─────────────────────────────────────┐
│         Next.js App Router          │
├─────────────────────────────────────┤
│  React 19 + TypeScript + Tailwind   │
├─────────────────────────────────────┤
│      shadcn/ui Components           │
├─────────────────────────────────────┤
│    React Hook Form + Zod            │
└─────────────────────────────────────┘
\`\`\`

### 后端架构

\`\`\`
┌─────────────────────────────────────┐
│       Next.js API Routes            │
├─────────────────────────────────────┤
│      Authentication Layer           │
│         (JWT + bcrypt)              │
├─────────────────────────────────────┤
│       Business Logic                │
├─────────────────────────────────────┤
│      Database Layer                 │
│        (MySQL 8.0)                  │
└─────────────────────────────────────┘
\`\`\`

## 目录结构

### app/

Next.js App Router，包含所有页面和API路由

- `api/` - API端点
- `(pages)/` - 页面路由
- `layout.tsx` - 根布局
- `globals.css` - 全局样式

### components/

React组件库

- `ui/` - shadcn/ui基础组件
- `accessibility/` - 无障碍组件
- 业务组件

### lib/

工具函数和核心逻辑

- `database.ts` - 数据库连接和查询
- `auth.ts` - 认证和授权
- `utils.ts` - 通用工具函数
- `constants.ts` - 常量定义
- `api-client.ts` - API客户端
- `validators.ts` - 数据验证
- `error-handler.ts` - 错误处理

### types/

TypeScript类型定义

- `index.ts` - 通用类型
- `api.ts` - API类型
- `database.ts` - 数据库类型

### data/

静态数据和模拟数据

- `exams.ts` - 考试数据
- `teams.ts` - 团队数据
- `question-bank.ts` - 题库数据
- `course-data.ts` - 课程数据

### hooks/

自定义React Hooks

- `use-mobile.ts` - 移动端检测
- `use-toast.ts` - Toast通知
- `use-exam-state.ts` - 考试状态管理
- `use-local-storage.ts` - 本地存储
- `use-timer.ts` - 计时器
- `use-scroll-lock.ts` - 滚动锁定

### scripts/

自动化脚本

- `init-db.ts` - 数据库初始化
- `test-db.ts` - 数据库测试
- `validate-env.ts` - 环境变量验证

## 数据流

### 用户认证流程

\`\`\`

1. 用户登录
   ↓
2. API验证凭证
   ↓
3. 生成JWT Token
   ↓
4. 存储在Cookie
   ↓
5. Middleware验证Token
   ↓
6. 访问受保护资源
\`\`\`

### 数据获取流程

\`\`\`

1. 页面请求数据
   ↓
2. API Route处理
   ↓
3. 数据库查询
   ↓
4. 数据验证和转换
   ↓
5. 返回JSON响应
   ↓
6. 页面渲染
\`\`\`

## 安全措施

1. **认证**: JWT + HTTP-only Cookies
2. **密码加密**: bcrypt
3. **输入验证**: Zod schemas
4. **SQL注入防护**: 参数化查询
5. **XSS防护**: React自动转义
6. **CSRF防护**: SameSite Cookie
7. **Rate Limiting**: API速率限制

## 性能优化

1. **代码分割**: Next.js自动代码分割
2. **图片优化**: Next.js Image组件
3. **服务端渲染**: RSC和SSR
4. **缓存策略**:
   - 静态资源CDN缓存
   - API响应缓存
   - 数据库查询缓存
5. **懒加载**: React.lazy和动态导入

## 可扩展性

1. **模块化设计**: 清晰的目录结构和职责分离
2. **类型安全**: TypeScript强类型
3. **组件复用**: shadcn/ui组件库
4. **配置化**: 环境变量配置
5. **文档完善**: 代码注释和文档

## 部署架构

\`\`\`
┌──────────────────────────────────────┐
│         Vercel Platform              │
│  ┌────────────────────────────────┐  │
│  │   Next.js Application          │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │   Edge Functions               │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│       MySQL Database                 │
│     (External Provider)              │
└──────────────────────────────────────┘
\`\`\`

## 监控和日志

1. **错误追踪**: Error Boundary
2. **性能监控**: Vercel Analytics
3. **日志记录**: Console + 外部服务
4. **健康检查**: /api/health端点

## 未来扩展

1. **实时功能**: WebSocket集成
2. **文件上传**: Vercel Blob Storage
3. **搜索功能**: Elasticsearch
4. **缓存层**: Redis
5. **CDN**: 静态资源分发
6. **国际化**: i18n支持
