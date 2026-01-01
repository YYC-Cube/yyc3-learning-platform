/**
 * @fileoverview 移动端导航组件
 * @description 提供移动端的侧边导航菜单，包含用户信息和主要功能路由
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-01-30
 * @modified 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, BookOpen, Brain, Users, TrendingUp, Home, LogOut, Target, GraduationCap } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FocusTrap } from "./accessibility/focus-trap"
import { BrandHeader } from "./brand-header"

interface MobileNavProps {
  user: {
    name: string
    avatar: string
    level: string
  }
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    { href: "/", label: "首页", icon: Home, description: "返回首页查看学习概览" },
    { href: "/courses", label: "课程中心", icon: BookOpen, description: "浏览和学习AI课程" },
    { href: "/exam", label: "练习测试", icon: Brain, description: "参加练习和测试" },
    { href: "/career-path", label: "职业发展路径", icon: TrendingUp, description: "查看AI工程师职业发展路径" },
    { href: "/professional-exam", label: "专业考试", icon: GraduationCap, description: "参加专业认证考试" },
    { href: "/progress", label: "学习进度", icon: Target, description: "查看学习进度和统计" },
    { href: "/team", label: "团队管理", icon: Users, description: "团队协作和管理" },
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden focus:ring-2 focus:ring-blue-500"
          aria-label="打开导航菜单"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[80%] max-w-[300px] sm:max-w-sm"
        id="mobile-navigation"
        aria-label="主导航菜单"
      >
        <FocusTrap active={open}>
          <SheetHeader className="border-b pb-4 mb-4">
            <SheetTitle className="flex items-center justify-between">
              <BrandHeader showSubtitle={false} size="sm" />
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="关闭导航菜单">
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <Avatar className="h-12 w-12 border-2 border-blue-200">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.name}的头像`} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.level}</p>
              </div>
            </div>

            <nav className="space-y-1" role="navigation" aria-label="主导航">
              {routes.map((route) => {
                const IconComponent = route.icon
                const active = isActive(route.href)

                return (
                  <Button
                    key={route.href}
                    variant={active ? "default" : "ghost"}
                    className={`w-full justify-start focus:ring-2 focus:ring-blue-500 ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                        : "hover:bg-blue-50"
                    }`}
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link href={route.href} aria-label={route.description} aria-current={active ? "page" : undefined} className="inline-flex items-center justify-start w-full">
                      <IconComponent className="mr-3 h-5 w-5" aria-hidden="true" />
                      {route.label}
                    </Link>
                  </Button>
                )
              })}
            </nav>

            <div className="mt-auto pt-4 border-t">
              <Button
                variant="outline"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-500"
                aria-label="退出登录"
              >
                <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
                退出登录
              </Button>
            </div>
          </div>
        </FocusTrap>
      </SheetContent>
    </Sheet>
  )
}
