"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { ProfessionalExam } from "@/components/professional-exam"
import { ComprehensiveExam } from "@/components/comprehensive-exam"
import { generateClassificationExam } from "@/data/comprehensive-exam-questions"
import { FileText, Trophy, Clock, Target, BookOpen, Award, TrendingUp, Brain, Layers } from "lucide-react"

export default function ProfessionalExamPage() {
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null)
  const [examQuestions, setExamQuestions] = useState<any[]>([])
  const [examResults, setExamResults] = useState<any[]>([])

  // AI大模型分类专项考试
  const classificationExamTypes = [
    {
      type: "model-architecture",
      title: "模型架构分类专项",
      description: "语言模型、视觉模型、多模态模型分类",
      duration: 90,
      questions: 15,
      points: 75,
      icon: Brain,
      color: "from-blue-500 to-blue-600",
    },
    {
      type: "training-methods",
      title: "训练方式分类专项",
      description: "有监督、无监督、预训练+微调等方式",
      duration: 80,
      questions: 12,
      points: 60,
      icon: Layers,
      color: "from-green-500 to-green-600",
    },
    {
      type: "application-scenarios",
      title: "应用场景分类专项",
      description: "文本生成、图像生成、对话系统等应用",
      duration: 70,
      questions: 10,
      points: 50,
      icon: Target,
      color: "from-purple-500 to-purple-600",
    },
    {
      type: "comprehensive-classification",
      title: "AI大模型分类综合测试",
      description: "全面考查AI大模型分类体系知识",
      duration: 120,
      questions: 25,
      points: 125,
      icon: Trophy,
      color: "from-orange-500 to-orange-600",
    },
  ]

  const basicExamTypes = [
    {
      type: "practice" as const,
      title: "练习测试",
      description: "快速练习，检验学习效果",
      duration: 60,
      questions: 35,
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
    },
    {
      type: "mock" as const,
      title: "模拟考试",
      description: "完整模拟，熟悉考试流程",
      duration: 90,
      questions: 60,
      icon: Target,
      color: "from-green-500 to-green-600",
    },
    {
      type: "formal" as const,
      title: "正式考试",
      description: "官方认证，获得专业证书",
      duration: 120,
      questions: 85,
      icon: Award,
      color: "from-purple-500 to-purple-600",
    },
  ]

  const handleExamComplete = (results: any) => {
    setExamResults((prev) => [results, ...prev])
  }

  const handleStartExam = (examType: string) => {
    let questions: any[] = []

    // 根据考试类型生成题目
    if (examType === "model-architecture") {
      questions = generateClassificationExam({
        classifications: ["模型架构分类"],
        questionTypes: ["single", "multiple", "definition"],
        difficulty: ["初级", "中级"],
        questionCount: 15,
      })
    } else if (examType === "training-methods") {
      questions = generateClassificationExam({
        classifications: ["训练方式分类"],
        questionTypes: ["single", "multiple", "comparison"],
        difficulty: ["中级", "高级"],
        questionCount: 12,
      })
    } else if (examType === "application-scenarios") {
      questions = generateClassificationExam({
        classifications: ["应用场景分类"],
        questionTypes: ["single", "multiple", "application"],
        difficulty: ["初级", "中级"],
        questionCount: 10,
      })
    } else if (examType === "comprehensive-classification") {
      questions = generateClassificationExam({
        classifications: [
          "模型架构分类",
          "训练方式分类",
          "应用场景分类",
          "规模大小分类",
          "开源状态分类",
          "技术发展阶段",
        ],
        questionTypes: ["single", "multiple", "essay", "definition", "comparison"],
        difficulty: ["初级", "中级", "高级"],
        questionCount: 25,
      })
    }

    setExamQuestions(questions)
    setSelectedExamType(examType)
  }

  const isClassificationExam = (type: string) => {
    return ["model-architecture", "training-methods", "application-scenarios", "comprehensive-classification"].includes(
      type,
    )
  }

  if (selectedExamType) {
    return (
      <ResponsiveLayout
        title="专业考试"
        user={{ name: "张同学", avatar: "/placeholder.svg?height=40&width=40", level: "中级工程师" }}
      >
        <div className="mb-4">
          <Button variant="ghost" onClick={() => setSelectedExamType(null)}>
            ← 返回考试选择
          </Button>
        </div>
        {isClassificationExam(selectedExamType) ? (
          <ComprehensiveExam examType={selectedExamType} questions={examQuestions} onComplete={handleExamComplete} />
        ) : (
          <ProfessionalExam examType={selectedExamType as any} onComplete={handleExamComplete} />
        )}
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout
      title="专业考试"
      user={{ name: "张同学", avatar: "/placeholder.svg?height=40&width=40", level: "中级工程师" }}
    >
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">生成式AI应用工程师专业考试</h1>
        <p className="text-gray-600">通过专业考试，验证您的AI技能水平，获得权威认证</p>
      </div>

      <Tabs defaultValue="classification" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="classification">模型分类</TabsTrigger>
          <TabsTrigger value="basic">基础考试</TabsTrigger>
          <TabsTrigger value="results">考试记录</TabsTrigger>
          <TabsTrigger value="certificates">证书管理</TabsTrigger>
        </TabsList>

        {/* AI大模型分类专项考试 */}
        <TabsContent value="classification" className="space-y-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI大模型分类专项测试</h2>
            <p className="text-gray-600">全面考查AI大模型的分类体系和技术特点，涵盖模型架构、训练方式、应用场景等</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {classificationExamTypes.map((exam) => {
              const Icon = exam.icon
              return (
                <Card
                  key={exam.type}
                  className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  onClick={() => handleStartExam(exam.type)}
                >
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`mx-auto w-14 h-14 rounded-full bg-gradient-to-r ${exam.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors">
                      {exam.title}
                    </CardTitle>
                    <CardDescription className="text-sm">{exam.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 text-gray-600 mr-1" />
                          时长
                        </span>
                        <span className="font-medium">{exam.duration}分钟</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="flex items-center">
                          <FileText className="h-3 w-3 text-gray-600 mr-1" />
                          题数
                        </span>
                        <span className="font-medium">{exam.questions}题</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="flex items-center">
                          <Trophy className="h-3 w-3 text-gray-600 mr-1" />
                          总分
                        </span>
                        <span className="font-medium">{exam.points}分</span>
                      </div>
                    </div>
                    <Button
                      className={`w-full bg-gradient-to-r ${exam.color} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all text-sm`}
                    >
                      开始测试
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* AI大模型分类考试说明 */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI大模型分类考试说明
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">考试内容</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 模型架构分类：语言模型、视觉模型、多模态模型</li>
                    <li>• 训练方式分类：有监督、无监督、预训练+微调</li>
                    <li>• 应用场景分类：文本生成、图像生成、对话系统</li>
                    <li>• 规模大小分类：小型、中型、大型模型特点</li>
                    <li>• 开源状态分类：开源与闭源模型对比</li>
                    <li>• 技术发展阶段：三代AI模型演进历程</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">题型特点</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 单选题：基础概念和技术特点识别</li>
                    <li>• 多选题：综合知识点和应用场景</li>
                    <li>• 名词解释：核心概念深度理解</li>
                    <li>• 对比分析：不同技术路线的异同</li>
                    <li>• 应用分析：实际场景中的技术选择</li>
                    <li>• 综合论述：技术发展趋势分析</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 基础考试 */}
        <TabsContent value="basic" className="space-y-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">基础能力测试</h2>
            <p className="text-gray-600">选择题为主的基础能力评估，适合初学者和技能验证</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {basicExamTypes.map((exam) => {
              const Icon = exam.icon
              return (
                <Card
                  key={exam.type}
                  className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedExamType(exam.type)}
                >
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${exam.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                      {exam.title}
                    </CardTitle>
                    <CardDescription>{exam.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-600 mb-1" />
                        <span className="font-medium">{exam.duration}分钟</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-4 w-4 text-gray-600 mb-1" />
                        <span className="font-medium">{exam.questions}题</span>
                      </div>
                    </div>
                    <Button
                      className={`w-full bg-gradient-to-r ${exam.color} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all`}
                    >
                      开始{exam.title}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* 考试记录 */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                考试记录
              </CardTitle>
              <CardDescription>您的历史考试成绩和表现分析</CardDescription>
            </CardHeader>
            <CardContent>
              {examResults.length > 0 ? (
                <div className="space-y-4">
                  {examResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            result.percentage >= 90
                              ? "bg-green-100 text-green-600"
                              : result.percentage >= 80
                                ? "bg-blue-100 text-blue-600"
                                : result.percentage >= 60
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-red-100 text-red-600"
                          }`}
                        >
                          <span className="font-bold">{result.percentage}%</span>
                        </div>
                        <div>
                          <h4 className="font-medium">最近考试</h4>
                          <p className="text-sm text-gray-600">
                            刚刚完成 • 用时 {Math.floor(result.timeUsed / 60)} 分钟
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            result.percentage >= 90
                              ? "default"
                              : result.percentage >= 80
                                ? "secondary"
                                : result.percentage >= 60
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {result.percentage >= 90
                            ? "优秀"
                            : result.percentage >= 80
                              ? "良好"
                              : result.percentage >= 60
                                ? "及格"
                                : "不及格"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          查看详情
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无考试记录</p>
                  <p className="text-sm">完成考试后，记录将显示在这里</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 证书管理 */}
        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-indigo-600" />
                我的证书
              </CardTitle>
              <CardDescription>您获得的专业认证证书</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无证书</h3>
                <p className="text-gray-600 mb-4">完成正式考试后，您将获得专业认证证书</p>
                <Button
                  onClick={() => setSelectedExamType("formal")}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                >
                  参加正式考试
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ResponsiveLayout>
  )
}
