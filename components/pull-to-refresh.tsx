"use client"

import type React from "react"

import { useState, useEffect, type ReactNode } from "react"
import { Loader2 } from "lucide-react"

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)
  const [pullDistance, setPullDistance] = useState(0)
  const threshold = 80 // 触发刷新的阈值

  const handleTouchStart = (e: React.TouchEvent) => {
    // 只有当滚动到顶部时才启用下拉刷新
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || refreshing) return

    const currentY = e.touches[0].clientY
    const distance = currentY - startY

    // 只处理下拉操作
    if (distance > 0 && window.scrollY === 0) {
      // 添加阻尼效果，使下拉感觉更自然
      const dampedDistance = Math.min(distance * 0.4, threshold * 1.5)
      setPullDistance(dampedDistance)

      // 防止页面滚动
      e.preventDefault()
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
      }
    }

    setStartY(0)
    setPullDistance(0)
  }

  useEffect(() => {
    // 清理函数
    return () => {
      setStartY(0)
      setPullDistance(0)
      setRefreshing(false)
    }
  }, [])

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="w-full">
      <div
        className="flex items-center justify-center transition-all duration-300"
        style={{
          height: pullDistance || (refreshing ? threshold : 0),
          opacity: pullDistance / threshold || (refreshing ? 1 : 0),
        }}
      >
        {refreshing ? (
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        ) : (
          <div className="text-sm text-gray-500">{pullDistance >= threshold ? "释放刷新" : "下拉刷新"}</div>
        )}
      </div>
      {children}
    </div>
  )
}
