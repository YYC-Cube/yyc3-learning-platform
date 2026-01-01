"use client"

import { useState } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Brain, Trophy, Clock, CheckCircle, PlayCircle, FileText, Users, ArrowLeft } from "lucide-react"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { TouchCard } from "@/components/touch-card"
import Link from "next/link"
import { CourseRecommendations } from "@/components/course-recommendations"
import { LearningPath } from "@/components/learning-path"
import { getCourseRecommendations, getLearningPath } from "@/data/course-recommendations"

// 课程数据结构
const courseData = {
  title: "生成式人工智能应用工程师（高级）",
  totalLessons: 9,
  totalQuestions: 100,
  chapters: [
    {
      id: 1,
      title: "生成式人工智能概述",
      lessons: [
        { id: "1.1", title: "生成式人工智能背景介绍", duration: "45分钟", completed: false },
        { id: "1.2", title: "ChatGPT模型架构与简介", duration: "60分钟", completed: false },
      ],
    },
    {
      id: 2,
      title: "职业道德",
      lessons: [
        { id: "2.1", title: "互联网信息服务深度合成管理规定", duration: "30分钟", completed: false },
        { id: "2.2", title: "人工智能伦理规范", duration: "40分钟", completed: false },
      ],
    },
    {
      id: 3,
      title: "数据安全基础",
      lessons: [{ id: "3.1", title: "数据安全管理体系", duration: "50分钟", completed: false }],
    },
    {
      id: 4,
      title: "提示词工程应用场景",
      lessons: [
        { id: "4.1", title: "个性化推荐系统实现", duration: "45分钟", completed: false },
        { id: "4.2", title: "社交媒体中的提示词工程", duration: "40分钟", completed: false },
        { id: "4.3", title: "在线教育中的提示词工程", duration: "45分钟", completed: false },
        { id: "4.4", title: "智能客服中的提示词工程", duration: "50分钟", completed: false },
        { id: "4.5", title: "其他领域中的提示词工程应用场景", duration: "35分钟", completed: false },
      ],
    },
    {
      id: 5,
      title: "提示词工程中的技术应用",
      lessons: [
        { id: "5.1", title: "分类和要素提取中的提示词优化", duration: "55分钟", completed: false },
        { id: "5.2", title: "文档生成中的提示词优化", duration: "50分钟", completed: false },
        { id: "5.3", title: "RAG中的提示词优化", duration: "60分钟", completed: false },
        { id: "5.4", title: "Agent中的提示词优化", duration: "65分钟", completed: false },
        { id: "5.5", title: "NL2SQL中的提示词优化", duration: "45分钟", completed: false },
      ],
    },
    {
      id: 6,
      title: "提示词工程的创新应用",
      lessons: [
        { id: "6.1", title: "提示词工程的创新方向", duration: "40分钟", completed: false },
        { id: "6.2", title: "提示词工程的跨领域应用", duration: "45分钟", completed: false },
        { id: "6.3", title: "提示词工程的未来展望", duration: "35分钟", completed: false },
      ],
    },
    {
      id: 7,
      title: "提示词工程安全与合规",
      lessons: [
        { id: "7.1", title: "提示词工程中的数据安全", duration: "50分钟", completed: false },
        { id: "7.2", title: "提示词工程中的合规要求", duration: "45分钟", completed: false },
        { id: "7.3", title: "提示词工程中的隐私保护", duration: "40分钟", completed: false },
      ],
    },
    {
      id: 8,
      title: "项目实训",
      lessons: [
        { id: "8.1", title: "大模型应用研发项目需求分析", duration: "70分钟", completed: false },
        { id: "8.2", title: "大模型应用研发项目开发流程及技巧", duration: "80分钟", completed: false },
        { id: "8.3", title: "大模型应用研发项目应用分析", duration: "75分钟", completed: false },
        { id: "8.4", title: "大模型应用项目成果展示与评估", duration: "60分钟", completed: false },
      ],
    },
    {
      id: 9,
      title: "提示词工程团队的组织结构",
      lessons: [
        { id: "9.1", title: "大模型应用研发团队的组织结构", duration: "45分钟", completed: false },
        { id: "9.2", title: "大模型应用研发团队的人员招聘", duration: "40分钟", completed: false },
        { id: "9.3", title: "大模型应用研发团队的绩效考核", duration: "35分钟", completed: false },
      ],
    },
  ],
}

