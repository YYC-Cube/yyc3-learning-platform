"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Clock, Target, ChevronUp, ChevronDown } from "lucide-react"

interface MobileExamOptimizationProps {
  questions: any[]
  currentQuestionIndex: number
  answers: Record<number, any>
  timeRemaining: number
  onQuestionChange: (index: number) => void
}

export function MobileExamOptimization({
  questions,
  currentQuestionIndex,
  answers,
  timeRemaining,
  onQuestionChange,
}: MobileExamOptimizationProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<string[]>([])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const answeredCount = Object.keys(answers).length
  const progressPercentage = (answeredCount / questions.length) * 100

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  if (!isMobile) return null

  return (
    <>
      {/* 移动端顶部固定栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <Sheet open={showMobileNav} onOpenChange={setShowMobileNav}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    考试导航
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  {/* 进度概览 */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">答题进度</span>
                          <span className="text-sm text-gray-600">
                            {answeredCount}/{questions.length}
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-bold text-green-600">{answeredCount}</div>
                            <div className="text-green-700">已答</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-bold text-blue-600">1</div>
                            <div className="text-blue-700">当前</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-bold text-gray-600">{questions.length - answeredCount - 1}</div>
                            <div className="text-gray-700">未答</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 题目导航 */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">题目列表</span>
                          <Button variant="ghost" size="sm" onClick={() => toggleSection("questions")} className="p-1">
                            {collapsedSections.includes("questions") ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {!collapsedSections.includes("questions") && (
                          <div className="grid grid-cols-5 gap-1">
                            {questions.map((_, index) => {
                              const isAnswered = answers[index] !== undefined
                              const isCurrent = index === currentQuestionIndex

                              return (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    onQuestionChange(index)
                                    setShowMobileNav(false)
                                  }}
                                  className={`h-8 w-8 p-0 text-xs ${
                                    isCurrent
                                      ? "bg-blue-500 text-white"
                                      : isAnswered
                                        ? "bg-green-100 text-green-800"
                                        : "hover:bg-gray-100"
                                  }`}
                                >
                                  {index + 1}
                                </Button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </SheetContent>
            </Sheet>

            <Badge variant="outline" className="text-xs">
              {currentQuestionIndex + 1}/{questions.length}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                timeRemaining <= 600 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
              }`}
            >
              <Clock className="h-3 w-3" />
              <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>

        {/* 移动端进度条 */}
        <div className="px-3 pb-2">
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-1" />
        </div>
      </div>

      {/* 移动端底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t shadow-lg">
        <div className="flex items-center justify-between p-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuestionChange(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex-1 mr-2"
          >
            上一题
          </Button>

          <div className="flex items-center space-x-1">
            {[currentQuestionIndex - 1, currentQuestionIndex, currentQuestionIndex + 1]
              .filter((index) => index >= 0 && index < questions.length)
              .map((index) => {
                const isAnswered = answers[index] !== undefined
                const isCurrent = index === currentQuestionIndex

                return (
                  <Button
                    key={index}
                    variant={isCurrent ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onQuestionChange(index)}
                    className={`w-8 h-8 p-0 text-xs ${
                      isCurrent ? "bg-blue-500 text-white" : isAnswered ? "bg-green-100 text-green-700" : ""
                    }`}
                  >
                    {index + 1}
                  </Button>
                )
              })}
          </div>

          <Button
            size="sm"
            onClick={() => onQuestionChange(Math.min(questions.length - 1, currentQuestionIndex + 1))}
            disabled={currentQuestionIndex === questions.length - 1}
            className="flex-1 ml-2 bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            下一题
          </Button>
        </div>
      </div>

      {/* 移动端内容区域间距调整 */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-exam-content {
            padding-top: 120px !important;
            padding-bottom: 80px !important;
          }
          
          .mobile-question-card {
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border-left: none !important;
            border-right: none !important;
          }
        }
      `}</style>
    </>
  )
}
