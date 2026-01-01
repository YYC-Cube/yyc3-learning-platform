import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// 模拟用户数据库
const usersDatabase = {
  "user-001": {
    id: "user-001",
    name: "张同学",
    email: "zhang@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    level: "AI学习者",
    points: 2450,
    streak: 7,
    joinDate: "2024-01-01T00:00:00Z",
    lastLoginDate: "2024-01-20T10:30:00Z",
    profile: {
      bio: "热爱AI技术的学习者，希望通过学习改变世界",
      location: "北京",
      website: "https://example.com",
      github: "zhangstudent",
      linkedin: "zhang-student",
    },
    learningStats: {
      totalCourses: 12,
      completedCourses: 8,
      totalHours: 156,
      currentStreak: 7,
      longestStreak: 15,
      averageScore: 87.5,
    },
    enrolledCourses: [
      {
        courseId: "prompt-engineering",
        enrolledAt: "2024-01-15T08:00:00Z",
        progress: 75,
        lastAccessedAt: "2024-01-20T09:15:00Z",
        completedChapters: 9,
        totalChapters: 12,
        timeSpent: 180, // 分钟
      },
      {
        courseId: "gpt-basics",
        enrolledAt: "2024-01-10T10:00:00Z",
        progress: 100,
        lastAccessedAt: "2024-01-18T14:30:00Z",
        completedChapters: 15,
        totalChapters: 15,
        timeSpent: 300,
      },
    ],
    certificates: [
      {
        id: "cert-001",
        courseId: "gpt-basics",
        courseName: "GPT模型原理与应用",
        issuedAt: "2024-01-18T15:00:00Z",
        certificateUrl: "/certificates/cert-001.pdf",
        score: 92,
      },
    ],
    achievements: [
      {
        id: "first-course",
        name: "初学者",
        description: "完成第一门课程",
        unlockedAt: "2024-01-18T15:00:00Z",
        icon: "🎓",
      },
      {
        id: "week-streak",
        name: "坚持一周",
        description: "连续学习7天",
        unlockedAt: "2024-01-20T10:30:00Z",
        icon: "🔥",
      },
    ],
    preferences: {
      language: "zh-CN",
      timezone: "Asia/Shanghai",
      emailNotifications: true,
      pushNotifications: true,
      weeklyReport: true,
      theme: "system",
      learningReminder: {
        enabled: true,
        time: "19:00",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      },
    },
  },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "user-001"

    const user = usersDatabase[userId as keyof typeof usersDatabase]

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "用户不存在",
          message: "未找到指定用户信息",
        },
        { status: 404 },
      )
    }

    // 计算学习统计
    const now = new Date()
    const joinDate = new Date(user.joinDate)
    const daysSinceJoin = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))

    const enhancedUser = {
      ...user,
      learningStats: {
        ...user.learningStats,
        daysSinceJoin,
        completionRate: Math.round((user.learningStats.completedCourses / user.learningStats.totalCourses) * 100),
      },
    }

    return NextResponse.json({
      success: true,
      data: enhancedUser,
      message: "用户信息获取成功",
    })
  } catch (error) {
    logger.error("获取用户信息失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: "服务器内部错误",
        message: "获取用户信息失败，请稍后重试",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId || "user-001"

    const user = usersDatabase[userId as keyof typeof usersDatabase]

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "用户不存在",
          message: "未找到指定用户信息",
        },
        { status: 404 },
      )
    }

    // 更新用户信息
    if (body.profile) {
      user.profile = { ...user.profile, ...body.profile }
    }

    if (body.preferences) {
      user.preferences = { ...user.preferences, ...body.preferences }
    }

    if (body.name) user.name = body.name
    if (body.avatar) user.avatar = body.avatar

    return NextResponse.json({
      success: true,
      data: user,
      message: "用户信息更新成功",
    })
  } catch (error) {
    logger.error("更新用户信息失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: "服务器内部错误",
        message: "更新用户信息失败，请稍后重试",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId = "user-001", data } = body

    const user = usersDatabase[userId as keyof typeof usersDatabase]

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "用户不存在",
          message: "未找到指定用户信息",
        },
        { status: 404 },
      )
    }

    switch (action) {
      case "updateProgress":
        // 更新学习进度
        const { courseId, progress, chapterCompleted } = data
        const courseIndex = user.enrolledCourses.findIndex((c) => c.courseId === courseId)

        if (courseIndex !== -1) {
          user.enrolledCourses[courseIndex].progress = progress
          user.enrolledCourses[courseIndex].lastAccessedAt = new Date().toISOString()

          if (chapterCompleted) {
            user.enrolledCourses[courseIndex].completedChapters += 1
            user.points += 50 // 完成章节奖励50积分
          }

          // 如果课程完成，增加积分和证书
          if (progress === 100) {
            user.points += 200 // 完成课程奖励200积分
            user.learningStats.completedCourses += 1

            // 生成证书
            const newCertificate = {
              id: `cert-${Date.now()}`,
              courseId,
              courseName: `课程-${courseId}`,
              issuedAt: new Date().toISOString(),
              certificateUrl: `/certificates/cert-${Date.now()}.pdf`,
              score: 95,
            }
            user.certificates.push(newCertificate)
          }
        }
        break

      case "updateStreak":
        // 更新连续学习天数
        const today = new Date().toDateString()
        const lastLogin = new Date(user.lastLoginDate).toDateString()

        if (today !== lastLogin) {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)

          if (lastLogin === yesterday.toDateString()) {
            user.streak += 1
            user.points += 10 // 连续学习奖励10积分
          } else {
            user.streak = 1
          }

          user.lastLoginDate = new Date().toISOString()
        }
        break

      case "enrollCourse":
        // 报名课程
        const { courseId: newCourseId } = data
        const isAlreadyEnrolled = user.enrolledCourses.some((c) => c.courseId === newCourseId)

        if (!isAlreadyEnrolled) {
          user.enrolledCourses.push({
            courseId: newCourseId,
            enrolledAt: new Date().toISOString(),
            progress: 0,
            lastAccessedAt: new Date().toISOString(),
            completedChapters: 0,
            totalChapters: 10,
            timeSpent: 0,
          })
          user.learningStats.totalCourses += 1
        }
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: "无效的操作类型",
            message: "不支持的操作类型",
          },
          { status: 400 },
        )
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: "操作执行成功",
    })
  } catch (error) {
    logger.error("执行用户操作失败", error)
    return NextResponse.json(
      {
        success: false,
        error: "服务器内部错误",
        message: "操作执行失败，请稍后重试",
      },
      { status: 500 },
    )
  }
}
