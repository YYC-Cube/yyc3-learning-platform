"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, ArrowDown, Target, BookOpen } from "lucide-react"
import Link from "next/link"
import type { CourseModule } from "@/data/course-recommendations"

interface LearningPathProps {
  courses: CourseModule[]
  currentCourseId?: string
  className?: string
}

export function LearningPath({ courses, currentCourseId, className }: LearningPathProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "初级":
        return "bg-green-100 text-green-800 border-green-300"
      case "中级":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "高级":
        return "bg-red-100 text-red-800 border-red-300"
      case "专家":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const isCompleted = (courseId: string) => {
    // 这里可以根据实际的学习进度数据来判断
    return false
  }

  const isCurrent = (courseId: string) => {
    return courseId === currentCourseId
  }

  return (
    <div className={className}>
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            学习路径规划
          </CardTitle>
          <CardDescription>按照难度递进和技能关联性为您规划的学习路径</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course, index) => (
              <div key={course.id} className="relative">
                <div
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    isCurrent(course.id)
                      ? "border-indigo-400 bg-indigo-50 shadow-md"
                      : isCompleted(course.id)
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {isCompleted(course.id) ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : isCurrent(course.id) ? (
                        <div className="h-6 w-6 bg-indigo-500 rounded-full flex items-center justify-center">
                          <div className="h-3 w-3 bg-white rounded-full"></div>
                        </div>
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{course.title}</h4>
                        <Badge className={getLevelColor(course.level)} variant="outline">
                          {course.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>⏱️ {course.duration}</span>
                          <span>📂 {course.category}</span>
                        </div>
                        <Button
                          size="sm"
                          variant={isCurrent(course.id) ? "default" : "outline"}
                          className="text-xs"
                          asChild
                        >
                          <Link href={`/courses/${course.id}`} className="inline-flex items-center justify-center">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {isCurrent(course.id) ? "继续学习" : "开始学习"}
                          </Link>
                        </Button>
                      </div>

                      {/* 推荐路径 */}
                      {course.nextRecommendations && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                          <span className="text-blue-700">🔍 下一步：{course.nextRecommendations.primary}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 连接线 */}
                {index < courses.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无推荐的学习路径</p>
              <p className="text-sm">请先完成当前课程或选择其他课程</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
