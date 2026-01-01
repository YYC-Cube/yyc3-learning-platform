"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ColoredProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  color?: string
  size?: "sm" | "md" | "lg"
  showPercentage?: boolean
  variant?: "default" | "success" | "warning" | "info" | "purple" | "pink"
}

const ColoredProgress = React.forwardRef<HTMLDivElement, ColoredProgressProps>(
  ({ className, value, max = 100, color, size = "md", showPercentage = false, variant = "default", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const sizeClasses = {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-4",
    }

    // 彩色主题变体
    const getVariantColor = (variant: string) => {
      switch (variant) {
        case "success":
          return "linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)"
        case "warning":
          return "linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)"
        case "info":
          return "linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)"
        case "purple":
          return "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)"
        case "pink":
          return "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)"
        default:
          return "linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)"
      }
    }

    // 使用自定义颜色或变体颜色，绝不使用黑色
    const progressColor = color || getVariantColor(variant)

    return (
      <div className="w-full">
        <div
          ref={ref}
          className={cn("relative w-full overflow-hidden rounded-full bg-gray-200/80", sizeClasses[size], className)}
          {...props}
        >
          <div
            className={cn("h-full transition-all duration-700 ease-out rounded-full shadow-sm")}
            style={{
              width: `${percentage}%`,
              background: progressColor,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
          {/* 添加光泽效果 */}
          <div
            className="absolute top-0 left-0 h-full rounded-full opacity-30"
            style={{
              width: `${percentage}%`,
              background: "linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
            }}
          />
        </div>
        {showPercentage && (
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span className="font-medium">{Math.round(percentage)}%</span>
            <span>
              {value}/{max}
            </span>
          </div>
        )}
      </div>
    )
  },
)
ColoredProgress.displayName = "ColoredProgress"

export { ColoredProgress }
