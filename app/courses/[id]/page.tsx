"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle,
  FileText,
  MessageSquare,
  Award,
  Download,
  Share2,
  Heart,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { courseData } from "@/data/course-data"

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = Number(params.id)
  const course = courseData.find((c) => c.id === courseId)

  const [isExpanded, setIsExpanded] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">课程未找到</h1>
          <p className="text-gray-600 mb-6">抱歉，您请求的课程不存在或已被移除</p>
          <Button asChild>
            <Link href="/courses" className="inline-flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回课程列表
            </Link>
          </Button>
        </div>
      </div>
    )
  }

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button variant="ghost" className="text-gray-600 hover:text-gray-900" asChild>
            <Link href="/courses" className="inline-flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回课程列表
            </Link>
          </Button>
        </div>

        {/* 课程头部 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="relative h-64 sm:h-80">
            <img src={course.image || "/placeholder.svg"} alt={course.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 text-white w-full">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                  <Badge className="bg-white text-gray-800">{course.price}</Badge>
                  {course.isNew && <Badge className="bg-blue-600 text-white">新课</Badge>}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{course.title}</h1>
                <p className="text-gray-200 mb-4">{course.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.students.toLocaleString()}人学习
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    {course.rating}分
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {course.chapters}章节
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作栏 */}
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center">
                <img
                  src="/placeholder.svg?height=40&width=40"
                  alt={course.instructor}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium text-gray-900">{course.instructor}</p>
                  <p className="text-sm text-gray-600">课程讲师</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Download className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧内容 */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="mb-6">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">课程概览</TabsTrigger>
                <TabsTrigger value="curriculum">课程大纲</TabsTrigger>
                <TabsTrigger value="instructor">讲师介绍</TabsTrigger>
                <TabsTrigger value="reviews">学员评价</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">课程介绍</h2>
                <p className="text-gray-700 mb-6">{course.description}</p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">课程亮点</h3>
                <ul className="space-y-2 mb-6">
                  {course.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>

                {course.objectives && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">学习目标</h3>
                    <ul className="space-y-2 mb-6">
                      {course.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {course.prerequisites && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">课程前提</h3>
                    <ul className="space-y-2 mb-6">
                      {course.prerequisites.map((prerequisite, index) => (
                        <li key={index} className="flex items-start">
                          <FileText className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{prerequisite}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <h3 className="text-lg font-semibold text-gray-800 mb-3">适合人群</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">AI初学者</h4>
                    <p className="text-sm text-gray-700">希望了解AI基础知识和应用场景的初学者</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">开发人员</h4>
                    <p className="text-sm text-gray-700">想要将AI技术应用到实际项目中的开发者</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">产品经理</h4>
                    <p className="text-sm text-gray-700">需要了解AI产品规划和设计的产品人员</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">企业管理者</h4>
                    <p className="text-sm text-gray-700">希望了解AI技术如何赋能企业的管理人员</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-gray-700 border-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="curriculum" className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">课程大纲</h2>
                <p className="text-gray-600 mb-6">
                  本课程包含 {course.chapters} 个章节，总时长 {course.duration}
                </p>

                {course.syllabus ? (
                  <div className="space-y-4">
                    {course.syllabus.map((section, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 flex items-center justify-between">
                          <h3 className="font-medium text-gray-800">{section.title}</h3>
                          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                        {isExpanded && (
                          <div className="p-4 space-y-2">
                            {section.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lessonIndex}
                                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                              >
                                <div className="flex items-center">
                                  <Play className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-gray-700">{lesson.title}</span>
                                </div>
                                <span className="text-sm text-gray-500">{lesson.duration}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-800 mb-1">课程大纲准备中</h3>
                    <p className="text-gray-600">详细课程大纲即将上线，敬请期待</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="instructor" className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <img
                    src="/placeholder.svg?height=80&width=80"
                    alt={course.instructor}
                    className="w-20 h-20 rounded-full mr-4"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">{course.instructor}</h2>
                    <p className="text-gray-600 mb-2">AI领域资深专家</p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-gray-700 mr-3">4.9 讲师评分</span>
                      <Users className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-gray-700">5000+ 学员</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">
                  {course.instructor}
                  是人工智能领域的资深专家，拥有超过10年的行业经验。曾在多家知名科技公司担任技术负责人，
                  参与开发了多个大型AI项目。擅长将复杂的AI概念转化为易于理解的内容，帮助学员快速掌握AI技术。
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">专业领域</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-blue-100 text-blue-800 border border-blue-200">大语言模型</Badge>
                  <Badge className="bg-blue-100 text-blue-800 border border-blue-200">自然语言处理</Badge>
                  <Badge className="bg-blue-100 text-blue-800 border border-blue-200">AI应用开发</Badge>
                  <Badge className="bg-blue-100 text-blue-800 border border-blue-200">企业AI解决方案</Badge>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">其他课程</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {courseData.slice(0, 2).map((relatedCourse) => (
                    <Card key={relatedCourse.id} className="overflow-hidden">
                      <div className="h-32 overflow-hidden">
                        <img
                          src={relatedCourse.image || "/placeholder.svg"}
                          alt={relatedCourse.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-gray-800 mb-1 line-clamp-1">{relatedCourse.title}</h4>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{relatedCourse.duration}</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span>{relatedCourse.rating}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">学员评价</h2>
                  <div className="flex items-center">
                    <div className="text-3xl font-bold text-gray-900 mr-2">{course.rating}</div>
                    <div>
                      <div className="flex items-center mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.floor(course.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">{course.students} 名学员</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-6">
                  {/* 模拟评价 */}
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-center mb-3">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt="学员头像"
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <h4 className="font-medium text-gray-800">张同学</h4>
                        <div className="flex items-center">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= 5 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-2">2天前</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      课程内容非常实用，讲师讲解清晰易懂。通过这门课程，我对AI的理解有了质的提升。
                      特别是实战项目部分，让我能够将理论知识应用到实际场景中。强烈推荐！
                    </p>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-center mb-3">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt="学员头像"
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <h4 className="font-medium text-gray-800">李工程师</h4>
                        <div className="flex items-center">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= 4 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-2">1周前</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      作为一名开发人员，这门课程帮助我快速掌握了AI应用开发的核心技能。
                      课程结构合理，从基础到进阶循序渐进，非常适合有编程基础的同学学习。
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-3">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt="学员头像"
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <h4 className="font-medium text-gray-800">王产品经理</h4>
                        <div className="flex items-center">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= 5 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-2">2周前</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      虽然我不是技术背景，但这门课程让我对AI技术有了深入的理解。
                      现在我能够更好地与技术团队沟通，制定更合理的产品规划。课程内容很有价值！
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  查看更多评价
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* 右侧侧边栏 */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* 学习进度 */}
              {course.progress > 0 && (
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-800 mb-3">学习进度</h3>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">已完成</span>
                        <span className="text-gray-800 font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <p className="text-sm text-gray-600">
                      您已完成 {Math.floor((course.progress / 100) * course.chapters)} / {course.chapters} 章节
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* 开始学习 */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{course.price}</div>
                    {course.price !== "免费" && <div className="text-sm text-gray-600 line-through">原价 ¥999</div>}
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-3">
                    <Play className="h-4 w-4 mr-2" />
                    {course.progress > 0 ? "继续学习" : "立即开始"}
                  </Button>

                  <Button variant="outline" className="w-full mb-4">
                    <FileText className="h-4 w-4 mr-2" />
                    免费试听
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">30天无理由退款保障</p>
                    <div className="flex items-center justify-center text-xs text-gray-600">
                      <Award className="h-3 w-3 mr-1" />
                      完成课程可获得认证证书
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 课程信息 */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">课程信息</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">课程时长</span>
                      <span className="text-gray-800">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">章节数量</span>
                      <span className="text-gray-800">{course.chapters}章</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">学习人数</span>
                      <span className="text-gray-800">{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">课程评分</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-gray-800">{course.rating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">难度级别</span>
                      <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">课程分类</span>
                      <span className="text-gray-800">{course.category}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 相关课程推荐 */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">相关课程推荐</h3>
                  <div className="space-y-4">
                    {courseData
                      .filter((c) => c.id !== course.id && c.category === course.category)
                      .slice(0, 3)
                      .map((relatedCourse) => (
                        <Link
                          key={relatedCourse.id}
                          href={`/courses/${relatedCourse.id}`}
                          className="block hover:bg-gray-50 rounded-lg p-2 transition-colors"
                        >
                          <div className="flex">
                            <img
                              src={relatedCourse.image || "/placeholder.svg"}
                              alt={relatedCourse.title}
                              className="w-16 h-12 object-cover rounded mr-3"
                            />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                                {relatedCourse.title}
                              </h4>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">{relatedCourse.price}</span>
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="text-gray-600">{relatedCourse.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
