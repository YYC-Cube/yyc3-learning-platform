"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, HelpCircle, BookOpen, Clock, Target, AlertTriangle } from "lucide-react"

interface ExamAssistantProps {
  currentQuestion: any
  timeRemaining: number
  totalQuestions: number
  currentIndex: number
  examType: string
}

export function ExamAssistant({
  currentQuestion,
  timeRemaining,
  totalQuestions,
  currentIndex,
  examType,
}: ExamAssistantProps) {
  const [showHints, setShowHints] = useState(false)

  const getQuestionTypeAdvice = (type: string) => {
    switch (type) {
      case "single":
        return {
          icon: <Target className="h-4 w-4" />,
          title: "单选题技巧",
          tips: [
            "仔细阅读题目，注意关键词",
            "排除明显错误的选项",
            "选择最符合题意的答案",
            "不要过度思考，相信第一直觉",
          ],
        }
      case "multiple":
        return {
          icon: <Target className="h-4 w-4" />,
          title: "多选题技巧",
          tips: ["逐一分析每个选项", "注意题目要求选择几个答案", "相关选项可能都是正确的", "仔细检查是否遗漏选项"],
        }
      case "essay":
        return {
          icon: <BookOpen className="h-4 w-4" />,
          title: "简答题技巧",
          tips: ["先列出要点，再详细阐述", "结构清晰，逻辑分明", "结合实际案例说明", "注意字数要求和时间分配"],
        }
      default:
        return null
    }
  }

  const getTimeAdvice = () => {
    const avgTimePerQuestion = timeRemaining / (totalQuestions - currentIndex)
    const recommendedTime = currentQuestion?.type === "essay" ? 8 : currentQuestion?.type === "multiple" ? 3 : 2

    if (avgTimePerQuestion < recommendedTime) {
      return {
        type: "warning",
        message: "时间较紧，建议加快答题速度",
        icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      }
    } else if (avgTimePerQuestion > recommendedTime * 2) {
      return {
        type: "info",
        message: "时间充裕，可以仔细思考",
        icon: <Clock className="h-4 w-4 text-green-500" />,
      }
    }
    return null
  }

  const getDifficultyAdvice = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "基础题目，注意细节，避免粗心错误"
      case "medium":
        return "中等难度，需要理解概念并灵活应用"
      case "hard":
        return "高难度题目，需要深入思考和综合分析"
      default:
        return ""
    }
  }

  const advice = getQuestionTypeAdvice(currentQuestion?.type)
  const timeAdvice = getTimeAdvice()

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          智能答题助手
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 当前题目信息 */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">第 {currentIndex + 1} 题</span>
          <Badge variant="outline" className="text-xs">
            {currentQuestion?.difficulty === "easy" && "简单"}
            {currentQuestion?.difficulty === "medium" && "中等"}
            {currentQuestion?.difficulty === "hard" && "困难"}
          </Badge>
        </div>

        {/* 时间建议 */}
        {timeAdvice && (
          <div className="flex items-center gap-2 p-2 bg-white/50 rounded text-xs">
            {timeAdvice.icon}
            <span>{timeAdvice.message}</span>
          </div>
        )}

        {/* 难度建议 */}
        {currentQuestion?.difficulty && (
          <div className="text-xs text-gray-600 bg-white/50 p-2 rounded">
            💡 {getDifficultyAdvice(currentQuestion.difficulty)}
          </div>
        )}

        {/* 答题技巧 */}
        <div>
          <Button variant="ghost" size="sm" onClick={() => setShowHints(!showHints)} className="text-xs h-6 p-2">
            <HelpCircle className="h-3 w-3 mr-1" />
            {showHints ? "隐藏" : "显示"}答题技巧
          </Button>

          {showHints && advice && (
            <div className="mt-2 p-2 bg-white/50 rounded">
              <div className="flex items-center gap-1 text-xs font-medium mb-1">
                {advice.icon}
                {advice.title}
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                {advice.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 考试类型特殊提醒 */}
        {examType === "2" && (
          <div className="text-xs bg-purple-50 p-2 rounded border border-purple-200">
            <span className="font-medium text-purple-800">Prompt工程提醒：</span>
            <span className="text-purple-700"> 注重实际应用和最佳实践</span>
          </div>
        )}

        {examType === "3" && (
          <div className="text-xs bg-green-50 p-2 rounded border border-green-200">
            <span className="font-medium text-green-800">开发实战提醒：</span>
            <span className="text-green-700"> 考虑系统架构和工程实践</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
