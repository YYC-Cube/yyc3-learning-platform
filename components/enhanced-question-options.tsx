"use client"

import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, CheckSquare, Lightbulb } from "lucide-react"

interface EnhancedQuestionOptionsProps {
  question: any
  questionIndex: number
  answer: any
  onAnswerChange: (answer: any) => void
  focusMode?: boolean
}

export function EnhancedQuestionOptions({
  question,
  questionIndex,
  answer,
  onAnswerChange,
  focusMode = false,
}: EnhancedQuestionOptionsProps) {
  const [showHint, setShowHint] = useState(false)

  // 单选题组件
  const SingleChoiceQuestion = () => (
    <RadioGroup
      value={answer?.toString() || ""}
      onValueChange={(value) => onAnswerChange(Number.parseInt(value))}
      className="space-y-3"
    >
      {question.options?.map((option: string, index: number) => {
        const isSelected = answer === index
        return (
          <div
            key={index}
            className={`group relative transition-all duration-200 ${
              focusMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
            }`}
          >
            <Label
              htmlFor={`option-${questionIndex}-${index}`}
              className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? focusMode
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-blue-500 bg-blue-50"
                  : focusMode
                    ? "border-gray-600 hover:border-gray-500"
                    : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center mt-0.5">
                <RadioGroupItem
                  value={index.toString()}
                  id={`option-${questionIndex}-${index}`}
                  className={isSelected ? "border-blue-500" : ""}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start space-x-2">
                  <Badge
                    variant="outline"
                    className={`text-xs font-bold ${
                      isSelected
                        ? focusMode
                          ? "border-blue-400 text-blue-400"
                          : "border-blue-500 text-blue-600"
                        : focusMode
                          ? "border-gray-500 text-gray-400"
                          : "border-gray-400 text-gray-600"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </Badge>
                  <div className={`text-sm leading-relaxed ${focusMode ? "text-gray-200" : "text-gray-900"}`}>
                    {option}
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                </div>
              )}
            </Label>
          </div>
        )
      })}
    </RadioGroup>
  )

  // 多选题组件
  const MultipleChoiceQuestion = () => (
    <div className="space-y-3">
      {question.options?.map((option: string, index: number) => {
        const isSelected = Array.isArray(answer) && answer.includes(index)
        return (
          <div
            key={index}
            className={`group relative transition-all duration-200 ${
              focusMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
            }`}
          >
            <Label
              htmlFor={`option-${questionIndex}-${index}`}
              className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? focusMode
                    ? "border-green-500 bg-green-900/20"
                    : "border-green-500 bg-green-50"
                  : focusMode
                    ? "border-gray-600 hover:border-gray-500"
                    : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center mt-0.5">
                <Checkbox
                  id={`option-${questionIndex}-${index}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    const currentAnswers = Array.isArray(answer) ? answer : []
                    if (checked) {
                      onAnswerChange([...currentAnswers, index])
                    } else {
                      onAnswerChange(currentAnswers.filter((a: number) => a !== index))
                    }
                  }}
                  className={isSelected ? "border-green-500" : ""}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start space-x-2">
                  <Badge
                    variant="outline"
                    className={`text-xs font-bold ${
                      isSelected
                        ? focusMode
                          ? "border-green-400 text-green-400"
                          : "border-green-500 text-green-600"
                        : focusMode
                          ? "border-gray-500 text-gray-400"
                          : "border-gray-400 text-gray-600"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </Badge>
                  <div className={`text-sm leading-relaxed ${focusMode ? "text-gray-200" : "text-gray-900"}`}>
                    {option}
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-green-500" />
                </div>
              )}
            </Label>
          </div>
        )
      })}

      {/* 多选题提示 */}
      <div className={`text-xs p-2 rounded ${focusMode ? "bg-gray-700 text-gray-400" : "bg-blue-50 text-blue-600"}`}>
        💡 提示：多选题可以选择多个答案，请仔细阅读题目要求
      </div>
    </div>
  )

  // 简答题组件
  const EssayQuestion = () => {
    const wordCount = answer ? answer.length : 0
    const minWords = 50
    const maxWords = 1000

    return (
      <div className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="请在此输入您的答案..."
            value={answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            className={`min-h-[200px] resize-none transition-all duration-200 ${
              focusMode
                ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
                : "focus:border-blue-500"
            }`}
            maxLength={maxWords}
          />

          {/* 字数统计 */}
          <div
            className={`absolute bottom-2 right-2 text-xs px-2 py-1 rounded ${
              wordCount < minWords
                ? focusMode
                  ? "bg-red-900/50 text-red-400"
                  : "bg-red-100 text-red-600"
                : wordCount > maxWords * 0.9
                  ? focusMode
                    ? "bg-yellow-900/50 text-yellow-400"
                    : "bg-yellow-100 text-yellow-600"
                  : focusMode
                    ? "bg-gray-600 text-gray-300"
                    : "bg-gray-100 text-gray-600"
            }`}
          >
            {wordCount}/{maxWords}
          </div>
        </div>

        {/* 答题指导 */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHint(!showHint)}
            className={`text-xs ${focusMode ? "text-gray-400 hover:text-gray-200" : ""}`}
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            {showHint ? "隐藏" : "显示"}答题指导
          </Button>

          {showHint && (
            <Card className={focusMode ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-blue-200"}>
              <CardContent className="p-3">
                <div className={`text-xs space-y-2 ${focusMode ? "text-gray-300" : "text-blue-800"}`}>
                  <div className="font-medium">简答题答题技巧：</div>
                  <ul className="space-y-1 ml-2">
                    <li>• 先列出要点，再详细阐述</li>
                    <li>• 结构清晰，逻辑分明</li>
                    <li>• 结合实际案例说明</li>
                    <li>• 建议字数：{minWords}-500字</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 进度指示器 */}
        <div className="flex items-center space-x-2">
          <div className={`flex-1 h-1 rounded-full ${focusMode ? "bg-gray-600" : "bg-gray-200"}`}>
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                wordCount < minWords ? "bg-red-500" : wordCount < minWords * 2 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${Math.min(100, (wordCount / (minWords * 2)) * 100)}%` }}
            />
          </div>
          <div
            className={`text-xs ${
              wordCount < minWords
                ? focusMode
                  ? "text-red-400"
                  : "text-red-600"
                : focusMode
                  ? "text-green-400"
                  : "text-green-600"
            }`}
          >
            {wordCount < minWords ? `还需 ${minWords - wordCount} 字` : "字数充足"}
          </div>
        </div>
      </div>
    )
  }

  // 根据题目类型渲染对应组件
  const renderQuestionContent = () => {
    switch (question.type) {
      case "single":
        return <SingleChoiceQuestion />
      case "multiple":
        return <MultipleChoiceQuestion />
      case "essay":
        return <EssayQuestion />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {renderQuestionContent()}

      {/* 答题状态指示 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          {answer !== undefined && answer !== "" && (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className={`text-sm ${focusMode ? "text-green-400" : "text-green-600"}`}>已答题</span>
            </>
          )}
        </div>

        <div className={`text-xs ${focusMode ? "text-gray-400" : "text-gray-500"}`}>💾 答案自动保存</div>
      </div>
    </div>
  )
}
