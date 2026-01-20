"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Clock, ArrowLeft, ArrowRight, Trophy, FileText, AlertCircle } from "lucide-react"
import type { ExamQuestion } from "@/data/exam-questions"
import { generateExamPaper } from "@/data/exam-questions"

interface ProfessionalExamProps {
  examType: "practice" | "formal" | "mock"
  timeLimit?: number // 分钟
  onComplete?: (results: ExamResults) => void
}

interface ExamResults {
  totalQuestions: number
  correctAnswers: number
  score: number
  timeUsed: number
  categoryScores: Record<string, { correct: number; total: number }>
  answers: Record<string, any>
}

export function ProfessionalExam({ examType, timeLimit = 120, onComplete }: ProfessionalExamProps) {
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60) // 转换为秒
  const [examStarted, setExamStarted] = useState(false)
  const [examCompleted, setExamCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<ExamResults | null>(null)

  // 初始化考试
  useEffect(() => {
    const questions = generateExamPaper({
      singleCount: examType === "formal" ? 50 : 20,
      multipleCount: examType === "formal" ? 25 : 10,
      essayCount: examType === "formal" ? 10 : 5,
    })
    setExamQuestions(questions)
  }, [examType])

  // 计时器
  useEffect(() => {
    if (!examStarted || examCompleted) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examStarted, examCompleted, handleSubmitExam])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartExam = useCallback(() => {
    setExamStarted(true)
  }, [])

  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }, [])

  const handleSubmitExam = useCallback(() => {
    const timeUsed = timeLimit * 60 - timeRemaining
    let totalCorrect = 0
    let totalPoints = 0
    const categoryScores: Record<string, { correct: number; total: number }> = {}

    examQuestions.forEach((question) => {
      const userAnswer = answers[question.id]
      const category = question.category

      if (!categoryScores[category]) {
        categoryScores[category] = { correct: 0, total: 0 }
      }
      categoryScores[category].total++

      if (question.type === "single" || question.type === "multiple") {
        const isCorrect =
          question.type === "single"
            ? userAnswer === question.correctAnswers[0]
            : Array.isArray(userAnswer) &&
              userAnswer.length === question.correctAnswers.length &&
              userAnswer.every((ans: number) => question.correctAnswers.includes(ans))

        if (isCorrect) {
          totalCorrect++
          categoryScores[category].correct++
          totalPoints += question.points
        }
      } else if (question.type === "essay") {
        if (userAnswer && userAnswer.trim().length > 50) {
          totalPoints += question.points * 0.7
          categoryScores[category].correct += 0.7
        }
      }
    })

    const examResults: ExamResults = {
      totalQuestions: examQuestions.length,
      correctAnswers: totalCorrect,
      score: Math.round((totalPoints / examQuestions.reduce((sum, q) => sum + q.points, 0)) * 100),
      timeUsed,
      categoryScores,
      answers,
    }

    setResults(examResults)
    setExamCompleted(true)
    setShowResults(true)
    onComplete?.(examResults)
  }, [timeLimit, timeRemaining, examQuestions, answers, onComplete])

  const currentQuestion = useMemo(() => examQuestions[currentQuestionIndex], [examQuestions, currentQuestionIndex])

  if (!examStarted) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {examType === "formal" ? "正式考试" : examType === "mock" ? "模拟考试" : "练习测试"}
          </CardTitle>
          <CardDescription>生成式人工智能应用工程师专业能力测试</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{examQuestions.length}</div>
              <div className="text-sm text-gray-600">题目总数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{timeLimit}</div>
              <div className="text-sm text-gray-600">考试时长（分钟）</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">100</div>
              <div className="text-sm text-gray-600">满分</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">考试须知</h4>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• 考试时间为 {timeLimit} 分钟，请合理分配时间</li>
                  <li>• 单选题每题 1 分，多选题每题 2 分，简答题每题 10 分</li>
                  <li>• 考试过程中请保持网络连接稳定</li>
                  <li>• 提交后无法修改答案，请仔细检查</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleStartExam}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3"
            >
              开始考试
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showResults && results) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            考试完成
          </CardTitle>
          <CardDescription>您的考试结果如下</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-indigo-600 mb-2">{results.score}分</div>
            <div className="text-lg text-gray-600">
              答对 {results.correctAnswers} / {results.totalQuestions} 题
            </div>
            <div className="text-sm text-gray-500 mt-2">用时：{formatTime(results.timeUsed)}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">分类得分</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(results.categoryScores).map(([category, scores]) => (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category}</span>
                        <span>{Math.round((scores.correct / scores.total) * 100)}%</span>
                      </div>
                      <Progress value={(scores.correct / scores.total) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">成绩评定</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>等级</span>
                    <Badge
                      variant={
                        results.score >= 90
                          ? "default"
                          : results.score >= 80
                            ? "secondary"
                            : results.score >= 60
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {results.score >= 90
                        ? "优秀"
                        : results.score >= 80
                          ? "良好"
                          : results.score >= 60
                            ? "及格"
                            : "不及格"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>正确率</span>
                    <span>{Math.round((results.correctAnswers / results.totalQuestions) * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>用时效率</span>
                    <span>{Math.round((results.timeUsed / (timeLimit * 60)) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              重新考试
            </Button>
            <Button onClick={() => setShowResults(false)}>查看答案解析</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* 考试头部 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                题目 {currentQuestionIndex + 1} / {examQuestions.length}
              </Badge>
              <Badge
                variant={
                  currentQuestion.difficulty === "初级"
                    ? "default"
                    : currentQuestion.difficulty === "中级"
                      ? "secondary"
                      : "destructive"
                }
              >
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="outline">{currentQuestion.category}</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">剩余时间</div>
              <div className="text-lg font-mono font-bold text-red-600">{formatTime(timeRemaining)}</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={((currentQuestionIndex + 1) / examQuestions.length) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* 题目内容 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.type === "single" && "【单选题】"}
            {currentQuestion.type === "multiple" && "【多选题】"}
            {currentQuestion.type === "essay" && "【简答题】"}（{currentQuestion.points}分）
          </CardTitle>
          <CardDescription className="text-base text-gray-900">{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentQuestion.type === "single" && (
            <RadioGroup
              value={answers[currentQuestion.id]?.toString() || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, Number.parseInt(value))}
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === "multiple" && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={`option-${index}`}
                    checked={answers[currentQuestion.id]?.includes(index) || false}
                    onCheckedChange={(checked) => {
                      const currentAnswers = answers[currentQuestion.id] || []
                      if (checked) {
                        handleAnswerChange(currentQuestion.id, [...currentAnswers, index])
                      } else {
                        handleAnswerChange(
                          currentQuestion.id,
                          currentAnswers.filter((a: number) => a !== index),
                        )
                      }
                    }}
                  />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {currentQuestion.type === "essay" && (
            <div className="space-y-4">
              <Textarea
                placeholder="请在此输入您的答案..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="min-h-[200px]"
              />
              <div className="text-sm text-gray-500">建议答题字数：200-500字</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 导航按钮 */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          上一题
        </Button>

        <div className="flex space-x-2">
          {currentQuestionIndex === examQuestions.length - 1 ? (
            <Button
              onClick={handleSubmitExam}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              提交考试
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              下一题
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