// 练习题数据
const practiceQuestions = [
  {
    id: 1,
    type: "single",
    question: "关于数据安全管理体系，以下哪种说法是正确的？",
    options: [
      "是确保数据实时访问的一组措施、策略和程序",
      "是确保数据在任何情况下都可以共享的一组措施、策略和程序",
      "是组织用于维护数据安全的一组措施、策略和程序",
      "是确保数据完全公开的一组措施、策略和程序",
    ],
    correct: 2,
    chapter: 3,
    explanation: "数据安全管理体系是组织用于维护数据安全的一组措施、策略和程序，旨在保护数据的机密性、完整性和可用性。",
  },
  {
    id: 2,
    type: "single",
    question: "ChatGPT模型的核心架构基于以下哪种技术？",
    options: ["循环神经网络(RNN)", "卷积神经网络(CNN)", "Transformer架构", "支持向量机(SVM)"],
    correct: 2,
    chapter: 1,
    explanation: "ChatGPT基于Transformer架构，这是一种专门为处理序列数据设计的深度学习模型架构。",
  },
  {
    id: 3,
    type: "single",
    question: "在提示词工程中，RAG技术的主要作用是什么？",
    options: [
      "增强模型的计算速度",
      "检索增强生成，结合外部知识库提升回答质量",
      "减少模型参数数量",
      "提高模型的训练效率",
    ],
    correct: 1,
    chapter: 5,
    explanation:
      "RAG（Retrieval-Augmented Generation）是检索增强生成技术，通过结合外部知识库来提升大语言模型回答的准确性和时效性。",
  },
  {
    id: 4,
    type: "single",
    question: "AI应用开发中，以下哪项不是数据安全的核心要素？",
    options: ["数据的机密性", "数据的完整性", "数据的可用性", "数据的娱乐性"],
    correct: 3,
    chapter: 3,
    explanation:
      "数据安全的核心要素包括机密性（Confidentiality）、完整性（Integrity）和可用性（Availability），简称CIA三元组。",
  },
  {
    id: 5,
    type: "single",
    question: "在大模型应用研发团队中，提示词工程师的主要职责是什么？",
    options: ["负责模型的底层算法开发", "专注于提示词设计和优化", "管理团队的日常事务", "负责硬件设备维护"],
    correct: 1,
    chapter: 9,
    explanation: "提示词工程师专门负责设计和优化提示词，以提高大语言模型在特定任务上的表现和输出质量。",
  },
]

