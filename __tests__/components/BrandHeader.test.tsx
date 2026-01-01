import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import BrandHeader from "@/components/brand-header"

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
}))

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock Next.js Image component
jest.mock("next/image", () => {
  return function MockImage({ src, alt, priority, ...props }: any) {
    return <img src={src || "/placeholder.svg"} alt={alt} priority={priority ? "true" : undefined} {...props} />
  }
})

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

describe("BrandHeader", () => {
  beforeEach(() => {
    // Mock useRouter
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })
    
    // Mock useTheme
    mockUseTheme.mockReturnValue({
      theme: "light",
      systemTheme: "light",
      setTheme: jest.fn(),
      resolvedTheme: "light",
    })
    
    mockPush.mockClear()
  })

  it("渲染品牌Logo和标题", () => {
    render(<BrandHeader />)

    expect(screen.getByAltText("YanYu Smart Cloud³ Logo")).toBeInTheDocument()
    expect(screen.getByText("YanYu Smart Cloud³ Learning Platform")).toBeInTheDocument()
    expect(screen.getByText("言枢象限·语启未来")).toBeInTheDocument()
  })

  it("不同尺寸下正确渲染", () => {
    // 测试默认尺寸
    const { rerender } = render(<BrandHeader />)
    let logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveClass("w-10", "h-10")

    // 测试小尺寸
    rerender(<BrandHeader size="sm" />)
    logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveClass("w-8", "h-8")

    // 测试大尺寸
    rerender(<BrandHeader size="lg" />)
    logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveClass("w-16", "h-16")
  })

  it("渐变背景正确应用", () => {
    render(<BrandHeader />)

    const header = screen.getByText("YanYu Smart Cloud³ Learning Platform")
    expect(header).toHaveClass("bg-gradient-to-r", "from-blue-600", "via-indigo-600", "to-purple-600")
  })

  it("响应式文字大小正确", () => {
    render(<BrandHeader />)

    const mainTitle = screen.getByText("YanYu Smart Cloud³ Learning Platform")
    expect(mainTitle).toHaveClass("text-lg")

    const subtitle = screen.getByText("言枢象限·语启未来")
    expect(subtitle).toHaveClass("text-sm")
  })

  it("国际化文案正确显示", () => {
    render(<BrandHeader />)

    // 检查中文品牌名称
    expect(screen.getByText("YanYu Smart Cloud³ Learning Platform")).toBeInTheDocument()
    expect(screen.getByText("言枢象限·语启未来")).toBeInTheDocument()
    expect(screen.getByText("YanShu Quadrant · YuQi Future")).toBeInTheDocument()
  })

  it("Logo图片加载失败时有备用方案", () => {
    render(<BrandHeader />)

    const logo = screen.getByAltText("YanYu Smart Cloud³ Logo")

    // 模拟图片加载失败
    fireEvent.error(logo)

    // 应该仍然显示alt文本
    expect(logo).toHaveAttribute("alt", "YanYu Smart Cloud³ Logo")
  })

  it("showSubtitle属性控制副标题显示", () => {
    const { rerender } = render(<BrandHeader showSubtitle={false} />)
    expect(screen.queryByText("言枢象限·语启未来")).not.toBeInTheDocument()
    expect(screen.queryByText("YanShu Quadrant · YuQi Future")).not.toBeInTheDocument()

    rerender(<BrandHeader showSubtitle={true} />)
    expect(screen.getByText("言枢象限·语启未来")).toBeInTheDocument()
    expect(screen.getByText("YanShu Quadrant · YuQi Future")).toBeInTheDocument()
  })

  it("主题切换时Logo图片正确切换", () => {
    // 测试浅色主题
    render(<BrandHeader />)
    let logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveAttribute("src", "/yyc3-logo-blue.png")
    cleanup()

    // 测试深色主题
    mockUseTheme.mockReturnValue({
      theme: "dark",
      systemTheme: "light",
      setTheme: jest.fn(),
      resolvedTheme: "dark",
    })
    render(<BrandHeader />)
    logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveAttribute("src", "/yyc3-white.png")
    cleanup()

    // 测试系统主题（浅色）
    mockUseTheme.mockReturnValue({
      theme: "system",
      systemTheme: "light",
      setTheme: jest.fn(),
      resolvedTheme: "light",
    })
    render(<BrandHeader />)
    logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveAttribute("src", "/yyc3-logo-blue.png")
    cleanup()

    // 测试系统主题（深色）
    mockUseTheme.mockReturnValue({
      theme: "system",
      systemTheme: "dark",
      setTheme: jest.fn(),
      resolvedTheme: "dark",
    })
    render(<BrandHeader />)
    logo = screen.getByAltText("YanYu Smart Cloud³ Logo")
    expect(logo).toHaveAttribute("src", "/yyc3-white.png")
    cleanup()
  })
})
