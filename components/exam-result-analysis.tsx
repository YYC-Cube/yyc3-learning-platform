/**
 * @fileoverview UI组件 · exam-result-analysis.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Download, RefreshCw, Share2, Target, Trophy } from 'lucide-react';

interface ExamResultAnalysisProps {
  results: any;
  examTitle: string;
  questions: any[];
  onRetake: () => void;
  onDownloadCertificate: () => void;
  onShare: () => void;
}

export function ExamResultAnalysis({
  results,
  examTitle,
  questions,
  onRetake,
  onDownloadCertificate,
  onShare,
}: ExamResultAnalysisProps) {
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: '优秀', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 80) return { level: '良好', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 70) return { level: '中等', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (score >= 60) return { level: '及格', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: '不及格', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const performance = getPerformanceLevel(results.score);

  const getRecommendations = (score: number) => {
    if (score >= 90) {
      return [
        '🎉 恭喜！您的表现非常出色',
        '💡 可以尝试更高难度的考试',
        '📚 建议深入学习前沿技术',
        '🤝 可以考虑分享经验帮助他人',
      ];
    } else if (score >= 70) {
      return [
        '👍 表现不错，还有提升空间',
        '📖 建议复习错题相关知识点',
        '💪 多做练习题巩固基础',
        '🎯 重点关注薄弱环节',
      ];
    } else {
      return [
        '📚 建议系统性复习基础知识',
        '🔄 多次练习提高熟练度',
        '👨‍🏫 可以寻求专业指导',
        '⏰ 合理安排学习时间',
      ];
    }
  };

  const recommendations = getRecommendations(results.score);

  return (
    <div className="space-y-6">
      {/* 总体成绩展示 */}
      <Card className={`${performance.bg} border-2`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${performance.bg}`}>
              <Trophy className={`h-12 w-12 ${performance.color}`} />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-2">
            {examTitle && (
              <span className="text-lg font-normal text-gray-500 block mb-1">{examTitle}</span>
            )}
            <span className={performance.color}>{results.score}</span>
            <span className="text-gray-500 text-xl ml-2">分</span>
          </CardTitle>
          <Badge className={`${performance.color} ${performance.bg} border-0 text-lg px-4 py-1`}>
            {performance.level}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600">{results.correctCount}</div>
              <div className="text-sm text-gray-600">答对题数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round((results.correctCount / results.totalQuestions) * 100)}%
              </div>
              <div className="text-sm text-gray-600">正确率</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.floor(results.timeUsed / 60)}分钟
              </div>
              <div className="text-sm text-gray-600">用时</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{results.totalQuestions}</div>
              <div className="text-sm text-gray-600">总题数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 详细分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 题型分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              题型分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['single', 'multiple', 'essay'].map((type) => {
                const typeQuestions = questions.filter((q) => q.type === type);
                const typeAnswered = typeQuestions.filter(
                  (_, index) =>
                    results.answers[
                      questions.findIndex((q) => q.id === typeQuestions[index]?.id)
                    ] !== undefined
                ).length;
                const accuracy = typeAnswered > 0 ? (typeAnswered / typeQuestions.length) * 100 : 0;

                if (typeQuestions.length === 0) return null;

                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {type === 'single' && '单选题'}
                        {type === 'multiple' && '多选题'}
                        {type === 'essay' && '简答题'}
                      </span>
                      <span>{Math.round(accuracy)}%</span>
                    </div>
                    <Progress value={accuracy} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">
                      {typeAnswered}/{typeQuestions.length} 题
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 时间分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              时间分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>时间利用率</span>
                  <span>{Math.round((results.timeUsed / (questions.length * 3 * 60)) * 100)}%</span>
                </div>
                <Progress
                  value={(results.timeUsed / (questions.length * 3 * 60)) * 100}
                  className="h-2"
                />
              </div>
              <div className="text-sm text-gray-600">
                <div>平均每题用时: {Math.round(results.timeUsed / questions.length)} 秒</div>
                <div>建议每题用时: {questions.length > 20 ? '2-3' : '3-4'} 分钟</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 学习建议 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            学习建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">{rec}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={onRetake} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          重新考试
        </Button>

        {results.score >= 60 && (
          <Button onClick={onDownloadCertificate} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            下载证书
          </Button>
        )}

        <Button onClick={onShare} variant="outline" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          分享成绩
        </Button>
      </div>
    </div>
  );
}
