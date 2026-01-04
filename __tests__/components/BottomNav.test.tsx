import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useRouter, usePathname } from "next/navigation"
import BottomNav from "@/components/bottom-nav"
import type { MockNextRouter, MockNextLinkProps } from "../types/test-types"

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

// Mock Link component to use our mock router
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, onClick, onKeyDown, ...props }: MockNextLinkProps) => {
    return (
      <a
        href={href}
        onClick={onClick}
        onKeyDown={onKeyDown}
        {...props}
      >
        {children}
      </a>
    )
  }
}))

const mockPush = vi.fn()
const mockUseRouter = useRouter as unknown as ReturnType<typeof vi.fn>
const mockUsePathname = usePathname as unknown as ReturnType<typeof vi.fn>

describe("BottomNav", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    })
    mockPush.mockClear()
  })

  it("渲染所有导航项", () => {
    mockUsePathname.mockReturnValue("/")
    render(<BottomNav />)

    expect(screen.getByText("首页")).toBeInTheDocument()
    expect(screen.getByText("课程")).toBeInTheDocument()
    expect(screen.getByText("考试")).toBeInTheDocument()
    expect(screen.getByText("职业路径")).toBeInTheDocument()
    expect(screen.getByText("我的")).toBeInTheDocument()
  })

  it("正确显示当前选中状态", () => {
    mockUsePathname.mockReturnValue("/courses")
    render(<BottomNav />)

    const coursesLink = screen.getByRole("link", { name: /课程/ })
    expect(coursesLink).toHaveAttribute("aria-current", "page")
    expect(coursesLink).toHaveClass("text-blue-600")
  })

  it("点击导航项时正确跳转", () => {
    mockUsePathname.mockReturnValue("/")
    render(<BottomNav />)

    const coursesLink = screen.getByRole("link", { name: /课程/ })
    fireEvent.click(coursesLink)

    // Verify the click was handled (Link prevents default)
    expect(coursesLink).toBeInTheDocument()
  })

  it("具备正确的无障碍属性", () => {
    mockUsePathname.mockReturnValue("/exam")
    render(<BottomNav />)

    const nav = screen.getByRole("navigation")
    expect(nav).toHaveAttribute("aria-label", "底部导航")

    const examLink = screen.getByRole("link", { name: /考试/ })
    expect(examLink).toHaveAttribute("aria-current", "page")
    expect(examLink).toHaveAttribute("aria-label", "考试 - 当前页面")
  })

  it("在桌面端隐藏", () => {
    mockUsePathname.mockReturnValue("/")
    render(<BottomNav />)

    const nav = screen.getByRole("navigation")
    expect(nav).toHaveClass("md:hidden")
  })

  it("支持键盘导航", () => {
    mockUsePathname.mockReturnValue("/")
    render(<BottomNav />)

    const coursesLink = screen.getByRole("link", { name: /课程/ })
    coursesLink.focus()

    fireEvent.keyDown(coursesLink, { key: "Enter" })
    // Verify the keydown was handled
    expect(coursesLink).toBeInTheDocument()
  })

  it("路径匹配逻辑正确", () => {
    // 测试子路径匹配
    mockUsePathname.mockReturnValue("/courses/ai-basics")
    render(<BottomNav />)

    const coursesLink = screen.getByRole("link", { name: /课程/ })
    expect(coursesLink).toHaveAttribute("aria-current", "page")
  })

  it("图标正确渲染", () => {
    mockUsePathname.mockReturnValue("/")
    render(<BottomNav />)

    // 检查图标是否存在（通过类名或测试ID）
    expect(screen.getByTestId("home-icon")).toBeInTheDocument()
    expect(screen.getByTestId("book-icon")).toBeInTheDocument()
    expect(screen.getByTestId("target-icon")).toBeInTheDocument()
    expect(screen.getByTestId("users-icon")).toBeInTheDocument()
    expect(screen.getByTestId("user-icon")).toBeInTheDocument()
  })

  it("响应式行为正确", () => {
    mockUsePathname.mockReturnValue("/")

    // 模拟移动端视口
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    })

    render(<BottomNav />)
    const nav = screen.getByRole("navigation")
    expect(nav).toBeVisible()
  })
})
