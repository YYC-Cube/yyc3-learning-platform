"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Clock, CheckCircle, BookOpen, Award } from "lucide-react"
import type { ComprehensiveExamQuestion } from "@/data/comprehensive-exam-questions"

interface ComprehensiveExamProps {
  examType: string
  questions: ComprehensiveExamQuestion[]
  onComplete: (results: any) => void
}

export function ComprehensiveExam({ examType, questions, onComplete }: ComprehensiveExamProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: any }>({})
  const [timeLeft, setTimeLeft] = useState(120 * 60) // 120分钟
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [results, setResults] = useState<any>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // 倒计时
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleSubmit()
    }
  }, [timeLeft, isSubmitted])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (value: any) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: value,
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateScore = () => {
    let totalScore = 0
    let maxScore = 0
    const questionResults: any[] = []

    questions.forEach((question, index) => {
      maxScore += question.points
      const userAnswer = answers[index]
      let questionScore = 0
      let isCorrect = false

      if (question.type === "single") {
        isCorrect = userAnswer === question.correctAnswers[0]
        questionScore = isCorrect ? question.points : 0
      } else if (question.type === "multiple") {
        if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswers)) {
          const correctCount = userAnswer.filter((ans) => question.correctAnswers.includes(ans)).length
          const incorrectCount = userAnswer.length - correctCount
          const missedCount = question.correctAnswers.length - correctCount

          // 部分分数计算
          if (incorrectCount === 0 && missedCount === 0) {
            questionScore = question.points
            isCorrect = true
          } else {
            questionScore = Math.max(
              0,
              ((correctCount - incorrectCount) / question.correctAnswers.length) * question.points,
            )
          }
        }
      } else if (["essay", "definition", "comparison", "application"].includes(question.type)) {
        // 主观题给予基础分数，实际应用中需要人工评分
        questionScore = userAnswer && userAnswer.trim() ? question.points * 0.7 : 0
        isCorrect = questionScore > 0
      }

      totalScore += questionScore
      questionResults.push({
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswers,
        score: questionScore,
        maxScore: question.points,
        isCorrect,
        explanation: question.explanation,
        keywords: question.keywords,
      })
    })

    return {
      totalScore: Math.round(totalScore),
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100),
      questionResults,
      timeUsed: 120 * 60 - timeLeft,
    }
  }

  const handleSubmit = () => {
    const examResults = calculateScore()
    setResults(examResults)
    setIsSubmitted(true)
    onComplete(examResults)
  }

  if (isSubmitted && results) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Award className="h-6 w-6 text-blue-600" />
              考试完成
            </CardTitle>
            <CardDescription>您的考试结果如下</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">{results.totalScore}</div>
                <div className="text-sm text-gray-600">总分 / {results.maxScore}</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">{results.percentage}%</div>
                <div className="text-sm text-gray-600">正确率</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-2">{Math.floor(results.timeUsed / 60)}分钟</div>
                <div className="text-sm text-gray-600">用时</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">答题详情</h3>
              {results.questionResults.map((result: any, index: number) => (
                <Card key={index} className={`${result.isCorrect ? "border-green-200" : "border-red-200"}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm">
                        第{index + 1}题 ({questions[index].points}分)
                      </CardTitle>
                      <Badge variant={result.isCorrect ? "default" : "destructive"}>
                        {result.score}/{result.maxScore}分
                      </Badge>
                    </div>
                    <CardDescription className="text-left">{result.question}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-sm">您的答案：</span>
                        <span className="text-sm ml-2">
                          {Array.isArray(result.userAnswer)
                            ? result.userAnswer.join(", ")
                            : result.userAnswer || "未作答"}
                        </span>
                      </div>
                      {!result.isCorrect && (
                        <div>
                          <span className="font-medium text-sm text-green-600">正确答案：</span>
                          <span className="text-sm ml-2">
                            {Array.isArray(result.correctAnswer)
                              ? result.correctAnswer.join(", ")
                              : result.correctAnswer}
                          </span>
                        </div>
                      )}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-sm">解析：</span>
                        <p className="text-sm mt-1">{result.explanation}</p>
                      </div>
                      {result.keywords && result.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.keywords.map((keyword: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* 考试头部信息 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                AI大模型综合考试
              </CardTitle>
              <CardDescription>
                第 {currentQuestionIndex + 1} 题 / 共 {questions.length} 题
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-lg font-mono">
                <Clock className="h-5 w-5 text-red-500" />
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">剩余时间</div>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* 当前题目 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{currentQuestion.category}</Badge>
                <Badge
                  variant={
                    currentQuestion.difficulty === "高级"
                      ? "destructive"
                      : currentQuestion.difficulty === "中级"
                        ? "default"
                        : "secondary"
                  }
                >
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="outline">{currentQuestion.type}</Badge>
              </div>
              <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{currentQuestion.points}分</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 单选题 */}
          {currentQuestion.type === "single" && currentQuestion.options && (
            <RadioGroup
              value={answers[currentQuestionIndex]?.toString() || ""}
              onValueChange={(value) => handleAnswerChange(Number.parseInt(value))}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* 多选题 */}
          {currentQuestion.type === "multiple" && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`option-${index}`}
                    checked={answers[currentQuestionIndex]?.includes(index) || false}
                    onCheckedChange={(checked) => {
                      const currentAnswers = answers[currentQuestionIndex] || []
                      if (checked) {
                        handleAnswerChange([...currentAnswers, index])
                      } else {
                        handleAnswerChange(currentAnswers.filter((ans: number) => ans !== index))
                      }
                    }}
                  />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {/* 主观题 */}
          {["essay", "definition", "comparison", "application"].includes(currentQuestion.type) && (
            <div className="space-y-3">
              <Textarea
                placeholder="请在此输入您的答案..."
                value={answers[currentQuestionIndex] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="min-h-[200px]"
              />
              <div className="text-sm text-gray-600">提示：请详细阐述您的观点，包含关键概念和具体分析。</div>
            </div>
          )}

          {/* 关键词提示 */}
          {currentQuestion.keywords && currentQuestion.keywords.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-2">相关关键词：</div>
              <div className="flex flex-wrap gap-1">
                {currentQuestion.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 导航按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
          上一题
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              提交考试
            </Button>
          ) : (
            <Button onClick={handleNext}>下一题</Button>
          )}
        </div>
      </div>

      {/* 答题进度 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">答题进度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={
                  index === currentQuestionIndex ? "default" : answers[index] !== undefined ? "secondary" : "outline"
                }
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            已答题：{Object.keys(answers).length} / {questions.length}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
