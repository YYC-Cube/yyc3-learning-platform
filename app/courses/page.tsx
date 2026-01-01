"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Clock,
  Users,
  Star,
  Play,
  Brain,
  BookOpen,
  TrendingUp,
  Award,
  CheckCircle,
  BarChart3,
  Layers,
  Code,
  MessageSquare,
  Lightbulb,
  Heart,
} from "lucide-react"
import Link from "next/link"
import { courseData } from "@/data/course-data"
import { CourseImage } from "@/components/course-image"
import { ResponsiveLayout } from "@/components/responsive-layout"

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [selectedLevel, setSelectedLevel] = useState("全部")
  const [selectedTab, setSelectedTab] = useState("推荐")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])

  // 模拟加载收藏数据
  useEffect(() => {
    setFavorites([2, 5, 8])
  }, [])

  const toggleFavorite = (courseId: number) => {
    setFavorites((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]))
  }

  const categories = ["全部", "基础理论", "Prompt工程", "模型应用", "开发实战", "高级进阶", "行业应用", "认证课程"]
  const levels = ["全部", "入门", "初级", "中级", "高级", "专家"]

  // 根据选项卡筛选课程
  const getFilteredCourses = () => {
    let filtered = courseData

    // 根据选项卡筛选
    if (selectedTab === "热门") {
      filtered = filtered.sort((a, b) => b.students - a.students)
    } else if (selectedTab === "最新") {
      filtered = filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
    } else if (selectedTab === "免费") {
      filtered = filtered.filter((course) => course.price === "免费")
    } else if (selectedTab === "收藏") {
      filtered = filtered.filter((course) => favorites.includes(course.id))
    }

    // 应用搜索和筛选
    return filtered.filter((course) => {
      const matchesSearch =
        searchTerm === "" ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "全部" || course.category === selectedCategory
      const matchesLevel = selectedLevel === "全部" || course.level === selectedLevel

      return matchesSearch && matchesCategory && matchesLevel
    })
  }

  const filteredCourses = getFilteredCourses()

  const getLevelColor = (level: string) => {
    switch (level) {
      case "入门":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      case "初级":
        return "bg-green-100 text-green-800 border border-green-200"
      case "中级":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "高级":
        return "bg-orange-100 text-orange-800 border border-orange-200"
      case "专家":
        return "bg-purple-100 text-purple-800 border border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "基础理论":
        return <BookOpen className="h-4 w-4" />
      case "Prompt工程":
        return <MessageSquare className="h-4 w-4" />
      case "模型应用":
        return <Layers className="h-4 w-4" />
      case "开发实战":
        return <Code className="h-4 w-4" />
      case "高级进阶":
        return <TrendingUp className="h-4 w-4" />
      case "行业应用":
        return <BarChart3 className="h-4 w-4" />
      case "认证课程":
        return <Award className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <ResponsiveLayout
      title="课程中心"
      user={{
        name: "YanYu同学",
        avatar: "/user/User_61.png",
        level: "中级工程师",
      }}
    >
      <div>
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">AI学习中心</h1>
          <p className="text-gray-600">探索丰富的AI课程，提升您的专业技能</p>
        </div>

        {/* 选项卡 */}
        <Tabs defaultValue="推荐" className="mb-6" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-5 mb-4 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-indigo-100">
            <TabsTrigger value="推荐" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-lg">推荐</TabsTrigger>
            <TabsTrigger value="热门" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-lg">热门</TabsTrigger>
            <TabsTrigger value="最新" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-lg">最新</TabsTrigger>
            <TabsTrigger value="免费" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-lg">免费</TabsTrigger>
            <TabsTrigger value="收藏" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-lg">收藏</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 搜索和筛选 */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="搜索课程、讲师或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center space-x-2 border-gray-300 text-gray-700"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4" />
              <span>高级筛选</span>
            </Button>
          </div>

          {/* 高级筛选面板 */}
          {isFilterOpen && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-3">课程筛选</h3>

              <div className="mb-4">
                <h4 className="text-sm text-gray-600 mb-2">课程分类</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`${
                        selectedCategory === category ? "bg-blue-600 text-white" : "border-gray-300 text-gray-700"
                      } whitespace-nowrap`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-600 mb-2">难度级别</h4>
                <div className="flex flex-wrap gap-2">
                  {levels.map((level) => (
                    <Button
                      key={level}
                      variant={selectedLevel === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLevel(level)}
                      className={`${
                        selectedLevel === level ? "bg-blue-600 text-white" : "border-gray-300 text-gray-700"
                      } whitespace-nowrap`}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 分类标签 - 简化版 */}
          <div className="flex overflow-x-auto pb-2 gap-2">
            {categories.slice(0, 6).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category ? "bg-blue-600 text-white" : "border-gray-300 text-gray-700"
                } whitespace-nowrap`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* 课程统计 */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            找到 <span className="font-medium text-gray-800">{filteredCourses.length}</span> 个课程
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">排序:</span>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>推荐</option>
              <option>最新</option>
              <option>评分</option>
              <option>学习人数</option>
            </select>
          </div>
        </div>

        {/* 课程网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="hover:shadow-xl transition-all duration-300 bg-white border border-gray-200 shadow-md overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <CourseImage
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  title={course.title}
                  color={course.color}
                />
                <div className="absolute top-4 left-4">
                  <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge className="bg-white text-gray-800 border border-gray-300">{course.price}</Badge>
                  {course.isNew && <Badge className="bg-blue-600 text-white">新课</Badge>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-700 hover:text-red-500 rounded-full h-8 w-8 p-1.5"
                  onClick={(e) => {
                    e.preventDefault()
                    toggleFavorite(course.id)
                  }}
                >
                  <Heart
                    className={`h-full w-full ${favorites.includes(course.id) ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>
                {course.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-900/80 text-white p-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>学习进度</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-gray-800 hover:text-blue-600 transition-colors">
                    <Link href={`/courses/${course.id}`} className="hover:underline">
                      {course.title}
                    </Link>
                  </CardTitle>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  {getCategoryIcon(course.category)}
                  <span className="ml-1">{course.category}</span>
                </div>
                <CardDescription className="line-clamp-2 mt-2">{course.description}</CardDescription>
              </CardHeader>

              <CardContent className="pb-2">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.students.toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {course.rating}
                  </span>
                </div>

                {/* 课程亮点 */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">课程亮点</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {course.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1.5 flex-shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-gray-300 text-gray-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-700">
                      讲师: <span className="font-medium">{course.instructor}</span>
                    </span>
                    <span className="text-sm text-gray-700">{course.chapters}章节</span>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link href={`/courses/${course.id}`} className="inline-flex items-center justify-center gap-2">
                      <Play className="h-4 w-4 mr-2" />
                      {course.progress > 0 ? "继续学习" : "开始学习"}
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">未找到相关课程</h3>
            <p className="text-gray-600 mb-4">请尝试调整搜索条件或浏览其他分类</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("全部")
                setSelectedLevel("全部")
                setSelectedTab("推荐")
              }}
            >
              重置筛选条件
            </Button>
          </div>
        )}

        {/* 课程推荐 */}
        {filteredCourses.length > 0 && selectedTab === "推荐" && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              为您推荐
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-800">学习路径: AI应用开发工程师</CardTitle>
                  <CardDescription>系统化学习，成为AI应用开发专家</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">6门课程</Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">120学时</Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">认证课程</Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs mr-2">
                        1
                      </div>
                      <span className="text-gray-700">大模型基础理论</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">
                        2
                      </div>
                      <span className="text-gray-700">Prompt工程实战</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-blue-400 text-white flex items-center justify-center text-xs mr-2">
                        3
                      </div>
                      <span className="text-gray-700">AI应用开发框架</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">查看学习路径</Button>
                </CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
                <CardHeader>
                  <CardTitle className="text-purple-800">热门认证: 生成式AI工程师</CardTitle>
                  <CardDescription>获得行业认可的专业资格认证</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">官方认证</Badge>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">高薪岗位</Badge>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">就业保障</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="text-gray-700">3级认证体系</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-gray-700">5000+学员</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full mb-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 w-3/4"></div>
                  </div>
                  <p className="text-xs text-gray-500">75%的学员完成认证后薪资提升30%以上</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    了解认证详情
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  )
}
