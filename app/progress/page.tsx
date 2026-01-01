"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, Trophy, Target, Clock, BookOpen, Award } from "lucide-react"
import { ResponsiveLayout } from "@/components/responsive-layout"

export default function ProgressPage() {
  const learningStats = {
    totalHours: 156,
    completedCourses: 12,
    currentStreak: 7,
    totalPoints: 2450,
    weeklyGoal: 10,
    weeklyProgress: 7,
  }

  const courseProgress = [
    {
      id: 1,
      title: "GPT模型基础与应用",
      progress: 100,
      completed: true,
      grade: "A",
      timeSpent: "8小时",
      lastAccessed: "2024年1月15日",
    },
    {
      id: 2,
      title: "Prompt Engineering实战",
      progress: 75,
      completed: false,
      grade: null,
      timeSpent: "9小时",
      lastAccessed: "2024年1月20日",
    },
    {
      id: 3,
      title: "AI应用开发框架",
      progress: 45,
      completed: false,
      grade: null,
      timeSpent: "7小时",
      lastAccessed: "2024年1月18日",
    },
    {
      id: 4,
      title: "多模态AI模型应用",
      progress: 20,
      completed: false,
      grade: null,
      timeSpent: "2小时",
      lastAccessed: "2024年1月10日",
    },
  ]

  const achievements = [
    {
      id: 1,
      title: "学习新手",
      description: "完成第一个课程",
      icon: "🎓",
      earned: true,
      date: "2024年1月5日",
    },
    {
      id: 2,
      title: "连续学习者",
      description: "连续学习7天",
      icon: "🔥",
      earned: true,
      date: "2024年1月20日",
    },
    {
      id: 3,
      title: "测试达人",
      description: "通过10次练习测试",
      icon: "🏆",
      earned: true,
      date: "2024年1月18日",
    },
    {
      id: 4,
      title: "知识探索者",
      description: "学习时长达到100小时",
      icon: "🚀",
      earned: true,
      date: "2024年1月15日",
    },
    {
      id: 5,
      title: "完美主义者",
      description: "获得5个A级成绩",
      icon: "⭐",
      earned: false,
      date: null,
    },
    {
      id: 6,
      title: "团队协作者",
      description: "参与团队项目",
      icon: "🤝",
      earned: false,
      date: null,
    },
  ]

  const weeklyActivity = [
    { day: "周一", hours: 2 },
    { day: "周二", hours: 1.5 },
    { day: "周三", hours: 3 },
    { day: "周四", hours: 0 },
    { day: "周五", hours: 2.5 },
    { day: "周六", hours: 1 },
    { day: "周日", hours: 0.5 },
  ]

  return (
    <ResponsiveLayout
      title="学习进度"
      user={{ name: "YanYu同学", avatar: "/user/User_61.png", level: "中级工程师" }}
    >
      <div>
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">学习进度追踪</h1>
          <p className="text-gray-600">跟踪您的学习成果和成长轨迹</p>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-all duration-300 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">总学习时长</p>
                  <p className="text-2xl font-bold">{learningStats.totalHours}小时</p>
                </div>
                <Clock className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white transform hover:scale-105 transition-all duration-300 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">完成课程</p>
                  <p className="text-2xl font-bold">{learningStats.completedCourses}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-all duration-300 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">学习积分</p>
                  <p className="text-2xl font-bold">{learningStats.totalPoints}</p>
                </div>
                <Trophy className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white transform hover:scale-105 transition-all duration-300 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">连续学习</p>
                  <p className="text-2xl font-bold">{learningStats.currentStreak}天</p>
                </div>
                <Target className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 课程进度 */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  <span>课程进度</span>
                </CardTitle>
                <CardDescription>您的课程学习情况</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseProgress.map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <div className="flex items-center space-x-2">
                        {course.completed && <Badge className="bg-green-100 text-green-800">已完成</Badge>}
                        {course.grade && <Badge variant="outline">成绩: {course.grade}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">进度</span>
                      <span className="text-sm font-medium text-indigo-600">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="mb-3" />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>学习时长: {course.timeSpent}</span>
                      <span>最后访问: {course.lastAccessed}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 本周学习活动 */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <span>本周学习活动</span>
                </CardTitle>
                <CardDescription>每日学习时长统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyActivity.map((day, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <span className="w-12 text-sm text-gray-600">{day.day}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(day.hours / 3) * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-sm text-gray-600 text-right">{day.hours}小时</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-900">本周目标</span>
                    <span className="text-sm text-indigo-600">
                      {learningStats.weeklyProgress}/{learningStats.weeklyGoal}小时
                    </span>
                  </div>
                  <Progress value={(learningStats.weeklyProgress / learningStats.weeklyGoal) * 100} className="mb-2" />
                  <p className="text-xs text-indigo-700">
                    还需学习 {learningStats.weeklyGoal - learningStats.weeklyProgress} 小时完成本周目标
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 成就徽章 */}
          <div>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-indigo-600" />
                  <span>成就徽章</span>
                </CardTitle>
                <CardDescription>您获得的学习成就</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        achievement.earned
                          ? "border-yellow-300 bg-yellow-50 shadow-md"
                          : "border-gray-200 bg-gray-50 opacity-60"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{achievement.icon}</div>
                        <h3 className="font-semibold text-sm text-gray-900 mb-1">{achievement.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                        {achievement.earned && achievement.date && (
                          <p className="text-xs text-yellow-600 font-medium">{achievement.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  )
}
