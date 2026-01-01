"use client"

import { ColoredProgress } from "../colored-progress"
import { ScreenReaderOnly } from "./screen-reader-only"

interface AccessibleProgressProps {
  value: number
  max?: number
  label: string
  description?: string
  color?: string
  size?: "sm" | "md" | "lg"
  showPercentage?: boolean
}

export function AccessibleProgress({
  value,
  max = 100,
  label,
  description,
  color,
  size = "md",
  showPercentage = true,
}: AccessibleProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {showPercentage && (
          <span className="text-sm text-gray-600" aria-label={`进度 ${Math.round(percentage)}%`}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>

      <ColoredProgress
        value={value}
        max={max}
        color={color}
        size={size}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        aria-describedby={description ? `${label}-description` : undefined}
      />

      {description && <ScreenReaderOnly id={`${label}-description`}>{description}</ScreenReaderOnly>}
    </div>
  )
}
