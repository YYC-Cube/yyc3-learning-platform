"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Target,
  Lightbulb,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
} from "lucide-react"

interface EnhancedExamLayoutProps {
  exam: any
  questions: any[]
  currentQuestionIndex: number
  answers: Record<number, any>
  timeRemaining: number
  onQuestionChange: (index: number) => void
  onAnswerChange: (questionIndex: number, answer: any) => void
  onSubmit: () => void
  children: React.ReactNode
}

export function EnhancedExamLayout({
  exam,
  questions,
  currentQuestionIndex,
  answers,
  timeRemaining,
  onQuestionChange,
  onAnswerChange,
  onSubmit,
  children,
}: EnhancedExamLayoutProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [focusMode, setFocusMode] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = Object.keys(answers).length
  const progressPercentage = (answeredCount / questions.length) * 100

  // 格式化时间
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // 专注模式
  const toggleFocusMode = () => {
    setFocusMode(!focusMode)
    setShowSidebar(!focusMode ? false : true)
  }

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault()
            if (currentQuestionIndex > 0) {
              onQuestionChange(currentQuestionIndex - 1)
            }
            break
          case "ArrowRight":
            e.preventDefault()
            if (currentQuestionIndex < questions.length - 1) {
              onQuestionChange(currentQuestionIndex + 1)
            }
            break
          case "Enter":
            e.preventDefault()
            if (currentQuestionIndex === questions.length - 1) {
              onSubmit()
            }
            break
          case "f":
            e.preventDefault()
            toggleFullscreen()
            break
          case "d":
            e.preventDefault()
            toggleFocusMode()
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentQuestionIndex, questions.length])

  return (
    <div
      className={`min-h-screen pb-24 md:pb-6 transition-all duration-300 ${
        focusMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
      {/* 顶部固定导航栏 */}
      <div
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-300 ${
          focusMode ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-gray-200"
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 左侧信息 */}
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className={focusMode ? "border-gray-600 text-gray-300" : ""}>
                {currentQuestionIndex + 1} / {questions.length}
              </Badge>
              <Badge variant="secondary" className={focusMode ? "bg-gray-700 text-gray-300" : ""}>
                {exam.category}
              </Badge>
              <div className="hidden md:flex items-center space-x-2">
                <div className={`text-sm ${focusMode ? "text-gray-400" : "text-gray-600"}`}>已答: {answeredCount}</div>
                <Separator orientation="vertical" className="h-4" />
                <div className={`text-sm ${focusMode ? "text-gray-400" : "text-gray-600"}`}>
                  剩余: {questions.length - answeredCount}
                </div>
              </div>
            </div>

            {/* 中间进度条 */}
            <div className="flex-1 max-w-md mx-8 hidden lg:block">
              <div className="flex items-center space-x-2">
                <Progress value={progressPercentage} className={`flex-1 h-2 ${focusMode ? "bg-gray-700" : ""}`} />
                <span className={`text-sm font-medium ${focusMode ? "text-gray-300" : "text-gray-700"}`}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>

            {/* 右侧控制 */}
            <div className="flex items-center space-x-4">
              {/* 时间显示 */}
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  timeRemaining <= 600
                    ? "bg-red-100 text-red-700 animate-pulse"
                    : focusMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-orange-100 text-orange-700"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </div>

              {/* 控制按钮 */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className={focusMode ? "text-gray-300 hover:text-white hover:bg-gray-700" : ""}
                  title="切换侧边栏"
                >
                  {showSidebar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFocusMode}
                  className={focusMode ? "text-gray-300 hover:text-white hover:bg-gray-700" : ""}
                  title="专注模式 (Ctrl+D)"
                >
                  <Target className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className={focusMode ? "text-gray-300 hover:text-white hover:bg-gray-700" : ""}
                  title="全屏模式 (Ctrl+F)"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="container mx-auto px-4 py-6">
        <div className={`grid gap-6 transition-all duration-300 ${showSidebar ? "lg:grid-cols-4" : "lg:grid-cols-1"}`}>
          {/* 主要考试内容 */}
          <div className={`space-y-6 ${showSidebar ? "lg:col-span-3" : "lg:col-span-1 max-w-4xl mx-auto"}`}>
            {/* 题目卡片 */}
            <Card
              className={`shadow-lg transition-all duration-300 ${
                focusMode ? "bg-gray-800 border-gray-700" : "bg-white"
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle
                      className={`text-lg flex items-center gap-2 ${focusMode ? "text-gray-100" : "text-gray-900"}`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          currentQuestion.type === "single"
                            ? "bg-blue-100 text-blue-600"
                            : currentQuestion.type === "multiple"
                              ? "bg-green-100 text-green-600"
                              : "bg-purple-100 text-purple-600"
                        } ${focusMode ? "bg-opacity-20" : ""}`}
                      >
                        {currentQuestion.type === "single" ? "单" : currentQuestion.type === "multiple" ? "多" : "简"}
                      </div>
                      <span>
                        {currentQuestion.type === "single"
                          ? "单选题"
                          : currentQuestion.type === "multiple"
                            ? "多选题"
                            : "简答题"}
                      </span>
                      <Badge variant="outline" className={focusMode ? "border-gray-600 text-gray-400" : ""}>
                        {currentQuestion.points}分
                      </Badge>
                    </CardTitle>
                  </div>

                  {/* 题目难度指示器 */}
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-2 rounded-full ${
                          level <=
                          (currentQuestion.difficulty === "easy" ? 2 : currentQuestion.difficulty === "medium" ? 3 : 4)
                            ? focusMode
                              ? "bg-yellow-400"
                              : "bg-yellow-500"
                            : focusMode
                              ? "bg-gray-600"
                              : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className={`text-base leading-relaxed mb-6 ${focusMode ? "text-gray-200" : "text-gray-900"}`}>
                  {currentQuestion.question}
                </div>

                {/* 题目内容区域 */}
                <div className="space-y-4">{children}</div>
              </CardContent>
            </Card>

            {/* 导航控制 */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => onQuestionChange(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className={`${focusMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : ""}`}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                上一题
                <span className="hidden sm:inline ml-1">(Ctrl+←)</span>
              </Button>

              <div className="flex items-center space-x-2">
                {/* 快速跳转 */}
                <div className="hidden md:flex items-center space-x-1">
                  {questions
                    .slice(Math.max(0, currentQuestionIndex - 2), Math.min(questions.length, currentQuestionIndex + 3))
                    .map((_, index) => {
                      const actualIndex = Math.max(0, currentQuestionIndex - 2) + index
                      const isAnswered = answers[actualIndex] !== undefined
                      const isCurrent = actualIndex === currentQuestionIndex

                      return (
                        <Button
                          key={actualIndex}
                          variant={isCurrent ? "default" : "ghost"}
                          size="sm"
                          onClick={() => onQuestionChange(actualIndex)}
                          className={`w-8 h-8 p-0 ${
                            isCurrent
                              ? focusMode
                                ? "bg-blue-600 text-white"
                                : "bg-blue-600 text-white"
                              : isAnswered
                                ? focusMode
                                  ? "bg-green-700 text-green-200"
                                  : "bg-green-100 text-green-700"
                                : focusMode
                                  ? "text-gray-400 hover:bg-gray-700"
                                  : ""
                          }`}
                        >
                          {actualIndex + 1}
                        </Button>
                      )
                    })}
                </div>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={onSubmit}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    提交考试
                    <span className="hidden sm:inline ml-1">(Ctrl+Enter)</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => onQuestionChange(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  >
                    下一题
                    <ArrowRight className="h-4 w-4 ml-2" />
                    <span className="hidden sm:inline ml-1">(Ctrl+→)</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          {showSidebar && (
            <div className={`lg:col-span-1 space-y-4 transition-all duration-300 ${focusMode ? "opacity-80" : ""}`}>
              {/* 进度概览 */}
              <Card className={focusMode ? "bg-gray-800 border-gray-700" : ""}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-sm flex items-center gap-2 ${focusMode ? "text-gray-200" : ""}`}>
                    <BookOpen className="h-4 w-4" />
                    答题进度
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className={focusMode ? "text-gray-400" : "text-gray-600"}>总体进度</span>
                      <span className={focusMode ? "text-gray-300" : "text-gray-700"}>
                        {answeredCount}/{questions.length}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className={`text-center p-2 rounded ${focusMode ? "bg-gray-700" : "bg-green-50"}`}>
                      <div className={`font-bold ${focusMode ? "text-green-400" : "text-green-600"}`}>
                        {answeredCount}
                      </div>
                      <div className={focusMode ? "text-gray-400" : "text-green-700"}>已答</div>
                    </div>
                    <div className={`text-center p-2 rounded ${focusMode ? "bg-gray-700" : "bg-blue-50"}`}>
                      <div className={`font-bold ${focusMode ? "text-blue-400" : "text-blue-600"}`}>1</div>
                      <div className={focusMode ? "text-gray-400" : "text-blue-700"}>当前</div>
                    </div>
                    <div className={`text-center p-2 rounded ${focusMode ? "bg-gray-700" : "bg-gray-50"}`}>
                      <div className={`font-bold ${focusMode ? "text-gray-400" : "text-gray-600"}`}>
                        {questions.length - answeredCount - 1}
                      </div>
                      <div className={focusMode ? "text-gray-400" : "text-gray-700"}>未答</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 题目导航网格 */}
              <Card className={focusMode ? "bg-gray-800 border-gray-700" : ""}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-sm flex items-center gap-2 ${focusMode ? "text-gray-200" : ""}`}>
                    <Target className="h-4 w-4" />
                    题目导航
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-1">
                    {questions.map((_, index) => {
                      const isAnswered = answers[index] !== undefined
                      const isCurrent = index === currentQuestionIndex

                      return (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => onQuestionChange(index)}
                          className={`h-8 w-8 p-0 text-xs transition-all duration-200 ${
                            isCurrent
                              ? focusMode
                                ? "bg-blue-600 text-white"
                                : "bg-blue-500 text-white"
                              : isAnswered
                                ? focusMode
                                  ? "bg-green-700 text-green-200 hover:bg-green-600"
                                  : "bg-green-100 text-green-800 hover:bg-green-200"
                                : focusMode
                                  ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                                  : "hover:bg-gray-100"
                          }`}
                        >
                          {index + 1}
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 智能提示 */}
              <Card className={focusMode ? "bg-gray-800 border-gray-700" : ""}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-sm flex items-center gap-2 ${focusMode ? "text-gray-200" : ""}`}>
                    <Lightbulb className="h-4 w-4" />
                    智能提示
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    {timeRemaining <= 600 && answeredCount < questions.length && (
                      <div
                        className={`p-2 rounded border-l-4 ${
                          focusMode
                            ? "bg-red-900/30 border-red-500 text-red-300"
                            : "bg-red-50 border-red-400 text-red-700"
                        }`}
                      >
                        ⚠️ 时间紧迫，还有 {questions.length - answeredCount} 题未完成
                      </div>
                    )}

                    {progressPercentage >= 80 && (
                      <div
                        className={`p-2 rounded border-l-4 ${
                          focusMode
                            ? "bg-green-900/30 border-green-500 text-green-300"
                            : "bg-green-50 border-green-400 text-green-700"
                        }`}
                      >
                        ✅ 进度良好，继续保持！
                      </div>
                    )}

                    <div
                      className={`p-2 rounded ${focusMode ? "bg-gray-700 text-gray-300" : "bg-blue-50 text-blue-700"}`}
                    >
                      💡 使用 Ctrl+← → 快速切换题目
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* 快捷键提示 */}
      {!focusMode && (
        <div className="fixed bottom-4 left-4 z-30">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-3">
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+←→</kbd> 切换题目
                </div>
                <div>
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+F</kbd> 全屏
                </div>
                <div>
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+D</kbd> 专注模式
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
