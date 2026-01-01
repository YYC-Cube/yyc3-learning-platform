"use client"

import type React from "react"
import { useState, useEffect, useCallback, createContext } from "react"
import type { User, ApiResponse, CourseProgress } from "@/app/types"
import { logger } from "@/lib/logger"

interface UserContextType {
  user: User | null
  loading: boolean
  error: string | null
  updateUser: (data: Partial<User>) => Promise<boolean>
  updateProgress: (courseId: string, progress: number) => Promise<boolean>
  updateStreak: () => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取用户信息
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/user")
      const result: ApiResponse<User> = await response.json()

      if (result.success && result.data) {
        setUser(result.data)
      } else {
        throw new Error(result.error || "获取用户信息失败")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "网络错误"
      setError(errorMessage)
      logger.error("获取用户信息失败:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // 更新用户信息
  const updateUser = useCallback(async (data: Partial<User>): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<User> = await response.json()

      if (result.success && result.data) {
        setUser(result.data)
        return true
      } else {
        throw new Error(result.error || "更新用户信息失败")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新失败"
      setError(errorMessage)
      logger.error("更新用户信息失败:", err)
      return false
    }
  }, [])

  // 更新学习进度
  const updateProgress = useCallback(async (courseId: string, progress: number): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateProgress",
          courseId,
          progress,
        }),
      })

      const result: ApiResponse<User> = await response.json()

      if (result.success && result.data) {
        setUser(result.data)
        return true
      } else {
        throw new Error(result.error || "更新学习进度失败")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新失败"
      setError(errorMessage)
      logger.error("更新学习进度失败", err)
      return false
    }
  }, [])

  // 更新学习连续天数
  const updateStreak = useCallback(async (): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateStreak",
        }),
      })

      const result: ApiResponse<User> = await response.json()

      if (result.success && result.data) {
        setUser(result.data)
        return true
      } else {
        throw new Error(result.error || "更新学习连续天数失败")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新失败"
      setError(errorMessage)
      logger.error("更新学习连续天数失败:", err)
      return false
    }
  }, [])

  // 登出
  const logout = useCallback(() => {
    setUser(null)
    setError(null)
    // 清除本地存储
    localStorage.removeItem("user-token")
    localStorage.removeItem("user-preferences")
  }, [])

  // 刷新用户信息
  const refreshUser = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  // 初始化时获取用户信息
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // 自动保存用户偏好设置
  useEffect(() => {
    if (user?.preferences) {
      localStorage.setItem("user-preferences", JSON.stringify(user.preferences))
    }
  }, [user?.preferences])

  const value: UserContextType = {
    user,
    loading,
    error,
    updateUser,
    updateProgress,
    updateStreak,
    logout,
    refreshUser,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// 使用用户信息的Hook
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 模拟获取用户数据
    const fetchUser = async () => {
      try {
        setLoading(true)
        // 模拟API调用延迟
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const userData: User = {
          id: "1",
          name: "张同学",
          email: "zhang@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
          studyPoints: 2450,
          studyDays: 77,
          completedCourses: 12,
          studyHours: 156,
        }

        setUser(userData)
      } catch (err) {
        setError("获取用户信息失败")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  return { user, loading, error, updateUser }
}

// 用户认证状态Hook
export function useAuth() {
  const { user, loading, error, logout } = useUser()

  const isAuthenticated = !!user
  const isLoading = loading
  const authError = error

  return {
    user,
    isAuthenticated,
    isLoading,
    authError,
    logout,
  }
}

// 用户权限Hook
export function usePermissions() {
  const { user } = useUser()

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false

      // 基于用户等级的权限判断
      const userLevel = user.level
      const permissions: Record<string, string[]> = {
        初级学习者: ["view_courses", "take_exams"],
        中级学习者: ["view_courses", "take_exams", "join_groups", "post_comments"],
        高级学习者: [
          "view_courses",
          "take_exams",
          "join_groups",
          "post_comments",
          "create_groups",
          "access_advanced_features",
        ],
        管理员: ["*"], // 所有权限
      }

      const userPermissions = permissions[userLevel] || []
      return userPermissions.includes("*") || userPermissions.includes(permission)
    },
    [user],
  )

  const canAccessCourse = useCallback(
    (courseLevel: string): boolean => {
      if (!user) return false

      const levelHierarchy = ["beginner", "intermediate", "advanced"]
      const userLevelIndex = levelHierarchy.indexOf(
        user.level.includes("初级") ? "beginner" : user.level.includes("中级") ? "intermediate" : "advanced",
      )
      const courseLevelIndex = levelHierarchy.indexOf(courseLevel)

      return userLevelIndex >= courseLevelIndex
    },
    [user],
  )

  return {
    hasPermission,
    canAccessCourse,
    isAdmin: user?.level === "管理员",
    isPremium: user?.level.includes("高级") || user?.level === "管理员",
  }
}

// 学习统计Hook
export function useUserStats() {
  const { user } = useUser()

  const stats = {
    totalCourses: user ? Object.keys(user.progress).length : 0,
    completedCourses: user?.completedCourses || 0,
    totalPoints: user?.studyPoints || 0,
    currentStreak: user?.studyDays || 0,
    totalStudyTime: user?.studyHours || 0,
    certificates: user?.certificates.length || 0,
  }

  const completionRate = stats.totalCourses > 0 ? (stats.completedCourses / stats.totalCourses) * 100 : 0

  const getProgressForCourse = useCallback(
    (courseId: string): CourseProgress | null => {
      return user?.progress[courseId] || null
    },
    [user],
  )

  const getAverageProgress = useCallback((): number => {
    if (!user || Object.keys(user.progress).length === 0) return 0

    const totalProgress = Object.values(user.progress).reduce((sum, progress) => sum + progress.progress, 0)
    return totalProgress / Object.keys(user.progress).length
  }, [user])

  return {
    stats,
    completionRate,
    getProgressForCourse,
    getAverageProgress,
  }
}

// 用户偏好设置Hook
export function useUserPreferences() {
  const { user, updateUser } = useUser()

  const updatePreference = useCallback(
    async (key: keyof User["preferences"], value: any): Promise<boolean> => {
      if (!user) return false

      const newPreferences = {
        ...user.preferences,
        [key]: value,
      }

      return await updateUser({ preferences: newPreferences })
    },
    [user, updateUser],
  )

  const toggleNotifications = useCallback(async (): Promise<boolean> => {
    if (!user) return false
    return await updatePreference("notifications", !user.preferences.notifications)
  }, [user, updatePreference])

  const toggleEmailUpdates = useCallback(async (): Promise<boolean> => {
    if (!user) return false
    return await updatePreference("emailUpdates", !user.preferences.emailUpdates)
  }, [user, updatePreference])

  const setTheme = useCallback(
    async (theme: "light" | "dark" | "system"): Promise<boolean> => {
      return await updatePreference("theme", theme)
    },
    [updatePreference],
  )

  const setLanguage = useCallback(
    async (language: string): Promise<boolean> => {
      return await updatePreference("language", language)
    },
    [updatePreference],
  )

  return {
    preferences: user?.preferences,
    updatePreference,
    toggleNotifications,
    toggleEmailUpdates,
    setTheme,
    setLanguage,
  }
}
