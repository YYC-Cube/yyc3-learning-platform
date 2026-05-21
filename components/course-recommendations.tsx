/**
 * @fileoverview UI组件 · course-recommendations.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Target, TrendingUp, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import type { CourseModule } from '@/data/course-recommendations';

interface CourseRecommendationsProps {
  currentCourse: CourseModule;
  className?: string;
}

export function CourseRecommendations({ currentCourse, className }: CourseRecommendationsProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case '初级':
        return 'bg-green-100 text-green-800';
      case '中级':
        return 'bg-yellow-100 text-yellow-800';
      case '高级':
        return 'bg-red-100 text-red-800';
      case '专家':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '认证课程':
        return <Target className="h-4 w-4" />;
      case '实战开发':
        return <BookOpen className="h-4 w-4" />;
      case '通识认知':
        return <Lightbulb className="h-4 w-4" />;
      case '专项技术':
        return <TrendingUp className="h-4 w-4" />;
      case '行业应用':
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className={className}>
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="h-5 w-5" />
            🔍 下一阶段建议
          </CardTitle>
          <CardDescription className="text-blue-700">
            基于您当前的学习进度，为您推荐最适合的后续课程
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 主要推荐 */}
          <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                {getCategoryIcon(currentCourse.category)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {currentCourse.nextRecommendations.primary}
                </h4>
                <Badge className={getLevelColor(currentCourse.level)} variant="secondary">
                  推荐等级：{currentCourse.level}+
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <ArrowRight className="h-4 w-4" />
              <span>{currentCourse.nextRecommendations.secondary}</span>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              {currentCourse.nextRecommendations.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex-1" asChild>
                <Link href="/courses" className="inline-flex items-center justify-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  查看推荐课程
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 flex-1"
                asChild
              >
                <Link href="/progress" className="inline-flex items-center justify-center">
                  <Target className="h-4 w-4 mr-2" />
                  制定学习计划
                </Link>
              </Button>
            </div>
          </div>

          {/* 学习路径提示 */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              学习路径建议
            </h5>
            <div className="text-sm text-blue-800 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>当前阶段：{currentCourse.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>下一步：{currentCourse.nextRecommendations.primary}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>进阶目标：{currentCourse.nextRecommendations.secondary}</span>
              </div>
            </div>
          </div>

          {/* 相关标签 */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2">相关技能标签</h5>
            <div className="flex flex-wrap gap-2">
              {currentCourse.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
