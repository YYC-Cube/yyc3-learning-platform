# 部署指南

本指南介绍如何将AI学习平台部署到生产环境。

## 部署到 Vercel (推荐)

### 前置条件

- GitHub/GitLab/Bitbucket 账号
- Vercel 账号
- MySQL 数据库 (推荐使用云服务)

### 步骤

#### 1. 准备代码仓库

将代码推送到 Git 仓库:

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
\`\`\`

#### 2. 连接 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入你的 Git 仓库
4. 配置项目设置

#### 3. 配置环境变量

在 Vercel 项目设置中添加环境变量:

**必需的环境变量:**

\`\`\`env

# 数据库配置

DB_HOST=your-production-db-host
DB_PORT=3306
DB_NAME=your-production-db-name
DB_USER=your-production-db-user
DB_PASS=your-production-db-password

# 认证配置

JWT_SECRET=your-production-jwt-secret
SESSION_SECRET=your-production-session-secret

# 应用配置

NEXT_PUBLIC_APP_URL=<https://yourdomain.com>
NODE_ENV=production
\`\`\`

#### 4. 初始化生产数据库

在本地连接到生产数据库并运行初始化:

\`\`\`bash

# 临时设置生产数据库环境变量

export DB_HOST=your-production-db-host
export DB_NAME=your-production-db-name
export DB_USER=your-production-db-user
export DB_PASS=your-production-db-password

# 运行初始化脚本

pnpm run db:init
\`\`\`

#### 5. 部署

点击 "Deploy" 按钮，Vercel 将自动构建和部署你的应用。

### 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照说明配置 DNS 记录

## 部署到其他平台

### Docker 部署

#### 1. 创建 Dockerfile

\`\`\`dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application

RUN corepack enable pnpm && pnpm build

# Production image

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
\`\`\`

#### 2. 构建和运行

\`\`\`bash

# 构建镜像

docker build -t ai-learning-platform .

# 运行容器

docker run -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_NAME=your-db-name \
  -e DB_USER=your-db-user \
  -e DB_PASS=your-db-password \
  -e JWT_SECRET=your-jwt-secret \
  ai-learning-platform
\`\`\`

### Docker Compose

创建 `docker-compose.yml`:

\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_NAME=ai_learning
      - DB_USER=root
      - DB_PASS=password
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=ai_learning
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
\`\`\`

运行:

\`\`\`bash
docker-compose up -d
\`\`\`

## 数据库选项

### 推荐的云数据库服务

1. **PlanetScale**
   - MySQL 兼容
   - 自动扩展
   - 免费层可用

2. **AWS RDS**
   - 托管的 MySQL
   - 高可用性
   - 自动备份

3. **Google Cloud SQL**
   - 托管的 MySQL
   - 全球分布
   - 自动维护

4. **Azure Database for MySQL**
   - 托管服务
   - 企业级安全
   - 自动备份

### 配置数据库连接

确保数据库允许来自应用服务器的连接:

1. 配置防火墙规则
2. 使用 SSL/TLS 连接
3. 设置连接池参数

## 环境变量管理

### 安全最佳实践

1. **不要**在代码中硬编码密钥
2. **使用**环境变量存储敏感信息
3. **定期**更换密钥和密码
4. **限制**环境变量的访问权限

### 环境变量分类

- **公开变量**: 使用 `NEXT_PUBLIC_` 前缀
- **私密变量**: 不使用前缀，仅在服务端可用

## 性能优化

### 1. 启用缓存

\`\`\`typescript
// next.config.mjs
const nextConfig = {
  images: {
    domains: ['your-cdn-domain.com'],
  },
  // 启用静态优化
  reactStrictMode: true,
}
\`\`\`

### 2. 数据库连接池

\`\`\`typescript
// lib/database.ts
const pool = mysql.createPool({
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
})
\`\`\`

### 3. CDN 配置

使用 CDN 加速静态资源:

- Vercel 自动提供 CDN
- 或配置自定义 CDN (Cloudflare, AWS CloudFront)

## 监控和日志

### 设置监控

1. **Vercel Analytics**: 自动启用
2. **Sentry**: 错误追踪
3. **LogRocket**: 用户行为记录

### 日志记录

\`\`\`typescript
// 生产环境日志
if (process.env.NODE_ENV === 'production') {
  console.log('Application started')
}
\`\`\`

## 备份策略

### 数据库备份

1. **自动备份**: 配置数据库服务的自动备份
2. **定期导出**: 每日/每周导出数据
3. **异地存储**: 备份存储在不同地理位置

### 代码备份

1. Git 仓库作为主备份
2. 定期创建 release tag
3. 保存关键版本的构建产物

## 回滚策略

### Vercel 回滚

1. 访问 Deployments 页面
2. 选择之前的部署
3. 点击 "Promote to Production"

### 手动回滚

\`\`\`bash

# 回滚到特定版本

git revert <commit-hash>
git push origin main
\`\`\`

## 安全检查清单

- [ ] 所有密钥已更新为生产密钥
- [ ] 数据库连接使用 SSL
- [ ] CORS 配置正确
- [ ] Rate limiting 已启用
- [ ] 敏感路由有认证保护
- [ ] 错误信息不暴露敏感信息
- [ ] 依赖包已更新到最新版本
- [ ] 定期进行安全审计

## 故障排查

### 应用无法启动

1. 检查环境变量是否完整
2. 查看构建日志
3. 验证数据库连接

### 数据库连接失败

1. 检查数据库服务状态
2. 验证连接字符串
3. 确认防火墙规则

### 性能问题

1. 检查数据库查询性能
2. 分析慢查询日志
3. 优化资源加载

## 维护计划

### 定期任务

- **每周**: 检查错误日志
- **每月**: 更新依赖包
- **每季度**: 安全审计
- **每年**: 架构评审

## 扩展和升级

### 水平扩展

Vercel 自动处理扩展，无需额外配置。

### 垂直扩展

根据需要升级数据库实例规格。

## 成本优化

1. 使用适当的数据库实例大小
2. 配置合理的连接池
3. 启用静态资源缓存
4. 监控使用量和成本

## 参考链接

- [Vercel 部署文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Docker 官方文档](https://docs.docker.com)
