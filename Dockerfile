# ============================================
# YYC³ Learning Platform - Dockerfile
# 多阶段构建，优化镜像大小和构建速度
# ============================================

# 阶段 1: 依赖安装
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./
COPY packages/core-engine/package.json ./packages/core-engine/
COPY packages/autonomous-engine/package.json ./packages/autonomous-engine/
COPY packages/model-adapter/package.json ./packages/model-adapter/
COPY packages/widget-ui/package.json ./packages/widget-ui/
COPY packages/enterprise-ai-widget/package.json ./packages/enterprise-ai-widget/
COPY packages/five-dimensional-management/package.json ./packages/five-dimensional-management/

# 安装 pnpm
RUN npm install -g pnpm@8

# 安装依赖
RUN pnpm install --frozen-lockfile

# 阶段 2: 构建器
FROM node:18-alpine AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules

# 复制源代码
COPY . .

# 设置构建环境变量
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_APP_VERSION=${NEXT_PUBLIC_APP_VERSION}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 构建应用
RUN pnpm run build

# 阶段 3: 运行时
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 安装运行时依赖
RUN apk add --no-cache \
    # PostgreSQL 客户端
    postgresql-client \
    # 图像处理库
    vips-dev \
    # 其他工具
    curl \
    tzdata

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 复制 package.json 用于健康检查
COPY package.json ./

# 设置正确的权限
RUN chown -R nextjs:nodejs /app

USER nextjs

# 暴露端口
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# 启动应用
CMD ["node", "server.js"]
