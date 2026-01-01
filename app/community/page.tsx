"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  MessageCircle,
  Heart,
  Share2,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  TrendingUp,
  Clock,
  Eye,
  ThumbsUp,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Star,
  Pin,
  Flag,
} from "lucide-react"
import Link from "next/link"

interface Post {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar: string
    level: string
  }
  category: string
  tags: string[]
  likes: number
  replies: number
  views: number
  createdAt: Date
  isPinned?: boolean
  isHot?: boolean
}

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewPost, setShowNewPost] = useState(false)

  const posts: Post[] = [
    {
      id: "1",
      title: "GPT-4 API调用最佳实践分享",
      content: "最近在项目中大量使用GPT-4 API，总结了一些优化经验，包括prompt设计、参数调优、成本控制等方面...",
      author: {
        name: "AI架构师",
        avatar: "/placeholder.svg?height=40&width=40&text=AI",
        level: "高级工程师",
      },
      category: "experience",
      tags: ["GPT-4", "API", "最佳实践"],
      likes: 45,
      replies: 12,
      views: 234,
      createdAt: new Date("2024-03-20"),
      isPinned: true,
      isHot: true,
    },
    {
      id: "2",
      title: "Prompt工程师认证考试经验分享",
      content: "刚刚通过了Prompt工程师认证考试，分享一下备考经验和考试技巧，希望对大家有帮助...",
      author: {
        name: "YanYu同学",
        avatar: "/placeholder.svg?height=40&width=40&text=YY",
        level: "中级AI工程师",
      },
      category: "certification",
      tags: ["认证考试", "Prompt工程", "经验分享"],
      likes: 32,
      replies: 8,
      views: 156,
      createdAt: new Date("2024-03-19"),
      isHot: true,
    },
    {
      id: "3",
      title: "求助：多模态AI模型部署问题",
      content: "在部署多模态AI模型时遇到内存不足的问题，有没有大佬能指导一下优化方案？",
      author: {
        name: "新手小白",
        avatar: "/placeholder.svg?height=40&width=40&text=新",
        level: "初级学员",
      },
      category: "help",
      tags: ["多模态AI", "部署", "求助"],
      likes: 8,
      replies: 15,
      views: 89,
      createdAt: new Date("2024-03-18"),
    },
    {
      id: "4",
      title: "开源项目：AI学习助手Chrome插件",
      content: "开发了一个Chrome插件，可以在浏览网页时提供AI学习建议和知识点解释，欢迎大家试用...",
      author: {
        name: "开源贡献者",
        avatar: "/placeholder.svg?height=40&width=40&text=开",
        level: "资深工程师",
      },
      category: "project",
      tags: ["开源项目", "Chrome插件", "AI助手"],
      likes: 67,
      replies: 23,
      views: 345,
      createdAt: new Date("2024-03-17"),
      isHot: true,
    },
  ]

  const categories = [
    { id: "all", name: "全部", icon: Users, count: posts.length },
    { id: "experience", name: "经验分享", icon: Lightbulb, count: 1 },
    { id: "help", name: "求助问答", icon: HelpCircle, count: 1 },
    { id: "project", name: "项目展示", icon: BookOpen, count: 1 },
    { id: "certification", name: "认证考试", icon: Star, count: 1 },
  ]

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.icon || MessageCircle
  }

  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case "experience":
        return "bg-blue-100 text-blue-800"
      case "help":
        return "bg-red-100 text-red-800"
      case "project":
        return "bg-green-100 text-green-800"
      case "certification":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="inline-flex items-center justify-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Users className="h-8 w-8 mr-3 text-blue-600" />
                学习社区
              </h1>
              <p className="text-gray-600 mt-1">与同学们交流学习心得，共同进步</p>
            </div>
          </div>
          <Button onClick={() => setShowNewPost(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            发布帖子
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 侧边栏 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 社区统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">社区统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">总帖子数</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">活跃用户</span>
                  <span className="font-semibold">567</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">今日新增</span>
                  <span className="font-semibold text-green-600">+23</span>
                </div>
              </CardContent>
            </Card>

            {/* 分类筛选 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">讨论分类</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="flex-1 text-left">{category.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {category.count}
                      </Badge>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>

            {/* 热门标签 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">热门标签</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["GPT-4", "Prompt工程", "机器学习", "深度学习", "API", "最佳实践", "认证考试", "项目实战"].map(
                    (tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-blue-50">
                        {tag}
                      </Badge>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 主内容区 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 搜索和筛选 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索帖子、标签或用户..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    筛选
                  </Button>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    热门
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 帖子列表 */}
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const CategoryIcon = getCategoryIcon(post.category)
                return (
                  <Card key={post.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                          {/* 帖子头部 */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                {post.isPinned && <Pin className="h-4 w-4 text-red-500" />}
                                {post.isHot && <TrendingUp className="h-4 w-4 text-orange-500" />}
                                <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 cursor-pointer">
                                  {post.title}
                                </h3>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span className="font-medium">{post.author.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {post.author.level}
                                </Badge>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>{post.createdAt.toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Flag className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* 帖子内容 */}
                          <p className="text-gray-700 line-clamp-2">{post.content}</p>

                          {/* 标签和分类 */}
                          <div className="flex items-center space-x-2">
                            <Badge className={getCategoryColor(post.category)}>
                              <CategoryIcon className="h-3 w-3 mr-1" />
                              {categories.find((c) => c.id === post.category)?.name}
                            </Badge>
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* 互动统计 */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{post.likes}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.replies}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{post.views}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Heart className="h-4 w-4 mr-1" />
                                点赞
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                回复
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="h-4 w-4 mr-1" />
                                分享
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        {/* 发布新帖子模态框 */}
        {showNewPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>发布新帖子</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowNewPost(false)}>
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">标题</label>
                  <Input placeholder="请输入帖子标题..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">分类</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="experience">经验分享</option>
                    <option value="help">求助问答</option>
                    <option value="project">项目展示</option>
                    <option value="certification">认证考试</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">内容</label>
                  <Textarea placeholder="请输入帖子内容..." rows={8} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">标签</label>
                  <Input placeholder="请输入标签，用逗号分隔..." />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNewPost(false)}>
                    取消
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">发布</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
