import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import BrandHeader from "@/components/brand-header"
import { AIWidgetProvider } from "@/app/providers/AIWidgetContext"
import type { MockNextRouter, BrandHeaderProps } from "../types/test-types"

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}))

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}))

const mockPush = vi.fn()
const mockUseRouter = useRouter as unknown as ReturnType<typeof vi.fn>
const mockUseTheme = useTheme as unknown as ReturnType<typeof vi.fn>

describe("BrandHeader", () => {
  beforeEach(() => {
    // Mock useRouter
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    })

    // Mock useTheme
    mockUseTheme.mockReturnValue({
      theme: "light",
      systemTheme: "light",
      setTheme: vi.fn(),
      resolvedTheme: "light",
    })

    mockPush.mockClear()
  })

  const renderBrandHeader = (props: BrandHeaderProps = {}) => {
    return render(
      <AIWidgetProvider>
        <BrandHeader {...props} />
      </AIWidgetProvider>
    )
  }

  it("渲染品牌Logo和标题", () => {
    renderBrandHeader()

    expect(screen.getByAltText("YanYu Smart Cloud³ Logo")).toBeInTheDocument()
    expect(screen.getByText("YanYu Smart Cloud³ Learning Platform")).toBeInTheDocument()
    expect(screen.getByText("言枢象限·语启未来")).toBeInTheDocument()
  })

  it("不同尺寸下正确渲染", () => {
    // 测试默认尺寸
    const { rerender } = renderBrandHeader()
    let logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveClass("w-10", "h-10")

    // 测试小尺寸
    cleanup()
    renderBrandHeader({ size: "sm" })
    logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveClass("w-8", "h-8")

    // 测试大尺寸
    cleanup()
    renderBrandHeader({ size: "lg" })
    logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveClass("w-16", "h-16")
  })

  it("渐变背景正确应用", () => {
    renderBrandHeader()

    const header = screen.getByText("YanYu Smart Cloud³ Learning Platform")
    expect(header).toHaveClass("bg-gradient-to-r", "from-blue-600", "via-indigo-600", "to-purple-600")
  })

  it("响应式文字大小正确", () => {
    renderBrandHeader()

    const mainTitle = screen.getByText("YanYu Smart Cloud³ Learning Platform")
    expect(mainTitle).toHaveClass("text-lg")

    const subtitle = screen.getByText("言枢象限·语启未来")
    expect(subtitle).toHaveClass("text-sm")
  })

  it("国际化文案正确显示", () => {
    renderBrandHeader()

    // 检查中文品牌名称
    expect(screen.getByText("YanYu Smart Cloud³ Learning Platform")).toBeInTheDocument()
    expect(screen.getByText("言枢象限·语启未来")).toBeInTheDocument()
    expect(screen.getByText("YanShu Quadrant · YuQi Future")).toBeInTheDocument()
  })

  it("Logo图片加载失败时有备用方案", () => {
    renderBrandHeader()

    const logo = screen.getByAltText("YanYu Smart Cloud³ Logo")

    // 模拟图片加载失败
    fireEvent.error(logo)

    // 应该仍然显示alt文本
    expect(logo).toHaveAttribute("alt", "YanYu Smart Cloud³ Logo")
  })

  it("showSubtitle属性控制副标题显示", () => {
    const { rerender } = renderBrandHeader({ showSubtitle: false })
    expect(screen.queryByText("言枢象限·语启未来")).not.toBeInTheDocument()
    expect(screen.queryByText("YanShu Quadrant · YuQi Future")).not.toBeInTheDocument()

    cleanup()
    renderBrandHeader({ showSubtitle: true })
    expect(screen.getByText("言枢象限·语启未来")).toBeInTheDocument()
    expect(screen.getByText("YanShu Quadrant · YuQi Future")).toBeInTheDocument()
  })

  it("主题切换时Logo图片正确切换", () => {
    // 测试浅色主题
    renderBrandHeader()
    let logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveAttribute("src", "/yyc3-logo-blue.png")
    cleanup()

    // 测试深色主题
    mockUseTheme.mockReturnValue({
      theme: "dark",
      systemTheme: "light",
      setTheme: vi.fn(),
      resolvedTheme: "dark",
    })
    renderBrandHeader()
    logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveAttribute("src", "/yyc3-white.png")
    cleanup()

    // 测试系统主题（浅色）
    mockUseTheme.mockReturnValue({
      theme: "system",
      systemTheme: "light",
      setTheme: vi.fn(),
      resolvedTheme: "light",
    })
    renderBrandHeader()
    logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveAttribute("src", "/yyc3-logo-blue.png")
    cleanup()

    // 测试系统主题（深色）
    mockUseTheme.mockReturnValue({
      theme: "system",
      systemTheme: "dark",
      setTheme: vi.fn(),
      resolvedTheme: "dark",
    })
    renderBrandHeader()
    logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveAttribute("src", "/yyc3-white.png")
  })
})
