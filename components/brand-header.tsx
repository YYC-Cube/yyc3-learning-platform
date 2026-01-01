/**
 * @fileoverview 品牌头部组件
 * @description 显示应用的品牌Logo和名称，支持深色/浅色主题切换
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-01-30
 * @modified 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useAIWidget } from "@/app/providers/AIWidgetContext"

interface BrandHeaderProps {
  showSubtitle?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

function BrandHeader({ showSubtitle = true, size = "md", className = "" }: BrandHeaderProps) {
  const { theme, systemTheme } = useTheme()
  const { toggleWidget, showWidget } = useAIWidget()
  const [mounted, setMounted] = useState(false)

  // 等待组件挂载，避免水合不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  const logoSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  }

  const titleSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  }

  const subtitleSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  // 确定当前主题
  const currentTheme = theme === "system" ? systemTheme : theme
  // 根据主题选择 logo：深色主题用白色 logo，浅色主题用蓝色 logo
  const logoSrc = mounted && currentTheme === "dark" ? "/yyc3-white.png" : "/yyc3-logo-blue.png"

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleWidget}
          className={`relative flex items-center space-x-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${showWidget ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''}`}
          aria-label={showWidget ? "关闭AI助手" : "打开AI助手"}
          title={showWidget ? "关闭AI助手" : "打开AI助手"}
        >
          <div className="relative">
            <Image
              src={logoSrc}
              alt="YanYu Smart Cloud³ Logo"
              width={size === "lg" ? 64 : size === "md" ? 40 : 32}
              height={size === "lg" ? 64 : size === "md" ? 40 : 32}
              className={`${logoSizes[size]} object-contain`}
              priority={true}
            />
          </div>
          <div className="flex flex-col">
            {/* 单行显示应用名称，调整字体大小 */}
            <h1
              className={`font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap ${titleSizes[size]}`}
            >
              YanYu Smart Cloud³ Learning Platform
            </h1>
          </div>
        </button>
      </div>

      {showSubtitle && (
        <div className="text-center space-y-1">
          <p className={`text-gray-700 font-medium ${subtitleSizes[size]}`}>言枢象限·语启未来</p>
          <p className={`text-gray-500 italic ${subtitleSizes[size]}`}>YanShu Quadrant · YuQi Future</p>
        </div>
      )}
    </div>
  )
}

export default BrandHeader
export { BrandHeader }
