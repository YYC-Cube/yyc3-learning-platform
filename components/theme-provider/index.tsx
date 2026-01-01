"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// 主题切换Hook
export function useTheme() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme, resolvedTheme, systemTheme } = React.useContext(require("next-themes").ThemeContext)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return {
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
    mounted,
  }
}

// 主题切换组件
export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme()

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center">
        <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
      aria-label={`切换到${theme === "dark" ? "浅色" : "深色"}模式`}
    >
      {theme === "dark" ? (
        <svg
          className="w-4 h-4 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 text-gray-700"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  )
}

// 品牌主题配置
export const brandTheme = {
  light: {
    primary: "hsl(221, 83%, 53%)", // #2563eb
    secondary: "hsl(224, 76%, 48%)", // #1e40af
    accent: "hsl(217, 91%, 60%)", // #3b82f6
    background: "hsl(0, 0%, 100%)", // #ffffff
    foreground: "hsl(222, 84%, 5%)", // #0f172a
    muted: "hsl(210, 40%, 98%)", // #f8fafc
    border: "hsl(214, 32%, 91%)", // #e2e8f0
    gradient: {
      brand: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      header: "linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1d4ed8 100%)",
      learning: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      success: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
  },
  dark: {
    primary: "hsl(217, 91%, 60%)", // #3b82f6
    secondary: "hsl(221, 83%, 53%)", // #2563eb
    accent: "hsl(224, 76%, 48%)", // #1e40af
    background: "hsl(222, 84%, 5%)", // #0f172a
    foreground: "hsl(210, 40%, 98%)", // #f8fafc
    muted: "hsl(215, 28%, 17%)", // #1e293b
    border: "hsl(215, 28%, 17%)", // #1e293b
    gradient: {
      brand: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      header: "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)",
      learning: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      success: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
  },
}

// 主题应用Hook
export function useBrandTheme() {
  const { resolvedTheme } = useTheme()
  const currentTheme = brandTheme[resolvedTheme as keyof typeof brandTheme] || brandTheme.light

  const applyGradient = (gradientName: keyof typeof currentTheme.gradient) => {
    return {
      background: currentTheme.gradient[gradientName],
    }
  }

  const getThemeColor = (colorName: keyof Omit<typeof currentTheme, "gradient">) => {
    return currentTheme[colorName]
  }

  return {
    theme: currentTheme,
    applyGradient,
    getThemeColor,
    isDark: resolvedTheme === "dark",
  }
}

// 主题持久化配置
export const themeConfig = {
  attribute: "class",
  defaultTheme: "system",
  enableSystem: true,
  disableTransitionOnChange: false,
  storageKey: "yanyu-theme",
  themes: ["light", "dark", "system"],
}

// CSS变量注入组件
export function ThemeVariables() {
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = brandTheme[resolvedTheme as keyof typeof brandTheme] || brandTheme.light

  React.useEffect(() => {
    const root = document.documentElement

    // 注入CSS变量
    Object.entries(currentTheme).forEach(([key, value]) => {
      if (key !== "gradient") {
        root.style.setProperty(`--theme-${key}`, value)
      }
    })

    // 注入渐变变量
    Object.entries(currentTheme.gradient).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value)
    })
  }, [currentTheme])

  return null
}

// 主题感知组件包装器
export function ThemeAware({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeVariables />
      {children}
    </>
  )
}
