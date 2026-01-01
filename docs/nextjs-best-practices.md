# Next.js App Router 最佳实践指南

## 服务器组件 vs 客户端组件

### 何时使用服务器组件（Server Components）

服务器组件是 Next.js App Router 的默认行为。使用服务器组件当你需要：

- **数据获取**: 直接访问数据库或后端API
- **后端资源**: 访问文件系统、环境变量
- **保护敏感信息**: API密钥、令牌等
- **减少客户端 JS**: 提升性能
- **SEO优化**: 静态内容渲染

\`\`\`typescript
// 服务器组件 (默认)
async function ProductPage({ params }) {
  const product = await db.product.findUnique({
    where: { id: params.id }
  })
  
  return <ProductDetails product={product} />
}
\`\`\`

### 何时使用客户端组件（Client Components）

添加 `"use client"` 指令当你需要：

- **React Hooks**: useState, useEffect, useContext等
- **浏览器API**: window, document, localStorage等
- **事件处理**: onClick, onChange, onSubmit等
- **自定义Hooks**: 你自己创建的hooks
- **第三方库**: 需要客户端的库

\`\`\`typescript
"use client"

import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
\`\`\`

## 组件组织模式

### 模式 1: 组件分层

将服务器逻辑和客户端交互分离：

\`\`\`typescript
// app/products/page.tsx (服务器组件)
async function ProductsPage() {
  const products = await fetchProducts()
  
  return (
    <div>
      <h1>Products</h1>
      <ProductList products={products} />
    </div>
  )
}

// components/product-list.tsx (客户端组件)
"use client"

import { useState } from "react"

function ProductList({ products }) {
  const [filter, setFilter] = useState("")
  
  return (
    <div>
      <input 
        value={filter} 
        onChange={(e) => setFilter(e.target.value)} 
      />
      {products.filter(p => p.name.includes(filter)).map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
\`\`\`

### 模式 2: Props传递

服务器组件可以传递数据给客户端组件：

\`\`\`typescript
// ✅ 正确 - 服务器组件传递数据
async function Page() {
  const data = await fetchData()
  return <ClientComponent data={data} />
}

// ❌ 错误 - 客户端组件导入服务器组件
"use client"
import ServerComponent from "./server-component"
\`\`\`

### 模式 3: 布局组合

使用服务器布局包裹客户端内容：

\`\`\`typescript
// app/layout.tsx (服务器组件)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}

// components/header.tsx (客户端组件)
"use client"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  return <nav>...</nav>
}
\`\`\`

## 常见错误和解决方案

### 错误 1: 预渲染错误

**症状**:
\`\`\`
Error: Cannot destructure property 'x' of 'undefined'
Export encountered an error on /page
\`\`\`

**原因**: 页面缺少 "use client" 但使用了客户端功能

**解决**:
\`\`\`typescript
// ✅ 添加 "use client"
"use client"

import { useState } from "react"

export default function Page() {
  const [state, setState] = useState()
  // ...
}
\`\`\`

### 错误 2: Hooks在服务器组件

**症状**:
\`\`\`
Error: useState only works in Client Components
\`\`\`

**原因**: 在服务器组件中使用 React hooks

**解决**:
\`\`\`typescript
// ✅ 方案 1: 添加 "use client"
"use client"

import { useState } from "react"

// ✅ 方案 2: 将交互逻辑提取到客户端组件
function InteractiveSection() {
  "use client"
  const [state, setState] = useState()
  // ...
}
\`\`\`

### 错误 3: 异步组件客户端化

**症状**:
\`\`\`
Error: async/await is not yet supported in Client Components
\`\`\`

**原因**: 客户端组件不能是 async 函数

**解决**:
\`\`\`typescript
// ❌ 错误
"use client"
async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// ✅ 正确 - 使用 useEffect
"use client"
function Page() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetchData().then(setData)
  }, [])
  
  return <div>{data}</div>
}

// ✅ 更好 - 服务器组件获取数据
async function Page() {
  const data = await fetchData()
  return <ClientComponent data={data} />
}
\`\`\`

## 性能优化技巧

### 技巧 1: 最小化客户端 JavaScript

\`\`\`typescript
// ❌ 整个页面都是客户端
"use client"

export default function Page() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <StaticHeader />
      <Counter count={count} setCount={setCount} />
      <StaticFooter />
    </div>
  )
}

// ✅ 只有交互部分是客户端
export default function Page() {
  return (
    <div>
      <StaticHeader />
      <Counter />  {/* 这个是客户端组件 */}
      <StaticFooter />
    </div>
  )
}
\`\`\`

### 技巧 2: 代码分割

\`\`\`typescript
// 懒加载客户端组件
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(
  () => import('./heavy-component'),
  { ssr: false }  // 禁用服务端渲染
)

export default function Page() {
  return (
    <div>
      <LightContent />
      <HeavyComponent />
    </div>
  )
}
\`\`\`

### 技巧 3: 数据预取

\`\`\`typescript
// 在服务器组件中预取数据
async function Page() {
  // 并行获取数据
  const [user, posts] = await Promise.all([
    fetchUser(),
    fetchPosts()
  ])
  
  return (
    <div>
      <UserInfo user={user} />
      <PostList posts={posts} />
    </div>
  )
}
\`\`\`

## 开发工作流

### 1. 创建新页面检查清单

- [ ] 确定页面是否需要客户端功能
- [ ] 如需客户端功能，添加 "use client"
- [ ] 验证所有导入的组件类型
- [ ] 测试页面在开发模式下运行
- [ ] 运行 `npm run build` 确保构建成功

### 2. 组件重构检查清单

- [ ] 识别客户端和服务器逻辑
- [ ] 将交互逻辑提取到客户端组件
- [ ] 将数据获取保留在服务器组件
- [ ] 使用 props 传递数据
- [ ] 测试功能完整性

### 3. 性能审查检查清单

- [ ] 检查不必要的 "use client"
- [ ] 验证客户端 bundle 大小
- [ ] 使用 React DevTools 检查组件树
- [ ] 测试页面加载性能
- [ ] 优化图片和资源

## 调试技巧

### 识别组件类型

\`\`\`typescript
// 查看组件是服务器还是客户端
console.log(typeof window === 'undefined' 
  ? 'Server Component' 
  : 'Client Component'
)
\`\`\`

### 构建时调试

\`\`\`bash
# 查看详细构建信息
npm run build -- --debug

# 分析 bundle 大小
npm run build -- --analyze
\`\`\`

### 开发时调试

\`\`\`typescript
// 添加调试日志
console.log('[v0] Component rendered at:', new Date())
console.log('[v0] Props:', props)
console.log('[v0] State:', state)
\`\`\`

## 工具和资源

### 推荐工具

- **Next.js DevTools**: 检查组件类型和性能
- **React DevTools**: 分析组件树
- **Lighthouse**: 性能和SEO审计
- **Bundle Analyzer**: 分析打包大小

### 学习资源

- [Next.js文档](https://nextjs.org/docs)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)

---

遵循这些最佳实践可以帮助你构建高性能、可维护的 Next.js 应用。