export default function AIEngineerLearningSystem() {
  // 在组件开始处添加
  const currentCourseData = getCourseRecommendations("generative-ai-advanced")
  const learningPathCourses = getLearningPath("中级", "专家")
  const [currentTab, setCurrentTab] = useState("overview")
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [testCompleted, setTestCompleted] = useState(false)

  // 计算学习进度
  const totalLessons = courseData.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)
  const progress = (completedLessons.length / totalLessons) * 100

  const markLessonComplete = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId])
    }
  }

  const handleAnswerSubmit = () => {
    if (selectedAnswer === practiceQuestions[currentQuestion].correct) {
      setScore(score + 1)
    }
    setShowResult(true)
  }

  const nextQuestion = () => {
    if (currentQuestion < practiceQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setTestCompleted(true)
    }
  }

  const resetTest = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setTestCompleted(false)
  }

  return (
    <ResponsiveLayout
      title="AI工程师认证"
      user={{ name: "张同学", avatar: "/placeholder.svg?height=40&width=40", level: "中级工程师" }}
    >
      {/* 返回按钮 */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/courses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回课程中心
          </Link>
        </Button>
      </div>

      {/* 头部 */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">🤖 生成式人工智能应用工程师学习系统</h1>
        <p className="text-base sm:text-lg text-gray-600">基于百度智能云课程体系 · 高级认证培训</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-4">
          <Badge variant="secondary" className="text-sm">
            <BookOpen className="w-4 h-4 mr-1" />
            {totalLessons} 个课时
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Brain className="w-4 h-4 mr-1" />
            {practiceQuestions.length} 道练习题
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Trophy className="w-4 h-4 mr-1" />
            高级认证
          </Badge>
        </div>
      </div>

      {/* 学习进度卡片 */}
      <TouchCard className="mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            学习进度总览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>课程完成度</span>
                <span>
                  {completedLessons.length}/{totalLessons} 课时
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
                <div className="text-sm text-gray-600">完成进度</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedLessons.length}</div>
                <div className="text-sm text-gray-600">已完成课时</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{totalLessons - completedLessons.length}</div>
                <div className="text-sm text-gray-600">剩余课时</div>
              </div>
            </div>
          </div>
        </CardContent>
      </TouchCard>

      {/* 主要内容区域 */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">课程概览</span>
            <span className="sm:hidden">概览</span>
          </TabsTrigger>
          <TabsTrigger value="chapters" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">章节学习</span>
            <span className="sm:hidden">学习</span>
          </TabsTrigger>
          <TabsTrigger value="practice" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">练习测试</span>
            <span className="sm:hidden">练习</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">团队管理</span>
            <span className="sm:hidden">团队</span>
          </TabsTrigger>
        </TabsList>

        {/* 课程概览 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courseData.chapters.map((chapter) => (
              <TouchCard key={chapter.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">
                    第{chapter.id}章 {chapter.title}
                  </CardTitle>
                  <CardDescription>{chapter.lessons.length} 个课时</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {chapter.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between text-sm">
                        <span
                          className={`${completedLessons.includes(lesson.id) ? "line-through text-gray-500" : ""} truncate mr-2`}
                        >
                          {lesson.title}
                        </span>
                        {completedLessons.includes(lesson.id) && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Progress
                      value={
                        (chapter.lessons.filter((lesson) => completedLessons.includes(lesson.id)).length /
                          chapter.lessons.length) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </TouchCard>
            ))}
          </div>
        </TabsContent>

        {/* 章节学习 */}
        <TabsContent value="chapters" className="space-y-6">
          {courseData.chapters.map((chapter) => (
            <TouchCard key={chapter.id} className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  第{chapter.id}章 {chapter.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chapter.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {completedLessons.includes(lesson.id) ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <PlayCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">
                            {lesson.id} {lesson.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600">预计学习时间：{lesson.duration}</p>
                        </div>
                      </div>
                      <Button
                        variant={completedLessons.includes(lesson.id) ? "secondary" : "default"}
                        size="sm"
                        onClick={() => markLessonComplete(lesson.id)}
                        disabled={completedLessons.includes(lesson.id)}
                        className="ml-2 flex-shrink-0"
                      >
                        {completedLessons.includes(lesson.id) ? "已完成" : "开始学习"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </TouchCard>
          ))}
        </TabsContent>

        {/* 练习测试 */}
        <TabsContent value="practice" className="space-y-6">
          {testCompleted ? (
            <TouchCard className="bg-white/80 backdrop-blur-sm text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  测试完成！
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-indigo-600">
                    {Math.round((score / practiceQuestions.length) * 100)}分
                  </div>
                  <div className="text-lg text-gray-600">
                    答对 {score} / {practiceQuestions.length} 题
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={resetTest} variant="outline">
                      重新测试
                    </Button>
                    <Button onClick={() => setCurrentTab("overview")}>返回课程</Button>
                  </div>
                </div>
              </CardContent>
            </TouchCard>
          ) : (
            <TouchCard className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>练习测试</span>
                  <Badge variant="outline">
                    题目 {currentQuestion + 1} / {practiceQuestions.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  当前得分：{score}/{currentQuestion + (showResult ? 1 : 0)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {practiceQuestions[currentQuestion] && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-medium mb-4">
                        {practiceQuestions[currentQuestion].question}
                      </h3>
                      <div className="space-y-3">
                        {practiceQuestions[currentQuestion].options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => !showResult && setSelectedAnswer(index)}
                            className={`w-full text-left p-3 sm:p-4 border rounded-lg transition-colors text-sm sm:text-base ${
                              selectedAnswer === index
                                ? showResult
                                  ? index === practiceQuestions[currentQuestion].correct
                                    ? "bg-green-100 border-green-500"
                                    : "bg-red-100 border-red-500"
                                  : "bg-blue-100 border-blue-500"
                                : showResult && index === practiceQuestions[currentQuestion].correct
                                  ? "bg-green-100 border-green-500"
                                  : "hover:bg-gray-50"
                            }`}
                            disabled={showResult}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {showResult && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">解析：</h4>
                        <p className="text-blue-800 text-sm sm:text-base">
                          {practiceQuestions[currentQuestion].explanation}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button variant="outline" disabled>
                        上一题
                      </Button>
                      {!showResult ? (
                        <Button onClick={handleAnswerSubmit} disabled={selectedAnswer === null}>
                          提交答案
                        </Button>
                      ) : (
                        <Button onClick={nextQuestion}>
                          {currentQuestion < practiceQuestions.length - 1 ? "下一题" : "完成测试"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </TouchCard>
          )}
        </TabsContent>

        {/* 团队管理 */}
        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TouchCard className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>团队组织结构</CardTitle>
                <CardDescription>大模型应用研发团队的标准配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                    <h4 className="font-medium">技术负责人</h4>
                    <p className="text-sm text-gray-600">负责技术架构和团队管理</p>
                  </div>
                  <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                    <h4 className="font-medium">提示词工程师</h4>
                    <p className="text-sm text-gray-600">专注于提示词设计和优化</p>
                  </div>
                  <div className="p-3 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
                    <h4 className="font-medium">AI应用开发工程师</h4>
                    <p className="text-sm text-gray-600">负责AI应用的开发和集成</p>
                  </div>
                  <div className="p-3 border-l-4 border-orange-500 bg-orange-50 rounded-r-lg">
                    <h4 className="font-medium">数据安全专员</h4>
                    <p className="text-sm text-gray-600">确保数据安全和合规性</p>
                  </div>
                </div>
              </CardContent>
            </TouchCard>

            <TouchCard className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>绩效考核指标</CardTitle>
                <CardDescription>团队成员的评估标准</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>技术能力</span>
                    <Badge variant="secondary">30%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>项目交付</span>
                    <Badge variant="secondary">25%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>创新能力</span>
                    <Badge variant="secondary">20%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>团队协作</span>
                    <Badge variant="secondary">15%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>学习成长</span>
                    <Badge variant="secondary">10%</Badge>
                  </div>
                </div>
              </CardContent>
            </TouchCard>
          </div>

          {/* 招聘指南 */}
          <TouchCard className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>人员招聘指南</CardTitle>
              <CardDescription>不同岗位的技能要求和面试要点</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-blue-600">技术技能要求</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• 熟悉大语言模型原理和应用</li>
                    <li>• 掌握Python、JavaScript等编程语言</li>
                    <li>• 了解机器学习和深度学习框架</li>
                    <li>• 具备API集成和系统架构经验</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-green-600">软技能要求</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• 良好的沟通协作能力</li>
                    <li>• 持续学习和适应能力</li>
                    <li>• 问题分析和解决能力</li>
                    <li>• 创新思维和实践能力</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </TouchCard>
        </TabsContent>
      </Tabs>
      {/* 课程推荐和学习路径 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {currentCourseData && <CourseRecommendations currentCourse={currentCourseData} />}
        <LearningPath courses={learningPathCourses} currentCourseId="generative-ai-advanced" />
      </div>
    </ResponsiveLayout>
  )
}
