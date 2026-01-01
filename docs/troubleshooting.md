# 故障排除指南

本文档提供常见问题的解决方案和调试技巧。

---

## 目录

1. [构建错误](#构建错误)
2. [运行时错误](#运行时错误)
3. [样式问题](#样式问题)
4. [性能问题](#性能问题)
5. [部署问题](#部署问题)
6. [开发环境问题](#开发环境问题)

---

## 构建错误

### 错误: "Cannot find module" 或 "X is not defined"

**症状**: 构建失败，提示某个模块或变量未定义

**原因**: 导入语句缺失或不正确

**解决方案**:

\`\`\`bash

## 1. 检查导入语句

## 确保所有使用的组件都已导入

## 2. 验证包是否安装

npm list [package-name]

## 3. 重新安装依赖

rm -rf node_modules package-lock.json
npm install

## 4. 清理构建缓存

rm -rf .next
npm run build
\`\`\`

**示例修复**:
\`\`\`tsx
// ❌ 错误
import { Bitcoin as Button } from 'lucide-react' // 错误的包

// ✅ 正确
import { Button } from "@/components/ui/button"
import { Check } from 'lucide-react'
\`\`\`

---

### 错误: "Module not found: Can't resolve '@/...'"

**症状**: TypeScript 路径别名无法解析

**解决方案**:

检查 `tsconfig.json`:
\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
\`\`\`

---

### 错误: "Prerender error" (预渲染错误)

**症状**: 静态页面生成时失败

**原因**:

- 使用了仅在客户端可用的 API (如 window, localStorage)
- 缺少必要的导入
- 数据获取失败

**解决方案**:

\`\`\`tsx
// ❌ 错误 - 直接在组件顶层使用
const data = localStorage.getItem('key')

// ✅ 正确 - 在 useEffect 中使用
'use client'
import { useEffect, useState } from 'react'

function Component() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    setData(localStorage.getItem('key'))
  }, [])
}
\`\`\`

---

## 运行时错误

### 错误: "Hydration failed"

**症状**: 页面渲染后出现警告或错误

**原因**: 服务器端和客户端渲染的 HTML 不一致

**解决方案**:

\`\`\`tsx
// ❌ 错误
<div>{Date.now()}</div> // 每次渲染结果不同

// ✅ 正确
'use client'
function Component() {
  const [time, setTime] = useState(null)
  
  useEffect(() => {
    setTime(Date.now())
  }, [])
  
  return <div>{time}</div>
}
\`\`\`

---

### 错误: "Maximum update depth exceeded"

**症状**: 组件无限循环更新

**原因**: useState 或 useEffect 配置错误

**解决方案**:

\`\`\`tsx
// ❌ 错误
function Component() {
  const [count, setCount] = useState(0)
  setCount(count + 1) // 每次渲染都触发更新
}

// ✅ 正确
function Component() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    setCount(count + 1)
  }, []) // 只在挂载时执行
}
\`\`\`

---

## 样式问题

### Tailwind CSS 样式不生效

**症状**: Tailwind 类名不起作用

**解决方案**:

\`\`\`bash

## 1. 确认 tailwind.config.ts 配置正确

## 检查 content 路径是否包含所有文件

## 2. 确认 globals.css 包含指令

@tailwind base;
@tailwind components;
@tailwind utilities;

## 3. 重启开发服务器

npm run dev
\`\`\`

---

### 自定义 CSS 变量不生效

**症状**: CSS 变量值不正确

**解决方案**:

检查 `app/globals.css`:
\`\`\`css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
\`\`\`

确保在 `tailwind.config.ts` 中引用:
\`\`\`ts
theme: {
  extend: {
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
    }
  }
}
\`\`\`

---

## 性能问题

### 页面加载缓慢

**诊断步骤**:

\`\`\`bash

## 1. 分析构建大小

npm run build

## 2. 使用 Lighthouse 检查

npx lighthouse <http://localhost:3000>

## 3. 检查 Network 标签

## 查看哪些资源加载时间最长

\`\`\`

**优化方案**:

\`\`\`tsx
// 1. 使用动态导入
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
})

// 2. 图片优化
import Image from 'next/image'
<Image src="/image.jpg" width={500} height={300} alt="..." />

// 3. 字体优化
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
\`\`\`

---

## 部署问题

### Vercel 部署失败

**症状**: 部署在构建阶段失败

**检查清单**:

\`\`\`bash

## ✅ 1. 本地构建测试

npm run build

## ✅ 2. 检查环境变量

## 在 Vercel 项目设置中添加所有必需的环境变量

## ✅ 3. 检查 Node 版本

## 确保 package.json 中指定的 Node 版本正确

{
  "engines": {
    "node": ">=18.0.0"
  }
}

## ✅ 4. 检查构建日志

## 在 Vercel 控制台查看详细错误信息

\`\`\`

---

### 环境变量未生效

**症状**: 部署后环境变量为 undefined

**解决方案**:

\`\`\`bash

## 1. 客户端变量必须以 NEXT_PUBLIC_ 开头

NEXT_PUBLIC_API_URL=<https://api.example.com>

## 2. 在 Vercel 中添加环境变量

## Dashboard -> Settings -> Environment Variables

## 3. 重新部署

git commit --allow-empty -m "Trigger rebuild"
git push
\`\`\`

---

## 开发环境问题

### 热重载不工作

**症状**: 修改代码后页面不自动刷新

**解决方案**:

\`\`\`bash

## 1. 清理缓存

rm -rf .next

## 2. 重启开发服务器

npm run dev

## 3. 检查文件监听限制 (Linux/Mac)

echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
\`\`\`

---

### TypeScript 错误但代码正常运行

**症状**: VSCode 显示错误但编译成功

**解决方案**:

\`\`\`bash

## 1. 重启 TypeScript 服务器

## VSCode: Cmd+Shift+P -> "TypeScript: Restart TS Server"

## 2. 清理并重建

rm -rf node_modules .next
npm install
npm run build

## 3. 检查 TypeScript 版本

npm list typescript
\`\`\`

---

## 常用调试命令

\`\`\`bash

## 查看详细构建日志

npm run build -- --debug

## 类型检查

npm run type-check

## 代码检查

npm run lint

## 清理所有缓存

rm -rf .next node_modules package-lock.json
npm install

## 查看依赖树

npm list --depth=0

## 安全审计

npm audit
npm audit fix

## 查看过期包

npm outdated
\`\`\`

---

## 获取帮助

如果以上方案无法解决问题:

1. **查看构建日志**: 完整阅读错误信息
2. **搜索文档**: Next.js 官方文档
3. **GitHub Issues**: 搜索相关问题
4. **社区支持**: Stack Overflow, Discord
5. **创建 Issue**: 提供完整的错误信息和复现步骤

---

## 报告问题时需要提供的信息

\`\`\`markdown
**环境信息**:

- OS: [e.g. macOS 14.0]
- Node: [e.g. 18.17.0]
- npm/pnpm: [e.g. 9.6.7]
- Next.js: [e.g. 15.5.7]

**问题描述**:
[清楚描述问题]

**复现步骤**:
1.
2.
3.

**预期行为**:
[应该发生什么]

**实际行为**:
[实际发生了什么]

**错误日志**:
\`\`\`
[粘贴完整的错误信息]
\`\`\`

**已尝试的解决方案**:

- [ ] 清理缓存
- [ ] 重新安装依赖
- [ ] 检查文档
\`\`\`

---

**文档版本**: 1.0  
**最后更新**: 2025-01-07
