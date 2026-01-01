"use client"

import { useState, useRef, type ReactNode, type TouchEvent } from "react"
import { cn } from "@/lib/utils"

interface SwipeContainerProps {
  children: ReactNode
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export function SwipeContainer({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
}: SwipeContainerProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [swiping, setSwiping] = useState(false)
  const [offset, setOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // 最小滑动距离
  const minSwipeDistance = threshold

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setSwiping(true)
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!touchStart) return

    const currentTouch = e.targetTouches[0].clientX
    setTouchEnd(currentTouch)

    // 计算滑动偏移量，但限制最大值
    const diff = currentTouch - touchStart
    const maxOffset = 80 // 最大偏移量
    const calculatedOffset = Math.sign(diff) * Math.min(Math.abs(diff) / 3, maxOffset)
    setOffset(calculatedOffset)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    setSwiping(false)
    setOffset(0)

    const distance = touchEnd - touchStart
    const isLeftSwipe = distance < -minSwipeDistance
    const isRightSwipe = distance > minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    } else if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  return (
    <div
      ref={containerRef}
      className={cn("touch-pan-y", className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        transform: swiping ? `translateX(${offset}px)` : "translateX(0)",
        transition: swiping ? "none" : "transform 0.3s ease",
      }}
    >
      {children}
    </div>
  )
}
