"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Trophy, Target, Zap } from "lucide-react"
import { ResponsiveLayout } from "@/components/responsive-layout"
import Link from "next/link"

export default function PracticePage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [answers, setAnswers] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [testStarted, setTestStarted] = useState(false)

  const practiceTests = [
    {
      id: 1,
      title: "GPT基础概念测试",
      description: "测试您对GPT模型基础概念的理解",
      questions: 15,
      duration: 20,
      difficulty: "初级",
      category: "理论基础",
      points: 100,
    },
    {
      id: 2,
      title: "Prompt工程实战",
      description: "评估您的提示词设计和优化能力",
      questions: 20,
      duration: 30,
      difficulty: "中级",
      category: "Prompt工程",
      points: 150,
    },
    {
      id: 3,
      title: "AI应用开发综合测试",
      description: "全面测试AI应用开发的各个方面",
      questions: 25,
      duration: 45,
      difficulty: "高级",
      category: "开发实战",
      points: 200,
    },
  ]

  const questions = [
    {
      id: 1,
      question: '什么是GPT模型中的"Transformer"架构的核心特点？',
      options: [
        "基于循环神经网络的序列处理",
        "使用注意力机制处理序列数据",
        "采用卷积神经网络提取特征",
        "结合强化学习优化输出",
      ],
      correct: 1,
      explanation: "Transformer架构的核心是自注意力机制，它能够并行处理序列中的所有位置，捕捉长距离依赖关系。",
    },
    {
      id: 2,
      question: '在Prompt工程中，"Few-shot Learning"指的是什么？',
      options: ["使用少量参数训练模型", "在提示中提供少量示例来指导模型", "减少模型的训练时间", "限制模型的输出长度"],
      correct: 1,
      explanation: "Few-shot Learning是指在提示词中提供少量示例，帮助模型理解任务要求并生成期望的输出格式。",
    },
    {
      id: 3,
      question: "以下哪个不是大语言模型的常见应用场景？",
      options: ["文本生成和摘要", "代码生成和调试", "图像识别和分类", "对话系统和问答"],
      correct: 2,
      explanation: "图像识别和分类主要是计算机视觉任务，通常使用CNN等架构，而不是大语言模型的主要应用领域。",
    },
  ]

  const handleStartTest = () => {
    setTestStarted(true)
    setCurrentQuestion(0)
    setAnswers([])
    setShowResult(false)
  }

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value)
  }

  const handleNextQuestion = () => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = selectedAnswer
    setAnswers(newAnswers)
    setSelectedAnswer("")

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResult(true)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1] || "")
    }
  }

  const calculateScore = () => {
    let correct = 0
    answers.forEach((answer, index) => {
      if (Number.parseInt(answer) === questions[index].correct) {
        correct++
      }
    })
    return Math.round((correct / questions.length) * 100)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "初级":
        return "bg-green-100 text-green-800"
      case "中级":
        return "bg-yellow-100 text-yellow-800"
      case "高级":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!testStarted) {
    return (
      <ResponsiveLayout
        title="练习测试"
        user={{ name: "YanYu同学", avatar: "/placeholder.svg?height=40&width=40", level: "中级工程师" }}
      >
        <div className="pb-20">
          {/* 返回按钮 */}
          <div className="mb-4">
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link href="/" className="inline-flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回首页
              </Link>
            </Button>
          </div>

          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">练习测试中心</h1>
            <p className="text-gray-600">通过测试检验您的学习成果，获得学习积分</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {practiceTests.map((test) => (
              <Card
                key={test.id}
                className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-base sm:text-lg group-hover:text-indigo-600 transition-colors">
                      {test.title}
                    </CardTitle>
                    <Badge className={getDifficultyColor(test.difficulty)}>{test.difficulty}</Badge>
                  </div>
                  <CardDescription>{test.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        {test.questions} 题目
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {test.duration} 分钟
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>分类：{test.category}</span>
                      <span className="flex items-center text-yellow-600">
                        <Trophy className="h-4 w-4 mr-1" />
                        {test.points} 积分
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    onClick={handleStartTest}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    开始测试
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ResponsiveLayout>
    )
  }

  if (showResult) {
    const score = calculateScore()
    const correctAnswers = answers.filter(
      (answer, index) => Number.parseInt(answer) === questions[index].correct,
    ).length

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        {/* 返回按钮 - 固定在左上角 */}
        <div className="fixed top-4 left-4 z-10">
          <Button variant="outline" asChild className="flex items-center gap-2 bg-white/90 backdrop-blur-sm">
            <Link href="/practice" className="inline-flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回测试列表
            </Link>
          </Button>
        </div>

        <Card className="w-full max-w-2xl shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="mx-auto mb-4">
              {score >= 80 ? (
                <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500" />
              ) : score >= 60 ? (
                <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500" />
              ) : (
                <XCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-xl sm:text-2xl">测试完成！</CardTitle>
            <CardDescription>您的测试结果如下</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="text-4xl font-bold text-indigo-600">{score}分</div>
            <div className="text-lg text-gray-600">
              答对 {correctAnswers} / {questions.length} 题
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">答题详情</h3>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>第 {index + 1} 题</span>
                    {Number.parseInt(answers[index]) === question.correct ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setTestStarted(false)} className="flex-1">
                返回测试列表
              </Button>
              <Button
                onClick={handleStartTest}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                重新测试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* 返回按钮 - 固定在左上角 */}
      <div className="fixed top-4 left-4 z-10">
        <Button variant="outline" asChild className="flex items-center gap-2 bg-white/90 backdrop-blur-sm">
          <Link href="/practice" className="inline-flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回测试
          </Link>
        </Button>
      </div>

      <div className="max-w-4xl mx-auto pt-16">
        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              题目 {currentQuestion + 1} / {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              <Clock className="h-4 w-4 inline mr-1" />
              剩余时间: 15:30
            </span>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
        </div>

        {/* 题目卡片 - 增加触摸友好的间距 */}
        <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">{questions[currentQuestion].question}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
              {questions[currentQuestion].options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-4 rounded-lg hover:bg-gray-50 transition-colors mb-2 last:mb-0"
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* 导航按钮 - 增加大小和间距 */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestion === 0} className="h-12 px-5">
            <ArrowLeft className="h-4 w-4 mr-2" />
            上一题
          </Button>
          <Button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-12 px-5"
          >
            {currentQuestion === questions.length - 1 ? "完成测试" : "下一题"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
