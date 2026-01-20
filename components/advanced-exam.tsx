"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Clock, ArrowLeft, ArrowRight, Trophy, FileText, AlertCircle, BookOpen, Target, Lightbulb } from "lucide-react"
import type { AdvancedExamQuestion } from "@/data/advanced-exam-questions"
import { generateAdvancedExamPaper } from "@/data/advanced-exam-questions"

interface AdvancedExamProps {
  examType: "definition" | "comparison" | "application" | "comprehensive"
  timeLimit?: number
  onComplete?: (results: AdvancedExamResults) => void
}

interface AdvancedExamResults {
  totalQuestions: number
  totalPoints: number
  earnedPoints: number
  score: number
  timeUsed: number
  answers: Record<string, string>
  feedback: Record<string, string>
}

export function AdvancedExam({ examType, timeLimit = 90, onComplete }: AdvancedExamProps) {
  const [examQuestions, setExamQuestions] = useState<AdvancedExamQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60)
  const [examStarted, setExamStarted] = useState(false)
  const [examCompleted, setExamCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<AdvancedExamResults | null>(null)

  const handleSubmitExam = useCallback(() => {
    const timeUsed = timeLimit * 60 - timeRemaining
    let totalPoints = 0
    let earnedPoints = 0
    const feedback: Record<string, string> = {}

    examQuestions.forEach((question) => {
      totalPoints += question.points
      const userAnswer = answers[question.id] || ""

      if (question.type === "definition") {
        const keywords = (question.referenceAnswer || "").split(/[，,、；;。]/).map(k => k.trim())
        const matchedKeywords = keywords.filter(k => userAnswer.toLowerCase().includes(k.toLowerCase()))
        const pointsEarned = Math.round((matchedKeywords.length / keywords.length) * question.points)
        earnedPoints += pointsEarned

        if (pointsEarned < question.points) {
          feedback[question.id] = `关键点匹配度: ${matchedKeywords.length}/${keywords.length}`
        }
      } else if (question.type === "comparison") {
        const userPoints = userAnswer.split(/[，,、；;。]/).map(p => p.trim())
        const requiredPoints = (question.referenceAnswer || "").split(/[，,、；;。]/).map(p => p.trim())
        const matchedPoints = requiredPoints.filter(p => userPoints.some(up => up.includes(p)))
        const pointsEarned = Math.round((matchedPoints.length / requiredPoints.length) * question.points)
        earnedPoints += pointsEarned

        if (pointsEarned < question.points) {
          feedback[question.id] = `对比点匹配度: ${matchedPoints.length}/${requiredPoints.length}`
        }
      } else if (question.type === "application") {
        const requiredKeywords = (question.referenceAnswer || "").split(/[，,、；;。]/).map(k => k.trim())
        const matchedKeywords = requiredKeywords.filter(k => userAnswer.toLowerCase().includes(k.toLowerCase()))
        const pointsEarned = Math.round((matchedKeywords.length / requiredKeywords.length) * question.points)
        earnedPoints += pointsEarned

        if (pointsEarned < question.points) {
          feedback[question.id] = `应用要点匹配度: ${matchedKeywords.length}/${requiredKeywords.length}`
        }
      }
    })

    const score = Math.round((earnedPoints / totalPoints) * 100)

    const examResults: AdvancedExamResults = {
      totalQuestions: examQuestions.length,
      totalPoints,
      earnedPoints,
      score,
      timeUsed,
      answers,
      feedback,
    }

    setResults(examResults)
    setExamCompleted(true)
    setShowResults(true)
    onComplete?.(examResults)
  }, [answers, examQuestions, timeLimit, timeRemaining, onComplete])

  // 初始化考试
  useEffect(() => {
    let questions: AdvancedExamQuestion[] = []

    switch (examType) {
      case "definition":
        questions = generateAdvancedExamPaper({ definitionCount: 10, comparisonCount: 0, applicationCount: 0 })
        break
      case "comparison":
        questions = generateAdvancedExamPaper({ definitionCount: 0, comparisonCount: 3, applicationCount: 0 })
        break
      case "application":
        questions = generateAdvancedExamPaper({ definitionCount: 0, comparisonCount: 0, applicationCount: 3 })
        break
      case "comprehensive":
        questions = generateAdvancedExamPaper({ definitionCount: 5, comparisonCount: 2, applicationCount: 3 })
        break
    }

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

  const handleStartExam = () => {
    setExamStarted(true)
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const currentQuestion = examQuestions[currentQuestionIndex]

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "definition":
        return <BookOpen className="h-5 w-5" />
      case "comparison":
        return <Target className="h-5 w-5" />
      case "application":
        return <Lightbulb className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getQuestionTypeName = (type: string) => {
    switch (type) {
      case "definition":
        return "名词解释"
      case "comparison":
        return "技术对比"
      case "application":
        return "应用分析"
      default:
        return "综合题"
    }
  }

  if (!examStarted) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {examType === "definition" && "名词解释专项"}
            {examType === "comparison" && "技术对比专项"}
            {examType === "application" && "应用分析专项"}
            {examType === "comprehensive" && "综合能力测试"}
          </CardTitle>
          <CardDescription>生成式人工智能应用工程师（高级）专项练习</CardDescription>
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
              <div className="text-2xl font-bold text-purple-600">
                {examQuestions.reduce((sum, q) => sum + q.points, 0)}
              </div>
              <div className="text-sm text-gray-600">总分</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">答题须知</h4>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• 本考试为主观题，需要详细阐述和分析</li>
                  <li>• 名词解释题需包含定义、特点、应用等要素</li>
                  <li>• 技术对比题建议使用表格形式对比</li>
                  <li>• 应用分析题需结合具体场景和技术实现</li>
                  <li>• 答案需逻辑清晰、表述准确、内容完整</li>
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
              获得 {results.earnedPoints.toFixed(1)} / {results.totalPoints} 分
            </div>
            <div className="text-sm text-gray-500 mt-2">用时：{formatTime(results.timeUsed)}</div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">答题反馈</h3>
            {examQuestions.map((question, index) => (
              <Card key={question.id} className="border-l-4 border-l-indigo-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {getQuestionTypeIcon(question.type)}第{index + 1}题：{getQuestionTypeName(question.type)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{question.question}</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <strong>反馈：</strong>
                    {results.feedback[question.id]}
                  </div>
                  {question.scoringCriteria && (
                    <div className="mt-2">
                      <strong className="text-sm">评分标准：</strong>
                      <ul className="text-xs text-gray-600 mt-1">
                        {question.scoringCriteria.map((criteria, idx) => (
                          <li key={idx}>• {criteria}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              重新考试
            </Button>
            <Button onClick={() => setShowResults(false)}>查看参考答案</Button>
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
              <Badge variant="outline" className="flex items-center gap-1">
                {getQuestionTypeIcon(currentQuestion.type)}
                {getQuestionTypeName(currentQuestion.type)}
              </Badge>
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
            【{getQuestionTypeName(currentQuestion.type)}】（{currentQuestion.points}分）
          </CardTitle>
          <CardDescription className="text-base text-gray-900">{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="answer" className="text-sm font-medium">
                请在下方输入您的答案：
              </Label>
              <Textarea
                id="answer"
                placeholder={
                  currentQuestion.type === "definition"
                    ? "请详细解释该概念的定义、特点、工作原理和应用场景..."
                    : currentQuestion.type === "comparison"
                      ? "请从多个维度进行对比分析，建议使用表格形式..."
                      : "请结合具体场景分析应用方式和技术实现..."
                }
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="min-h-[300px] mt-2"
              />
            </div>

            {currentQuestion.keywords && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">关键词提示：</h4>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500">
              建议答题字数：
              {currentQuestion.type === "definition" && "200-400字"}
              {currentQuestion.type === "comparison" && "300-600字"}
              {currentQuestion.type === "application" && "250-500字"}
            </div>
          </div>
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
