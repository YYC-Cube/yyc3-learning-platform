"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Settings,
  Trophy,
  BookOpen,
  Clock,
  Target,
  Star,
  Award,
  Download,
  Share2,
  Edit,
  HelpCircle,
  TrendingUp,
  CheckCircle,
  User,
  MapPin,
  Phone,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import { ResponsiveLayout } from "@/components/responsive-layout"

export default function ProfilePage() {
  const [currentUser] = useState({
    name: "YanYu同学",
    email: "yanyu@smartcloud.com",
    avatar: "/user/User_61.png",
    level: "中级AI工程师",
    points: 2450,
    streak: 7,
    joinDate: "2024年1月",
    completedCourses: 12,
    totalStudyTime: 156,
    certificates: 5,
    rank: 156,
    // 新增个人信息
    phone: "+86 138-0000-0000",
    location: "北京市海淀区",
    company: "YanYu智能科技",
    position: "AI算法工程师",
    bio: "专注于AI技术研发与应用，致力于推动人工智能在各行业的落地实践。",
    skills: ["机器学习", "深度学习", "自然语言处理", "计算机视觉", "Python", "TensorFlow"],
    interests: ["AI前沿技术", "开源项目", "技术分享", "团队协作"],
  })

  return (
    <ResponsiveLayout
      title="我的资料"
      user={{
        name: currentUser.name,
        avatar: currentUser.avatar,
        level: currentUser.level,
      }}
    >
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">我的资料</h1>
          <p className="text-gray-600 mt-2">管理您的学习档案和个人信息</p>
        </div>

        {/* 用户信息卡片 - 增强版 */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20 border-4 border-white/30 shadow-lg">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback className="text-blue-600 text-xl font-bold bg-white">YY</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-1 text-white">{currentUser.name}</h1>
                  <p className="text-white/90 mb-2 font-medium">{currentUser.email}</p>
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-white/25 text-white border-white/40 backdrop-blur-sm font-medium">
                      {currentUser.level}
                    </Badge>
                    <span className="text-sm text-white/80 font-medium">加入时间：{currentUser.joinDate}</span>
                  </div>
                </div>
                <Button
                  className="bg-white hover:bg-gray-50 text-blue-700 font-semibold border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  size="sm"
                  asChild
                >
                  <Link href="/profile/edit" className="inline-flex items-center justify-center gap-2">
                    <Edit className="h-4 w-4 mr-2" />
                    编辑资料
                  </Link>
                </Button>
              </div>

              {/* 新增详细个人信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{currentUser.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{currentUser.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm">{currentUser.company}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{currentUser.position}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 个人简介 */}
        <Card className="shadow-lg border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <User className="h-5 w-5 text-blue-700" />
              <span>个人简介</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">{currentUser.bio}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-600" />
                  专业技能
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-green-600" />
                  兴趣领域
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser.interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 学习统计 */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            学习统计
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-all duration-300 border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Trophy className="h-6 w-6 text-yellow-700" />
                  <div className="w-8 h-8 bg-yellow-200/50 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{currentUser.points}</p>
                <p className="text-sm text-gray-700 font-medium">学习积分</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <BookOpen className="h-6 w-6 text-blue-700" />
                  <div className="w-8 h-8 bg-blue-200/50 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{currentUser.completedCourses}</p>
                <p className="text-sm text-gray-700 font-medium">完成课程</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Clock className="h-6 w-6 text-green-700" />
                  <div className="w-8 h-8 bg-green-200/50 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{currentUser.totalStudyTime}小时</p>
                <p className="text-sm text-gray-700 font-medium">学习时长</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Award className="h-6 w-6 text-purple-700" />
                  <div className="w-8 h-8 bg-purple-200/50 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{currentUser.certificates}</p>
                <p className="text-sm text-gray-700 font-medium">获得证书</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 成就徽章 */}
        <Card className="shadow-lg border-2 border-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Trophy className="h-5 w-5 text-yellow-700" />
              <span>成就徽章</span>
            </CardTitle>
            <CardDescription className="text-gray-700">您获得的学习成就</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-4 rounded-xl border-2 bg-white border-gray-200 shadow-sm">
              <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">AI学习先锋</h3>
                <p className="text-sm text-gray-700 mb-2">完成首个AI课程</p>
                <p className="text-xs text-gray-600">获得时间：2024年2月</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-xl border-2 bg-white border-gray-200 shadow-sm">
              <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <Target className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">连续学习者</h3>
                <p className="text-sm text-gray-700 mb-2">连续学习30天</p>
                <p className="text-xs text-gray-600">获得时间：2024年3月</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-xl border-2 bg-gray-50 border-gray-200">
              <div className="flex-shrink-0 p-2 rounded-lg bg-gray-300 text-gray-600">
                <Star className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-700">知识分享者</h3>
                <p className="text-sm text-gray-600 mb-2">帮助10位同学解答问题</p>
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                  <p className="text-xs text-gray-600">进度：60%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 快速操作 */}
        <Card className="shadow-lg border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Settings className="h-5 w-5 text-blue-700" />
              <span>快速操作</span>
            </CardTitle>
            <CardDescription className="text-gray-700">管理您的账户和设置</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-100 text-blue-800 font-medium transition-all duration-200"
                asChild
              >
                <Link href="/profile/settings" className="inline-flex flex-col items-center justify-center space-y-2">
                  <Settings className="h-6 w-6 text-blue-700" />
                  <span className="text-sm font-semibold text-blue-800">账户设置</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 border-2 border-green-300 hover:border-green-400 hover:bg-green-100 text-green-800 font-medium transition-all duration-200"
                asChild
              >
                <Link href="/profile/certificates" className="inline-flex flex-col items-center justify-center space-y-2">
                  <Download className="h-6 w-6 text-green-700" />
                  <span className="text-sm font-semibold text-green-800">下载证书</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-100 text-blue-800 font-medium transition-all duration-200"
                asChild
              >
                <Link href="/profile/share" className="inline-flex flex-col items-center justify-center space-y-2">
                  <Share2 className="h-6 w-6 text-blue-700" />
                  <span className="text-sm font-semibold text-blue-800">分享成就</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 border-2 border-purple-300 hover:border-purple-400 hover:bg-purple-100 text-purple-800 font-medium transition-all duration-200"
                asChild
              >
                <Link href="/help" className="inline-flex flex-col items-center justify-center space-y-2">
                  <HelpCircle className="h-6 w-6 text-purple-700" />
                  <span className="text-sm font-semibold text-purple-800">帮助中心</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  )
}
