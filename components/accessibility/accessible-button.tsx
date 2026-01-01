/**
 * @file Accessible Button Component
 * @description An accessible button component with enhanced features like loading states and descriptions
 * @module accessibility/accessible-button
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

"use client"

import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AccessibleButtonProps extends Omit<ButtonProps, 'children'> {
  loading?: boolean
  loadingText?: string
  description?: string
  children: React.ReactNode
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    className,
    children,
    loading = false,
    loadingText = "加载中...",
    description,
    disabled = false,
    asChild = false,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    // Handle asChild case separately to avoid React.Children.only errors
    if (asChild) {
      return (
        <Button
          ref={ref}
          asChild
          className={cn(
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "transition-all duration-200",
            className
          )}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          {...props}
        >
          {children}
        </Button>
      )
    }

    // Normal button case with additional features
    const buttonId = props.id
    const descriptionId = buttonId ? `${buttonId}-description` : undefined

    return (
      <Button
        ref={ref}
        className={cn(
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "transition-all duration-200",
          className
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-describedby={description ? descriptionId : undefined}
        {...props}
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2" aria-hidden="true">
              ⟳
            </span>
            {loadingText}
          </>
        ) : (
          children
        )}
        {description && descriptionId && (
          <span id={descriptionId} className="sr-only">
            {description}
          </span>
        )}
      </Button>
    )
  }
)

AccessibleButton.displayName = "AccessibleButton"

export { AccessibleButton }