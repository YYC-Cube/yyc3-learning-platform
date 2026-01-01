"use client"

import { useState, useEffect, useCallback } from "react"
import type { Course, ApiResponse, SearchFilters, PaginationInfo } from "@/app/types"
import { courseData } from "@/data/course-data"
import { logger } from "@/lib/logger"

interface UseCoursesOptions {
  initialFilters?: SearchFilters
  autoFetch?: boolean
}

interface CoursesResponse {
  courses: Course[]
  pagination: PaginationInfo
}

export function useCourses(options: UseCoursesOptions = {}) {
  const { initialFilters = {}, autoFetch = true } = options

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  })

  // 获取课程列表
  const fetchCourses = useCallback(
    async (newFilters?: SearchFilters, append = false) => {
      try {
        setLoading(true)
        setError(null)

        const currentFilters = newFilters || filters
        const currentOffset = append ? pagination.offset + pagination.limit : 0

        const params = new URLSearchParams()

        if (currentFilters.category) params.append("category", currentFilters.category)
        if (currentFilters.difficulty) params.append("difficulty", currentFilters.difficulty)
        if (currentFilters.tags?.length) {
          currentFilters.tags.forEach((tag) => params.append("tags", tag))
        }

        params.append("limit", pagination.limit.toString())
        params.append("offset", currentOffset.toString())

        const response = await fetch(`/api/courses?${params.toString()}`)
        const result: ApiResponse<CoursesResponse> = await response.json()

        if (!result.success) {
          throw new Error(result.error || "获取课程失败")
        }

        const { courses: newCourses, pagination: newPagination } = result.data!

        setCourses((prev) => (append ? [...prev, ...newCourses] : newCourses))
        setPagination(newPagination)

        if (newFilters) {
          setFilters(newFilters)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "获取课程失败"
        setError(errorMessage)
        logger.error("获取课程失败:", err)
      } finally {
        setLoading(false)
      }
    },
    [filters, pagination.limit, pagination.offset],
  )

  // 搜索课程
  const searchCourses = useCallback(async (query: string) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append("search", query)
      params.append("limit", "20")
      params.append("offset", "0")

      const response = await fetch(`/api/courses?${params.toString()}`)
      const result: ApiResponse<CoursesResponse> = await response.json()

      if (!result.success) {
        throw new Error(result.error || "搜索课程失败")
      }

      setCourses(result.data!.courses)
      setPagination(result.data!.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "搜索课程失败"
      setError(errorMessage)
      logger.error("搜索课程失败:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // 加载更多课程
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading) return
    await fetchCourses(filters, true)
  }, [fetchCourses, filters, pagination.hasMore, loading])

  // 报名课程
  const enrollCourse = useCallback(async (courseId: string) => {
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "enrollCourse",
          data: { courseId },
        }),
      })

      const result: ApiResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || "报名失败")
      }

      // 更新本地课程状态
      setCourses((prev) =>
        prev.map((course) => (course.id === courseId ? { ...course, isEnrolled: true, progress: 0 } : course)),
      )

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "报名失败"
      setError(errorMessage)
      logger.error("报名课程失败:", err)
      throw err
    }
  }, [])

  // 更新学习进度
  const updateProgress = useCallback(async (courseId: string, progress: number, chapterCompleted = false) => {
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateProgress",
          data: { courseId, progress, chapterCompleted },
        }),
      })

      const result: ApiResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || "更新进度失败")
      }

      // 更新本地课程进度
      setCourses((prev) => prev.map((course) => (course.id === courseId ? { ...course, progress } : course)))

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新进度失败"
      setError(errorMessage)
      logger.error("更新学习进度失败:", err)
      throw err
    }
  }, [])

  // 创建新课程
  const createCourse = useCallback(async (courseData: Partial<Course>) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      })

      const result: ApiResponse<Course> = await response.json()

      if (!result.success) {
        throw new Error(result.error || "创建课程失败")
      }

      // 添加到本地课程列表
      setCourses((prev) => [result.data!, ...prev])

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "创建课程失败"
      setError(errorMessage)
      logger.error("创建课程失败:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 获取课程详情
  const getCourseById = useCallback(
    (courseId: string): Course | undefined => {
      return courses.find((course) => course.id === courseId)
    },
    [courses],
  )

  // 获取课程详情（按ID）
  const getCourseByIdLocal = (id: number) => {
    return courses.find((course) => course.id === id)
  }

  // 获取课程列表（按分类）
  const getCoursesByCategoryLocal = (category: string) => {
    return courses.filter((course) => course.category === category)
  }

  // 获取课程列表（按难度）
  const getCoursesByLevelLocal = (level: string) => {
    return courses.filter((course) => course.level === level)
  }

  // 按分类筛选课程
  const getCoursesByCategory = useCallback(
    (category: string): Course[] => {
      return courses.filter((course) => course.category === category)
    },
    [courses],
  )

  // 获取推荐课程
  const getRecommendedCourses = useCallback(
    (limit = 5): Course[] => {
      return courses
        .filter((course) => course.rating >= 4.5)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit)
    },
    [courses],
  )

  // 获取用户已报名课程
  const getEnrolledCourses = useCallback((): Course[] => {
    return courses.filter((course) => course.isEnrolled)
  }, [courses])

  // 初始化时自动获取课程
  useEffect(() => {
    const fetchCoursesLocal = async () => {
      try {
        setLoading(true)
        // 模拟API调用延迟
        await new Promise((resolve) => setTimeout(resolve, 500))

        const mockCourses: Course[] = [
          {
            id: "gpt-basics",
            title: "GPT模型基础与应用",
            description: "深入理解大语言模型的原理和实际应用",
            image: "/images/gpt-basics-course.png",
            level: "beginner",
            duration: "8小时",
            progress: 75,
            chapters: 12,
            category: "AI基础",
            instructor: "李教授",
            rating: 4.8,
            students: 1234,
          },
          {
            id: "prompt-engineering",
            title: "Prompt Engineering实战",
            description: "掌握提示词工程的核心技巧和最佳实践",
            image: "/images/prompt-engineering-course.png",
            level: "intermediate",
            duration: "12小时",
            progress: 45,
            chapters: 15,
            category: "AI应用",
            instructor: "王老师",
            rating: 4.9,
            students: 856,
          },
        ]

        setCourses(mockCourses)
      } catch (err) {
        setError("获取课程数据失败")
      } finally {
        setLoading(false)
      }
    }

    if (autoFetch) {
      fetchCoursesLocal()
    } else {
      setCourses(courseData)
      setLoading(false)
    }
  }, []) // 只在组件挂载时执行一次

  return {
    // 状态
    courses,
    loading,
    error,
    filters,
    pagination,

    // 操作方法
    fetchCourses,
    searchCourses,
    loadMore,
    enrollCourse,
    updateProgress,
    createCourse,

    // 工具方法
    getCourseById,
    getCoursesByCategory,
    getRecommendedCourses,
    getEnrolledCourses,

    // 本地工具方法
    getCourseByIdLocal,
    getCoursesByCategoryLocal,
    getCoursesByLevelLocal,

    // 筛选方法
    setFilters: (newFilters: SearchFilters) => {
      setFilters(newFilters)
      fetchCourses(newFilters)
    },

    // 重置方法
    reset: () => {
      setCourses([])
      setError(null)
      setFilters({})
      setPagination({
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false,
      })
    },
  }
}

// 用户学习进度管理Hook
export function useUserProgress() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateCourseProgress = useCallback(async (courseId: string, progress: number, chapterCompleted = false) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateProgress",
          data: { courseId, progress, chapterCompleted },
        }),
      })

      const result: ApiResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || "更新进度失败")
      }

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新进度失败"
      setError(errorMessage)
      logger.error("更新学习进度失败:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStreak = useCallback(async () => {
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateStreak",
          data: {},
        }),
      })

      const result: ApiResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || "更新连续学习天数失败")
      }

      return result.data
    } catch (err) {
      logger.error("更新连续学习天数失败:", err)
      throw err
    }
  }, [])

  return {
    loading,
    error,
    updateCourseProgress,
    updateStreak,
  }
}
