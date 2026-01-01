/**
 * LinkButton - 一个将 Link 和 Button 组合的辅助组件
 * 解决 asChild 时多个子元素的问题
 */

import * as React from "react"
import Link from "next/link"
import { Button, ButtonProps } from "./button"
import { cn } from "@/lib/utils"

interface LinkButtonProps extends Omit<ButtonProps, 'asChild'> {
  href: string
  children: React.ReactNode
}

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, children, className, ...props }, ref) => {
    return (
      <Link 
        href={href} 
        ref={ref}
        className={cn(
          // 应用 button 的样式
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
      >
        <Button asChild {...props}>
          <span className="inline-flex items-center justify-center gap-2 w-full">
            {children}
          </span>
        </Button>
      </Link>
    )
  }
)

LinkButton.displayName = "LinkButton"
