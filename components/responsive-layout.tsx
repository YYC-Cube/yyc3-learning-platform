/**
 * @fileoverview 响应式布局组件
 * @description 提供应用的响应式布局结构，适配不同屏幕尺寸，包含导航、页脚等通用元素
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-01-30
 * @modified 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import type { ReactNode } from "react"
import { MobileNav } from "./mobile-nav"
import BottomNav from "./bottom-nav"
import { BrandHeader } from "./brand-header"
import { BrandFooter } from "./brand-footer"
import { SkipLink } from "./accessibility/skip-link"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ResponsiveLayoutProps {
  children: ReactNode
  title?: string
  user: {
    name: string
    avatar: string
    level: string
  }
}

export function ResponsiveLayout({ children, title, user }: ResponsiveLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <SkipLink href="#main-content">跳转到主内容</SkipLink>

      {/* 导航栏 */}
      <nav
        className="bg-white/98 backdrop-blur-lg border-b border-indigo-100 sticky top-0 z-40 shadow-md"
        role="navigation"
        aria-label="主导航"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <MobileNav user={user} />
              <BrandHeader showSubtitle={false} size="sm" />
              {title && (
                <div className="hidden sm:block">
                  <span className="text-indigo-300 mx-3">|</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{title}</span>
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:bg-gradient-to-r hover:bg-clip-text hover:text-transparent transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 active:scale-95 rounded-lg px-5 py-2.5 shadow-sm hover:shadow-md"
                asChild
              >
                <Link href="/" role="menuitem" className="inline-flex items-center justify-center gap-2">
                  首页
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:bg-gradient-to-r hover:bg-clip-text hover:text-transparent transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 active:scale-95 rounded-lg px-5 py-2.5 shadow-sm hover:shadow-md"
                asChild
              >
                <Link href="/courses" role="menuitem" className="inline-flex items-center justify-center gap-2">
                  课程中心
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:bg-gradient-to-r hover:bg-clip-text hover:text-transparent transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 active:scale-95 rounded-lg px-5 py-2.5 shadow-sm hover:shadow-md"
                asChild
              >
                <Link href="/exam" role="menuitem" className="inline-flex items-center justify-center gap-2">
                  练习测试
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:bg-gradient-to-r hover:bg-clip-text hover:text-transparent transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 active:scale-95 rounded-lg px-5 py-2.5 shadow-sm hover:shadow-md"
                asChild
              >
                <Link href="/progress" role="menuitem" className="inline-flex items-center justify-center gap-2">
                  学习进度
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:bg-gradient-to-r hover:bg-clip-text hover:text-transparent transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 active:scale-95 rounded-lg px-5 py-2.5 shadow-sm hover:shadow-md"
                asChild
              >
                <Link href="/team" role="menuitem" className="inline-flex items-center justify-center gap-2">
                  团队管理
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:bg-gradient-to-r hover:bg-clip-text hover:text-transparent transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 active:scale-95 rounded-lg px-5 py-2.5 shadow-sm hover:shadow-md"
                asChild
              >
                <Link href="/profile" role="menuitem" className="inline-flex items-center justify-center gap-2">
                  我的资料
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6"
        role="main"
        tabIndex={-1}
      >
        {children}
      </main>

      {/* 品牌页脚 */}
      <BrandFooter />

      {/* 底部导航 - 确保在移动端显示 */}
      <BottomNav />
    </div>
  )
}
