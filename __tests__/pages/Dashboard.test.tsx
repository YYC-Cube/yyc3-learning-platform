/**
 * @fileoverview Dashboard组件测试
 * @description 测试Dashboard页面组件的渲染和交互功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-19
 * @modified 2025-12-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { render, screen } from "@testing-library/react"
import { useRouter, usePathname } from "next/navigation"
import Dashboard from "@/app/page"
import { AIWidgetProvider } from "@/app/providers/AIWidgetContext"

// Mock hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/"),
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe("Dashboard", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })
    localStorageMock.getItem.mockReturnValue('true')
  })

  const renderDashboard = () => {
    return render(
      <AIWidgetProvider>
        <Dashboard />
      </AIWidgetProvider>
    )
  }

  it("正确渲染用户欢迎信息", () => {
    renderDashboard()
    
    // 调试：查看渲染的所有文本内容
    // console.log(screen.debug())
    
    // 检查欢迎信息（包含用户名称）
    expect(screen.getByText(/欢迎回来/)).toBeInTheDocument()
  })

  it("正确显示学习统计数据", () => {
    renderDashboard()
    
    // 检查积分显示
    expect(screen.getByText("2450")).toBeInTheDocument()
    // 检查连续学习天数
    expect(screen.getByText("7天")).toBeInTheDocument()
  })

  it("正确渲染课程卡片", () => {
    renderDashboard()
    
    // 检查课程标题
    expect(screen.getByText("GPT模型基础与应用")).toBeInTheDocument()
    expect(screen.getByText("Prompt Engineering实战")).toBeInTheDocument()
    expect(screen.getByText("AI应用开发框架")).toBeInTheDocument()
    
    // 检查课程描述
    expect(screen.getByText("深入理解大语言模型的原理和实际应用")).toBeInTheDocument()
  })

  it("显示课程学习进度", () => {
    renderDashboard()
    
    // 检查进度条
    const progressBars = screen.getAllByRole("progressbar")
    expect(progressBars).toHaveLength(3)
    
    // 检查进度百分比
    expect(screen.getByText("75%").closest("div")).toBeInTheDocument()
    expect(screen.getByText("45%").closest("div")).toBeInTheDocument()
    expect(screen.getByText("20%").closest("div")).toBeInTheDocument()
  })

  it("正确显示最近学习活动", () => {
    renderDashboard()
    
    // 检查活动列表
    expect(screen.getByText("完成章节")).toBeInTheDocument()
    expect(screen.getByText("GPT-4 API集成实践")).toBeInTheDocument()
    expect(screen.getByText("通过测试")).toBeInTheDocument()
    expect(screen.getByText("Prompt优化技巧测验")).toBeInTheDocument()
  })

  it("响应式布局元素存在", () => {
    renderDashboard()
    
    // 检查响应式布局容器
    const navigationElements = screen.getAllByRole("navigation")
    expect(navigationElements).toHaveLength(2) // 顶部导航和底部导航
    expect(screen.getByRole("main")).toBeInTheDocument()
  })
})
