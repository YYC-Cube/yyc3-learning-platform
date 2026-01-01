"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { LearningPath } from "@/components/learning-path"
import { courseModules, getLearningPath } from "@/data/course-recommendations"
import { Target, TrendingUp, BookOpen, Award, ArrowRight } from "lucide-react"

export default function LearningPathPage() {
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [currentLevel, setCurrentLevel] = useState("初级")
  const [targetLevel, setTargetLevel] = useState("高级")

  const categories = ["全部", "认证课程", "实战开发", "通识认知", "专项技术", "行业应用"]
  const levels = ["初级", "中级", "高级", "专家"]

  const filteredCourses = courseModules.filter(
    (course) => selectedCategory === "全部" || course.category === selectedCategory,
  )

  const recommendedPath = getLearningPath(currentLevel, targetLevel)

  const pathStats = {
    totalCourses: recommendedPath.length,
    totalHours: recommendedPath.reduce((sum, course) => sum + Number.parseInt(course.duration), 0),
    categories: [...new Set(recommendedPath.map((course) => course.category))].length,
  }

  return (
    <ResponsiveLayout
      title="学习路径"
      user={{ name: "张同学", avatar: "/placeholder.svg?height=40&width=40", level: "中级工程师" }}
    >
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">AI学习路径规划</h1>
        <p className="text-gray-600">基于您的当前水平和目标，为您定制专业的学习路径</p>
      </div>

      {/* 路径配置 */}
      <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            路径定制
          </CardTitle>
          <CardDescription>选择您的当前水平和目标水平，系统将为您生成最优学习路径</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">当前水平</label>
              <Select value={currentLevel} onValueChange={setCurrentLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">目标水平</label>
              <Select value={targetLevel} onValueChange={setTargetLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">学习统计</label>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {pathStats.totalCourses} 门课程
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />约 {pathStats.totalHours} 小时
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  {pathStats.categories} 个领域
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommended" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
          <TabsTrigger value="recommended">推荐路径</TabsTrigger>
          <TabsTrigger value="all-courses">全部课程</TabsTrigger>
          <TabsTrigger value="career-paths">职业路径</TabsTrigger>
        </TabsList>

        {/* 推荐路径 */}
        <TabsContent value="recommended">
          <LearningPath courses={recommendedPath} currentCourseId="generative-ai-advanced" />
        </TabsContent>

        {/* 全部课程 */}
        <TabsContent value="all-courses" className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <Badge variant="outline" className="ml-2 whitespace-nowrap">
                      {course.level}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>⏱️ {course.duration}</span>
                      <span>📂 {course.category}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {course.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-blue-600 mb-2">🔍 下一步：{course.nextRecommendations.primary}</p>
                      <Button size="sm" className="w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        开始学习
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 职业路径 */}
        <TabsContent value="career-paths" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI工程师路径 */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">AI工程师路径</CardTitle>
                <CardDescription>从基础到高级的完整AI工程师培养路径</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>生成式AI应用工程师（初级）</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span>生成式AI应用工程师（中级）</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span>AI大模型工程师</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span>AI大模型高级工程师</span>
                  </div>
                  <Button size="sm" className="w-full mt-4">
                    查看详细路径
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 行业应用专家路径 */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">行业应用专家路径</CardTitle>
                <CardDescription>专注于特定行业AI应用的专家路径</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>通识认知应用系列</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span>领域应用实践系列</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span>行业应用实践系列</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span>AI治理与政策合规认证</span>
                  </div>
                  <Button size="sm" className="w-full mt-4">
                    查看详细路径
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 技术架构师路径 */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-900">技术架构师路径</CardTitle>
                <CardDescription>面向系统架构和技术管理的高级路径</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>实战开发系列</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span>AI基础设施系列</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span>模型训练推理系列</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span>系统架构师认证</span>
                  </div>
                  <Button size="sm" className="w-full mt-4">
                    查看详细路径
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ResponsiveLayout>
  )
}
