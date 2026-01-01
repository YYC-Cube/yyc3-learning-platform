import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// 模拟课程数据库
const coursesDatabase = [
  {
    id: "prompt-engineering",
    title: "提示词工程基础",
    description: "学习如何编写高效的AI提示词，掌握与AI模型交互的核心技巧",
    category: "ai-basics",
    difficulty: "beginner",
    duration: "4小时",
    chapters: 12,
    rating: 4.8,
    studentsCount: 2847,
    price: 299,
    tags: ["提示词", "ChatGPT", "AI交互"],
    instructor: "张教授",
    image: "/images/prompt-engineering-course.png",
    progress: 0,
    isEnrolled: false,
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-20T10:30:00Z",
  },
  {
    id: "multimodal-ai",
    title: "多模态AI应用开发",
    description: "深入了解图像、文本、音频等多模态AI技术的实际应用",
    category: "ai-development",
    difficulty: "intermediate",
    duration: "6小时",
    chapters: 18,
    rating: 4.9,
    studentsCount: 1523,
    price: 499,
    tags: ["多模态", "计算机视觉", "自然语言处理"],
    instructor: "李博士",
    image: "/images/multimodal-ai-course.png",
    progress: 0,
    isEnrolled: false,
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
  },
  {
    id: "ai-ethics",
    title: "AI伦理与安全",
    description: "探讨人工智能的伦理问题，学习负责任的AI开发实践",
    category: "ai-ethics",
    difficulty: "intermediate",
    duration: "3小时",
    chapters: 10,
    rating: 4.7,
    studentsCount: 892,
    price: 199,
    tags: ["AI伦理", "安全", "负责任AI"],
    instructor: "王教授",
    image: "/images/ai-ethics-course.png",
    progress: 0,
    isEnrolled: false,
    createdAt: "2024-01-12T11:00:00Z",
    updatedAt: "2024-01-19T16:45:00Z",
  },
  {
    id: "gpt-basics",
    title: "GPT模型原理与应用",
    description: "从零开始理解GPT模型的工作原理，学习实际应用场景",
    category: "ai-basics",
    difficulty: "beginner",
    duration: "5小时",
    chapters: 15,
    rating: 4.6,
    studentsCount: 3241,
    price: 399,
    tags: ["GPT", "语言模型", "深度学习"],
    instructor: "陈博士",
    image: "/images/gpt-basics-course.png",
    progress: 0,
    isEnrolled: false,
    createdAt: "2024-01-08T07:30:00Z",
    updatedAt: "2024-01-17T12:15:00Z",
  },
  {
    id: "ai-development",
    title: "AI应用开发实战",
    description: "通过实际项目学习AI应用开发，掌握从概念到部署的完整流程",
    category: "ai-development",
    difficulty: "advanced",
    duration: "8小时",
    chapters: 24,
    rating: 4.9,
    studentsCount: 1876,
    price: 699,
    tags: ["应用开发", "项目实战", "部署"],
    instructor: "刘工程师",
    image: "/images/ai-development-course.png",
    progress: 0,
    isEnrolled: false,
    createdAt: "2024-01-05T13:00:00Z",
    updatedAt: "2024-01-16T09:30:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let filteredCourses = [...coursesDatabase]

    // 按分类筛选
    if (category && category !== "all") {
      filteredCourses = filteredCourses.filter((course) => course.category === category)
    }

    // 按难度筛选
    if (difficulty && difficulty !== "all") {
      filteredCourses = filteredCourses.filter((course) => course.difficulty === difficulty)
    }

    // 搜索功能
    if (search) {
      const searchLower = search.toLowerCase()
      filteredCourses = filteredCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower) ||
          course.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // 分页
    const total = filteredCourses.length
    const paginatedCourses = filteredCourses.slice(offset, offset + limit)

    // 模拟API延迟
    await new Promise((resolve) => setTimeout(resolve, 100))

    return NextResponse.json({
      success: true,
      data: {
        courses: paginatedCourses,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      message: "课程列表获取成功",
    })
  } catch (error) {
    logger.error("获取课程列表失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: "服务器内部错误",
        message: "获取课程列表失败，请稍后重试",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证必填字段
    const requiredFields = ["title", "description", "category", "difficulty", "duration", "price"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `缺少必填字段: ${field}`,
            message: "请填写所有必填信息",
          },
          { status: 400 },
        )
      }
    }

    // 生成新课程ID
    const newCourseId = body.title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    // 创建新课程
    const newCourse = {
      id: newCourseId,
      title: body.title,
      description: body.description,
      category: body.category,
      difficulty: body.difficulty,
      duration: body.duration,
      chapters: body.chapters || 10,
      rating: 0,
      studentsCount: 0,
      price: body.price,
      tags: body.tags || [],
      instructor: body.instructor || "系统管理员",
      image: body.image || "/images/default-course.png",
      progress: 0,
      isEnrolled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 添加到数据库（模拟）
    coursesDatabase.push(newCourse)

    return NextResponse.json(
      {
        success: true,
        data: newCourse,
        message: "课程创建成功",
      },
      { status: 201 },
    )
  } catch (error) {
    logger.error("创建课程失败", error)
    return NextResponse.json(
      {
        success: false,
        error: "服务器内部错误",
        message: "创建课程失败，请稍后重试",
      },
      { status: 500 },
    )
  }
}
