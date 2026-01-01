"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColoredProgress } from "@/components/colored-progress"
import { ImageFallback } from "@/components/image-fallback"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { Users, Plus, Search, Crown, Star, Trophy, Calendar, MessageSquare, Target } from "lucide-react"
import Link from "next/link"

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const teams = [
    {
      id: 1,
      name: "AI创新实验室",
      description: "专注于前沿AI技术研究和应用开发",
      members: 12,
      maxMembers: 20,
      level: "高级",
      category: "研究型",
      leader: "李教授",
      joined: true,
      avatar: "/images/ai-innovation-lab.png",
      progress: 85,
      weeklyGoal: 15,
      achievements: ["创新先锋", "技术专家"],
    },
    {
      id: 2,
      name: "Prompt工程师联盟",
      description: "专业的提示词工程技术交流和实践团队",
      members: 8,
      maxMembers: 15,
      level: "中级",
      category: "实践型",
      leader: "王工程师",
      joined: false,
      avatar: "/images/prompt-engineer-alliance.png",
      progress: 72,
      weeklyGoal: 12,
      achievements: ["提示词大师", "实战专家"],
    },
    {
      id: 3,
      name: "新手学习小组",
      description: "为AI学习新手提供友好的学习环境和互助支持",
      members: 25,
      maxMembers: 30,
      level: "初级",
      category: "学习型",
      leader: "陈助教",
      joined: false,
      avatar: "/images/newbie-study-group.png",
      progress: 45,
      weeklyGoal: 8,
      achievements: ["新手导师", "互助之星"],
    },
  ]

  const teamMembers = [
    {
      id: 1,
      name: "李教授",
      avatar: "/user/User_63.png",
      role: "团队领导",
      level: "专家级",
      points: 8500,
      status: "在线",
      joinDate: "2023年9月",
      contributions: 156,
      progress: 95,
    },
    {
      id: 2,
      name: "张同学",
      avatar: "/user/User_64.png",
      role: "核心成员",
      level: "中级工程师",
      points: 2450,
      status: "在线",
      joinDate: "2024年1月",
      contributions: 42,
      progress: 68,
    },
    {
      id: 3,
      name: "王开发",
      avatar: "/user/User_65.png",
      role: "技术专家",
      level: "高级工程师",
      points: 5200,
      status: "离线",
      joinDate: "2023年11月",
      contributions: 89,
      progress: 82,
    },
    {
      id: 4,
      name: "刘研究员",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "研究员",
      level: "高级工程师",
      points: 4800,
      status: "在线",
      joinDate: "2023年10月",
      contributions: 73,
      progress: 76,
    },
  ]

  const teamProjects = [
    {
      id: 1,
      title: "智能客服系统开发",
      description: "基于大语言模型的企业级智能客服解决方案",
      status: "进行中",
      progress: 65,
      members: 6,
      deadline: "2024年3月15日",
      priority: "高",
    },
    {
      id: 2,
      title: "AI写作助手优化",
      description: "提升AI写作助手的创意性和准确性",
      status: "计划中",
      progress: 20,
      members: 4,
      deadline: "2024年4月20日",
      priority: "中",
    },
    {
      id: 3,
      title: "多模态AI应用研究",
      description: "探索文本、图像、音频结合的AI应用场景",
      status: "已完成",
      progress: 100,
      members: 8,
      deadline: "2024年1月30日",
      priority: "高",
    },
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case "初级":
        return "bg-emerald-100 text-emerald-800 border border-emerald-300"
      case "中级":
        return "bg-amber-100 text-amber-800 border border-amber-300"
      case "高级":
        return "bg-rose-100 text-rose-800 border border-rose-300"
      default:
        return "bg-slate-100 text-slate-800 border border-slate-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "在线":
        return "bg-emerald-500"
      case "离线":
        return "bg-slate-400"
      case "忙碌":
        return "bg-amber-500"
      default:
        return "bg-slate-400"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "高":
        return "bg-rose-100 text-rose-800 border border-rose-300"
      case "中":
        return "bg-amber-100 text-amber-800 border border-amber-300"
      case "低":
        return "bg-emerald-100 text-emerald-800 border border-emerald-300"
      default:
        return "bg-slate-100 text-slate-800 border border-slate-300"
    }
  }

  const getProgressVariant = (progress: number) => {
    if (progress >= 80) return "success"
    if (progress >= 60) return "info"
    if (progress >= 40) return "warning"
    return "purple"
  }

  return (
    <ResponsiveLayout
      title="团队管理"
      user={{ name: "YanYu同学", avatar: "/user/User_61.png", level: "中级工程师" }}
    >
      <div>
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">团队管理</h1>
          <p className="text-gray-600">加入学习团队，与同伴一起成长进步</p>
        </div>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-indigo-100">
            <TabsTrigger value="teams" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-lg">团队列表</TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-lg">团队成员</TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200 rounded-lg">团队项目</TabsTrigger>
          </TabsList>

          {/* 团队列表 */}
          <TabsContent value="teams" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索团队..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                创建团队
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Card
                  key={team.id}
                  className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                >
                  <div className="relative">
                    <ImageFallback
                      src={team.avatar || "/placeholder.svg"}
                      alt={team.name}
                      title={team.name}
                      className="w-full h-32 rounded-t-lg"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={getLevelColor(team.level)}>{team.level}</Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-gray-700 border border-gray-200">{team.category}</Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors">{team.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{team.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center">
                          <Crown className="h-4 w-4 mr-1 text-amber-500" />
                          {team.leader}
                        </span>
                        <span>
                          {team.members}/{team.maxMembers} 成员
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>团队活跃度</span>
                          <span className="font-medium">{team.progress}%</span>
                        </div>
                        <ColoredProgress value={team.progress} variant={getProgressVariant(team.progress)} />
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {team.achievements.map((achievement, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-indigo-200 text-indigo-700">
                            {achievement}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        className={`w-full ${
                          team.joined
                            ? "bg-slate-500 hover:bg-slate-600"
                            : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        } text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                        disabled={team.joined}
                      >
                        {team.joined ? "已加入" : "申请加入"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 团队成员 */}
          <TabsContent value="members" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span>AI创新实验室 - 团队成员</span>
                </CardTitle>
                <CardDescription>团队成员列表和贡献统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{member.name}</h3>
                            {member.role === "团队领导" && <Crown className="h-4 w-4 text-amber-500" />}
                          </div>
                          <p className="text-sm text-gray-600">
                            {member.role} • {member.level}
                          </p>
                          <p className="text-xs text-gray-500">加入时间: {member.joinDate}</p>

                          {/* 成员学习进度 */}
                          <div className="mt-2 w-32">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>学习进度</span>
                              <span>{member.progress}%</span>
                            </div>
                            <ColoredProgress
                              value={member.progress}
                              size="sm"
                              variant={getProgressVariant(member.progress)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div>
                            <span className="flex items-center">
                              <Trophy className="h-4 w-4 mr-1 text-amber-500" />
                              {member.points} 积分
                            </span>
                          </div>
                          <div>
                            <span className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-indigo-500" />
                              {member.contributions} 贡献
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          私信
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 团队项目 */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">团队项目</h2>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                创建项目
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamProjects.map((project) => (
                <Card
                  key={project.id}
                  className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {project.title}
                      </CardTitle>
                      <Badge className={getPriorityColor(project.priority)}>{project.priority}优先级</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>项目进度</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <ColoredProgress value={project.progress} variant={getProgressVariant(project.progress)} />

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-indigo-500" />
                          {project.members} 成员
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-amber-500" />
                          {project.deadline}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge
                          className={
                            project.status === "已完成"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : project.status === "进行中"
                                ? "bg-blue-100 text-blue-800 border border-blue-300"
                                : "bg-slate-100 text-slate-800 border border-slate-300"
                          }
                        >
                          {project.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Target className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  )
}
