"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Star,
  Award,
  Target,
  Flame,
  BookOpen,
  Users,
  Clock,
  ArrowLeft,
  Share2,
  Download,
  Lock,
  CheckCircle,
  Calendar,
  Zap,
  Crown,
  Medal,
  Gift,
} from "lucide-react"
import Link from "next/link"

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  category: string
  rarity: "common" | "rare" | "epic" | "legendary"
  points: number
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedAt?: Date
  requirements: string[]
  reward?: string
}

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const achievements: Achievement[] = [
    {
      id: "1",
      title: "AI学习先锋",
      description: "完成第一个AI课程学习",
      icon: Trophy,
      category: "learning",
      rarity: "common",
      points: 100,
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: new Date("2024-02-15"),
      requirements: ["完成任意一门AI课程"],
      reward: "学习积分 +100",
    },
    {
      id: "2",
      title: "连续学习者",
      description: "连续学习30天",
      icon: Flame,
      category: "streak",
      rarity: "rare",
      points: 300,
      progress: 7,
      maxProgress: 30,
      unlocked: false,
      requirements: ["连续30天进行学习活动"],
      reward: "专属徽章 + 学习积分 +300",
    },
    {
      id: "3",
      title: "知识分享者",
      description: "帮助10位同学解答问题",
      icon: Users,
      category: "social",
      rarity: "rare",
      points: 250,
      progress: 6,
      maxProgress: 10,
      unlocked: false,
      requirements: ["在社区帮助其他学员解答问题"],
      reward: "导师徽章 + 学习积分 +250",
    },
    {
      id: "4",
      title: "Prompt工程师",
      description: "通过Prompt工程师认证考试",
      icon: Award,
      category: "certification",
      rarity: "epic",
      points: 500,
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: new Date("2024-03-10"),
      requirements: ["通过Prompt工程师认证考试"],
      reward: "专业证书 + 学习积分 +500",
    },
    {
      id: "5",
      title: "学习马拉松",
      description: "累计学习时间达到100小时",
      icon: Clock,
      category: "time",
      rarity: "epic",
      points: 600,
      progress: 156,
      maxProgress: 100,
      unlocked: true,
      unlockedAt: new Date("2024-03-20"),
      requirements: ["累计学习时间达到100小时"],
      reward: "马拉松徽章 + 学习积分 +600",
    },
    {
      id: "6",
      title: "AI大师",
      description: "完成所有高级AI课程",
      icon: Crown,
      category: "mastery",
      rarity: "legendary",
      points: 1000,
      progress: 8,
      maxProgress: 16,
      unlocked: false,
      requirements: ["完成所有16门AI课程"],
      reward: "大师称号 + 专属头像框 + 学习积分 +1000",
    },
    {
      id: "7",
      title: "完美主义者",
      description: "所有考试均获得满分",
      icon: Star,
      category: "excellence",
      rarity: "legendary",
      points: 800,
      progress: 2,
      maxProgress: 3,
      unlocked: false,
      requirements: ["所有考试均获得100分"],
      reward: "完美徽章 + 学习积分 +800",
    },
    {
      id: "8",
      title: "早起鸟儿",
      description: "连续7天在早上6-8点学习",
      icon: Zap,
      category: "habit",
      rarity: "rare",
      points: 200,
      progress: 3,
      maxProgress: 7,
      unlocked: false,
      requirements: ["连续7天在早上6-8点进行学习"],
      reward: "早起徽章 + 学习积分 +200",
    },
  ]

  const categories = [
    { id: "all", name: "全部", icon: Trophy },
    { id: "learning", name: "学习", icon: BookOpen },
    { id: "streak", name: "连续", icon: Flame },
    { id: "social", name: "社交", icon: Users },
    { id: "certification", name: "认证", icon: Award },
    { id: "time", name: "时长", icon: Clock },
    { id: "mastery", name: "精通", icon: Crown },
    { id: "excellence", name: "卓越", icon: Star },
    { id: "habit", name: "习惯", icon: Zap },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-600 border-gray-300 bg-gray-50"
      case "rare":
        return "text-blue-600 border-blue-300 bg-blue-50"
      case "epic":
        return "text-purple-600 border-purple-300 bg-purple-50"
      case "legendary":
        return "text-yellow-600 border-yellow-300 bg-yellow-50"
      default:
        return "text-gray-600 border-gray-300 bg-gray-50"
    }
  }

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "普通"
      case "rare":
        return "稀有"
      case "epic":
        return "史诗"
      case "legendary":
        return "传说"
      default:
        return "普通"
    }
  }

  const filteredAchievements =
    selectedCategory === "all" ? achievements : achievements.filter((a) => a.category === selectedCategory)

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalPoints = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 pb-20">
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
                <Trophy className="h-8 w-8 mr-3 text-yellow-600" />
                成就系统
              </h1>
              <p className="text-gray-600 mt-1">记录您的学习里程碑和荣誉时刻</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              分享成就
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              导出证书
            </Button>
          </div>
        </div>

        {/* 成就统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{unlockedCount}</p>
              <p className="text-sm text-gray-600">已解锁成就</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{totalPoints}</p>
              <p className="text-sm text-gray-600">成就积分</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">
                {Math.round((unlockedCount / achievements.length) * 100)}%
              </p>
              <p className="text-sm text-gray-600">完成度</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-4 text-center">
              <Medal className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">#{Math.floor(Math.random() * 100) + 1}</p>
              <p className="text-sm text-gray-600">全站排名</p>
            </CardContent>
          </Card>
        </div>

        {/* 分类筛选 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">成就分类</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 成就列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const Icon = achievement.icon
            const isCompleted = achievement.progress >= achievement.maxProgress

            return (
              <Card
                key={achievement.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  achievement.unlocked
                    ? "border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50"
                    : "border-2 border-gray-200 bg-white"
                }`}
              >
                {achievement.unlocked && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-full ${achievement.unlocked ? "bg-yellow-100" : "bg-gray-100"}`}>
                        <Icon className={`h-6 w-6 ${achievement.unlocked ? "text-yellow-600" : "text-gray-400"}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-lg ${achievement.unlocked ? "text-gray-800" : "text-gray-500"}`}>
                          {achievement.title}
                        </CardTitle>
                        <Badge className={`mt-1 ${getRarityColor(achievement.rarity)}`}>
                          {getRarityName(achievement.rarity)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className={`text-sm ${achievement.unlocked ? "text-gray-700" : "text-gray-500"}`}>
                    {achievement.description}
                  </p>

                  {/* 进度条 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">进度</span>
                      <span className="font-medium">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                  </div>

                  {/* 要求 */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">解锁条件：</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {achievement.requirements.map((req, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 奖励 */}
                  {achievement.reward && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Gift className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">奖励</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">{achievement.reward}</p>
                    </div>
                  )}

                  {/* 解锁时间 */}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>解锁于 {achievement.unlockedAt.toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* 积分 */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{achievement.points} 积分</span>
                    </div>
                    {!achievement.unlocked && <Lock className="h-4 w-4 text-gray-400" />}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
