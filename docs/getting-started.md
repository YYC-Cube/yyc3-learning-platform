# 快速开始

## 环境要求

- Node.js 18.x 或更高版本
- MySQL 8.0 或更高版本
- pnpm 8.x (推荐) 或 npm/yarn

## 安装步骤

### 1. 克隆项目

\`\`\`bash
git clone <repository-url>
cd ai-learning-platform
\`\`\`

### 2. 安装依赖

\`\`\`bash
pnpm install
# 或
npm install
\`\`\`

### 3. 配置环境变量

复制环境变量示例文件：

\`\`\`bash
cp .env.example .env.local
\`\`\`

编辑 \`.env.local\` 文件，填写必需的配置：

\`\`\`bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=yyc3_yy
DB_USER=yyc3_ls
DB_PASS=yyc3_ls

# JWT密钥（必须修改）
JWT_SECRET=your-super-secret-key

# 应用URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. 初始化数据库

确保MySQL服务正在运行，然后执行：

\`\`\`bash
pnpm run db:init
\`\`\`

### 5. 启动开发服务器

\`\`\`bash
pnpm dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 开发命令

\`\`\`bash
# 开发模式
pnpm dev

# 生产构建
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 类型检查
pnpm type-check

# 数据库初始化
pnpm db:init

# 数据库测试
pnpm db:test

# 环境变量验证
pnpm validate-env
\`\`\`

## 项目结构

\`\`\`
ai-learning-platform/
├── app/                    # Next.js应用目录
│   ├── api/               # API路由
│   ├── (pages)/           # 页面路由
│   └── layout.tsx         # 根布局
├── components/            # React组件
│   ├── ui/               # UI基础组件
│   └── ...               # 业务组件
├── lib/                   # 工具函数库
├── types/                 # TypeScript类型定义
├── data/                  # 静态数据
├── hooks/                 # 自定义Hooks
├── docs/                  # 项目文档
├── scripts/               # 脚本文件
└── public/                # 静态资源
\`\`\`

## 下一步

- 阅读 [项目架构](./architecture.md) 了解系统设计
- 查看 [API文档](./api-documentation.md) 了解接口详情
- 参考 [开发规范](./coding-standards.md) 进行开发
