"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, AlertCircle, Clock, BookOpen } from "lucide-react"

interface ExamProgressTrackerProps {
  totalQuestions: number
  currentQuestionIndex: number
  answers: Record<number, any>
  timeRemaining: number
  onQuestionSelect: (index: number) => void
  examDuration: number
}

export function ExamProgressTracker({
  totalQuestions,
  currentQuestionIndex,
  answers,
  timeRemaining,
  onQuestionSelect,
  examDuration,
}: ExamProgressTrackerProps) {
  const [showDetailedProgress, setShowDetailedProgress] = useState(false)

  const answeredCount = Object.keys(answers).length
  const progressPercentage = (answeredCount / totalQuestions) * 100
  const timeUsedPercentage = ((examDuration * 60 - timeRemaining) / (examDuration * 60)) * 100

  const getQuestionStatus = (index: number) => {
    if (index === currentQuestionIndex) return "current"
    if (answers[index] !== undefined) return "answered"
    return "unanswered"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "current":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      case "answered":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-blue-500 hover:bg-blue-600 text-white"
      case "answered":
        return "bg-green-100 hover:bg-green-200 text-green-800 border border-green-300"
      default:
        return "bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300"
    }
  }

  return (
    <Card className="sticky top-4">
      <CardContent className="p-4">
        {/* 总体进度 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-sm">答题进度</span>
            </div>
            <span className="text-sm text-gray-600">
              {answeredCount}/{totalQuestions}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 mb-2" />
          <div className="text-xs text-gray-500">已完成 {Math.round(progressPercentage)}%</div>
        </div>

        {/* 时间进度 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-sm">时间使用</span>
            </div>
            <span className="text-sm text-gray-600">{Math.round(timeUsedPercentage)}%</span>
          </div>
          <Progress value={timeUsedPercentage} className="h-2 mb-2" />
          <div className="text-xs text-gray-500">剩余 {Math.floor(timeRemaining / 60)} 分钟</div>
        </div>

        {/* 答题状态统计 */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-bold text-green-600">{answeredCount}</div>
            <div className="text-green-700">已答</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-bold text-blue-600">1</div>
            <div className="text-blue-700">当前</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-bold text-gray-600">{totalQuestions - answeredCount - 1}</div>
            <div className="text-gray-700">未答</div>
          </div>
        </div>

        {/* 题目导航 */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailedProgress(!showDetailedProgress)}
            className="w-full text-xs"
          >
            {showDetailedProgress ? "隐藏" : "显示"}题目导航
          </Button>
        </div>

        {showDetailedProgress && (
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: totalQuestions }, (_, index) => {
              const status = getQuestionStatus(index)
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 text-xs ${getStatusColor(status)}`}
                  onClick={() => onQuestionSelect(index)}
                >
                  {index + 1}
                </Button>
              )
            })}
          </div>
        )}

        {/* 智能提醒 */}
        {timeRemaining <= 600 && answeredCount < totalQuestions && (
          <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <div className="flex items-center gap-1 text-red-700">
              <AlertCircle className="h-3 w-3" />
              <span className="font-medium">时间提醒</span>
            </div>
            <div className="text-red-600 mt-1">还有 {totalQuestions - answeredCount} 题未完成，请抓紧时间！</div>
          </div>
        )}

        {progressPercentage >= 80 && (
          <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded text-xs">
            <div className="flex items-center gap-1 text-green-700">
              <CheckCircle className="h-3 w-3" />
              <span className="font-medium">进度良好</span>
            </div>
            <div className="text-green-600 mt-1">已完成大部分题目，继续保持！</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
