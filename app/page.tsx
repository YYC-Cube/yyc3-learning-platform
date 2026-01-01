/**
 * @fileoverview 学习中心主页面组件
 * @description 提供用户学习仪表板，展示课程进度、学习统计和最近活动
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-01-30
 * @modified 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Brain, Users, Trophy, Clock, Target, Play, CheckCircle, Star 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResponsiveLayout } from "@/components/responsive-layout";

// 类型定义（增强类型安全）
type User = {
  name: string;
  avatar: string;
  level: string;
  points: number;
  streak: number;
};

type Course = {
  id: number;
  title: string;
  description: string;
  progress: number;
  chapters: number;
  completed: number;
  difficulty: "初级" | "中级" | "高级";
  duration: string;
  image: string;
  color: string;
};

type Activity = {
  type: string;
  content: string;
  time: string;
  icon: React.ComponentType<React.ComponentProps<typeof CheckCircle>>; // 图标组件类型
};

export default function Dashboard() {
  // 静态数据无需状态管理，直接定义为常量
  const currentUser: User = {
    name: "言语同学",
    avatar: "/user/User_61.png",
    level: "中级工程师",
    points: 2450,
    streak: 7,
  };

  const courses: Course[] = [
    {
      id: 1,
      title: "GPT模型基础与应用",
      description: "深入理解大语言模型的原理和实际应用",
      progress: 75,
      chapters: 12,
      completed: 9,
      difficulty: "初级",
      duration: "8小时",
      image: "/images/gpt-basics-course.png",
      color: "bg-gradient-to-r from-green-500 to-emerald-600",
    },
    {
      id: 2,
      title: "Prompt Engineering实战",
      description: "掌握提示词工程的核心技巧和最佳实践",
      progress: 45,
      chapters: 15,
      completed: 7,
      difficulty: "中级",
      duration: "12小时",
      image: "/images/prompt-engineering-course.png",
      color: "bg-gradient-to-r from-blue-500 to-indigo-600",
    },
    {
      id: 3,
      title: "AI应用开发框架",
      description: "学习主流AI应用开发框架和工具链",
      progress: 20,
      chapters: 18,
      completed: 4,
      difficulty: "高级",
      duration: "16小时",
      image: "/images/ai-development-course.png",
      color: "bg-gradient-to-r from-purple-500 to-violet-600",
    },
  ];

  const recentActivities: Activity[] = [
    { type: "完成章节", content: "GPT-4 API集成实践", time: "2小时前", icon: CheckCircle },
    { type: "通过测试", content: "Prompt优化技巧测验", time: "1天前", icon: Trophy },
    { type: "加入团队", content: "AI创新实验室", time: "3天前", icon: Users },
    { type: "获得徽章", content: "连续学习7天", time: "1周前", icon: Star },
  ];

  return (
    <ResponsiveLayout title="学习中心" user={currentUser}>
      <div>
        {/* 欢迎区域 */}
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            欢迎回来，{currentUser.name}！
          </h1>
          <p className="text-gray-600">继续您的AI学习之旅，掌握前沿技术</p>
        </header>

        {/* 统计卡片 */}
        <section aria-labelledby="stats-heading" className="mb-6">
          <h2 id="stats-heading" className="sr-only">学习统计概览</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">学习积分</p>
                    <p className="text-xl font-bold">{currentUser.points}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">连续学习</p>
                    <p className="text-xl font-bold">{currentUser.streak}天</p>
                  </div>
                  <Target className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">完成课程</p>
                    <p className="text-xl font-bold">12</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">学习时长</p>
                    <p className="text-xl font-bold">156小时</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 课程进度 */}
          <section aria-labelledby="courses-heading" className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  <span id="courses-heading">我的课程</span>
                </CardTitle>
                <CardDescription>继续学习您的课程</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    className="border hover:border-blue-300 transition-all duration-300 hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={course.image || "/placeholder.svg"}
                          alt={`${course.title}课程封面`}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                              {course.title}
                            </h3>
                            <Badge
                              variant={
                                course.difficulty === "初级" ? "default" :
                                course.difficulty === "中级" ? "secondary" : "destructive"
                              }
                            >
                              {course.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{course.completed}/{course.chapters} 章节</span>
                              <span>{course.duration}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div 
                              className="w-full bg-gray-200 rounded-full h-2 mr-4"
                              role="progressbar"
                              aria-valuenow={course.progress}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`课程进度：${course.progress}%`}
                            >
                              <div
                                className={`h-2 rounded-full ${course.color}`}
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-blue-600 mr-4">
                              {course.progress}%
                            </span>
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 text-white" 
                              asChild
                            >
                              <Link href={`/courses/${course.id}`} className="inline-flex items-center justify-center">
                                <Play className="h-4 w-4 mr-1" />
                                继续学习
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* 侧边栏 */}
          <aside className="flex flex-col space-y-6">
            {/* 最近活动 */}
            <section aria-labelledby="activities-heading" className="flex-1">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-green-600" />
                    <span id="activities-heading">最近活动</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {recentActivities.map((activity, index) => {
                      const IconComponent = activity.icon;
                      return (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{activity.type}</p>
                            <p className="text-sm text-gray-600 truncate">{activity.content}</p>
                            <time className="text-xs text-gray-400">{activity.time}</time>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* 快速操作 */}
            <section aria-labelledby="quick-actions-heading" className="flex-1">
              <Card className="shadow-lg h-full flex flex-col">
                <CardHeader>
                  <CardTitle id="quick-actions-heading">快速操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col justify-center">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                    asChild
                  >
                    <Link href="/practice" className="inline-flex items-center justify-center">
                      <Brain className="h-4 w-4 mr-2" />
                      开始练习
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 hover:bg-gray-50" 
                    asChild
                  >
                    <Link href="/courses" className="inline-flex items-center justify-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      浏览课程
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 hover:bg-gray-50" 
                    asChild
                  >
                    <Link href="/team" className="inline-flex items-center justify-center">
                      <Users className="h-4 w-4 mr-2" />
                      团队协作
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </section>
          </aside>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
