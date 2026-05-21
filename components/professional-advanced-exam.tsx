/**
 * @fileoverview UI组件 · professional-advanced-exam.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Trophy,
  FileText,
  AlertCircle,
  Star,
  Lightbulb,
  Target,
  Code,
} from 'lucide-react';
import type { ProfessionalAdvancedQuestion } from '@/data/professional-advanced-questions';
import { generateProfessionalExamPaper } from '@/data/professional-advanced-questions';

interface ProfessionalAdvancedExamProps {
  examType: 'technical-foundation' | 'core-tech-depth' | 'multimodal' | 'rlhf' | 'comprehensive';
  timeLimit?: number;
  onComplete?: (results: ProfessionalAdvancedExamResults) => void;
}

interface ProfessionalAdvancedExamResults {
  totalQuestions: number;
  totalPoints: number;
  earnedPoints: number;
  score: number;
  timeUsed: number;
  categoryScores: Record<string, { correct: number; total: number; points: number }>;
  answers: Record<string, any>;
  feedback: Record<string, string>;
}

export function ProfessionalAdvancedExam({
  examType,
  timeLimit = 120,
  onComplete,
}: ProfessionalAdvancedExamProps) {
  const [examQuestions, setExamQuestions] = useState<ProfessionalAdvancedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ProfessionalAdvancedExamResults | null>(null);

  // 初始化考试
  useEffect(() => {
    let questions: ProfessionalAdvancedQuestion[] = [];

    switch (examType) {
      case 'technical-foundation':
        questions = generateProfessionalExamPaper({
          categories: ['技术基础'],
          difficultyRange: [2, 4],
          questionCount: 20,
          includeSystemDesign: false,
        });
        break;
      case 'core-tech-depth':
        questions = generateProfessionalExamPaper({
          categories: ['核心技术深度'],
          difficultyRange: [3, 5],
          questionCount: 10,
          includeSystemDesign: true,
        });
        break;
      case 'multimodal':
        questions = generateProfessionalExamPaper({
          categories: ['多模态生成'],
          difficultyRange: [3, 5],
          questionCount: 8,
          includeSystemDesign: true,
        });
        break;
      case 'rlhf':
        questions = generateProfessionalExamPaper({
          categories: ['RLHF调优'],
          difficultyRange: [3, 5],
          questionCount: 8,
          includeSystemDesign: true,
        });
        break;
      case 'comprehensive':
        questions = generateProfessionalExamPaper({
          categories: ['技术基础', '核心技术深度', '多模态生成', 'RLHF调优'],
          difficultyRange: [2, 5],
          questionCount: 25,
          includeSystemDesign: true,
        });
        break;
    }

    setExamQuestions(questions);
  }, [examType]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setExamStarted(true);
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitExam = useCallback(() => {
    const timeUsed = timeLimit * 60 - timeRemaining;
    let totalPoints = 0;
    let earnedPoints = 0;
    const categoryScores: Record<string, { correct: number; total: number; points: number }> = {};
    const feedback: Record<string, string> = {};

    examQuestions.forEach((question) => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      const category = question.category;

      if (!categoryScores[category]) {
        categoryScores[category] = { correct: 0, total: 0, points: 0 };
      }
      categoryScores[category].total++;

      let score = 0;
      let isCorrect = false;

      if (question.type === 'single') {
        isCorrect = userAnswer === question.correctAnswers[0];
        score = isCorrect ? question.points : 0;
      } else if (question.type === 'multiple') {
        if (Array.isArray(userAnswer) && userAnswer.length === question.correctAnswers.length) {
          isCorrect = userAnswer.every((ans: number) => question.correctAnswers.includes(ans));
          score = isCorrect ? question.points : question.points * 0.5;
        }
      } else if (question.type === 'technical-analysis' || question.type === 'system-design') {
        if (userAnswer && userAnswer.trim().length > 0) {
          const answerLength = userAnswer.trim().length;
          const hasKeywords = question.keywords.some((keyword) =>
            userAnswer.toLowerCase().includes(keyword.toLowerCase())
          );

          if (question.type === 'technical-analysis') {
            score =
              hasKeywords && answerLength > 200 ? question.points * 0.8 : question.points * 0.6;
          } else if (question.type === 'system-design') {
            score =
              hasKeywords && answerLength > 300 ? question.points * 0.85 : question.points * 0.65;
          }

          isCorrect = score >= question.points * 0.7;
        }
      }

      earnedPoints += score;
      categoryScores[category].points += score;
      if (isCorrect) {
        categoryScores[category].correct++;
      }

      if (question.type === 'single' || question.type === 'multiple') {
        feedback[question.id] = isCorrect
          ? `✅ 回答正确！得分：${score}/${question.points}分`
          : `❌ 回答错误。正确答案：${question.correctAnswers.map((i) => question.options?.[i]).join(', ')}。得分：${score}/${question.points}分`;
      } else {
        feedback[question.id] =
          userAnswer && userAnswer.trim().length > 0
            ? `📝 主观题得分：${score.toFixed(1)}/${question.points}分。${score >= question.points * 0.7 ? '回答质量良好' : '建议补充更多技术细节'}`
            : `❌ 未作答，得分：0/${question.points}分`;
      }
    });

    const examResults: ProfessionalAdvancedExamResults = {
      totalQuestions: examQuestions.length,
      totalPoints,
      earnedPoints,
      score: Math.round((earnedPoints / totalPoints) * 100),
      timeUsed,
      categoryScores,
      answers,
      feedback,
    };

    setResults(examResults);
    setExamCompleted(true);
    setShowResults(true);
    onComplete?.(examResults);
  }, [timeLimit, timeRemaining, examQuestions, answers, onComplete]);

  // 计时器
  useEffect(() => {
    if (!examStarted || examCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examCompleted]);

  // 当时间到0时自动提交
  useEffect(() => {
    if (timeRemaining === 0 && examStarted && !examCompleted) {
      handleSubmitExam();
    }
  }, [timeRemaining, examStarted, examCompleted, handleSubmitExam]);

  const currentQuestion = examQuestions[currentQuestionIndex];

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'single':
      case 'multiple':
        return <FileText className="h-5 w-5" />;
      case 'technical-analysis':
        return <Lightbulb className="h-5 w-5" />;
      case 'system-design':
        return <Target className="h-5 w-5" />;
      default:
        return <Code className="h-5 w-5" />;
    }
  };

  const getQuestionTypeName = (type: string) => {
    switch (type) {
      case 'single':
        return '单选题';
      case 'multiple':
        return '多选题';
      case 'technical-analysis':
        return '技术分析题';
      case 'system-design':
        return '系统设计题';
      default:
        return '综合题';
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < difficulty ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (!examStarted) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {examType === 'technical-foundation' && '技术基础专项考试'}
            {examType === 'core-tech-depth' && '核心技术深度考试'}
            {examType === 'multimodal' && '多模态生成专项考试'}
            {examType === 'rlhf' && 'RLHF调优专项考试'}
            {examType === 'comprehensive' && '综合能力测试'}
          </CardTitle>
          <CardDescription>生成式人工智能应用工程师（高级）专业能力测试</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{examQuestions.length}</div>
              <div className="text-sm text-gray-600">题目总数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{timeLimit}</div>
              <div className="text-sm text-gray-600">考试时长（分钟）</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {examQuestions.reduce((sum, q) => sum + q.points, 0)}
              </div>
              <div className="text-sm text-gray-600">总分</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">考试说明</h4>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• 本考试包含单选题、多选题、技术分析题和系统设计题</li>
                  <li>• 技术分析题需要深入阐述技术原理和数学推导</li>
                  <li>• 系统设计题需要提供完整的架构设计方案</li>
                  <li>• 难度分为1-5星，星级越高难度越大</li>
                  <li>• 建议合理分配时间，优先完成选择题</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleStartExam}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3"
            >
              开始考试
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults && results) {
    return (
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            考试完成
          </CardTitle>
          <CardDescription>您的专业能力测试结果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-indigo-600 mb-2">{results.score}分</div>
            <div className="text-lg text-gray-600">
              获得 {results.earnedPoints.toFixed(1)} / {results.totalPoints} 分
            </div>
            <div className="text-sm text-gray-500 mt-2">用时：{formatTime(results.timeUsed)}</div>
          </div>

          {/* 分类得分 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(results.categoryScores).map(([category, scores]) => (
              <Card key={category} className="border-l-4 border-l-indigo-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>正确率</span>
                      <span>{Math.round((scores.correct / scores.total) * 100)}%</span>
                    </div>
                    <Progress value={(scores.correct / scores.total) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>得分：{scores.points.toFixed(1)}分</span>
                      <span>
                        {scores.correct}/{scores.total}题
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 详细反馈 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">详细反馈</h3>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {examQuestions.map((question, index) => (
                <Card key={question.id} className="border-l-4 border-l-gray-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getQuestionTypeIcon(question.type)}第{index + 1}题：
                        {getQuestionTypeName(question.type)}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="flex">{getDifficultyStars(question.difficulty)}</div>
                        <Badge variant="outline">{question.points}分</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{question.question}</p>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {results.feedback[question.id]}
                    </div>
                    {question.relatedConcepts && (
                      <div className="mt-2">
                        <strong className="text-xs">相关概念：</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {question.relatedConcepts.map((concept, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {concept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              重新考试
            </Button>
            <Button onClick={() => setShowResults(false)}>查看详细解析</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* 考试头部 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                题目 {currentQuestionIndex + 1} / {examQuestions.length}
              </Badge>
              <div className="flex items-center gap-1">
                {getDifficultyStars(currentQuestion.difficulty)}
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                {getQuestionTypeIcon(currentQuestion.type)}
                {getQuestionTypeName(currentQuestion.type)}
              </Badge>
              <Badge variant="secondary">{currentQuestion.subCategory}</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">剩余时间</div>
              <div className="text-lg font-mono font-bold text-red-600">
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={((currentQuestionIndex + 1) / examQuestions.length) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* 题目内容 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            【{getQuestionTypeName(currentQuestion.type)}】（{currentQuestion.points}分）
          </CardTitle>
          <CardDescription className="text-base text-gray-900 whitespace-pre-wrap">
            {currentQuestion.question}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentQuestion.type === 'single' && (
            <RadioGroup
              value={answers[currentQuestion.id]?.toString() || ''}
              onValueChange={(value) =>
                handleAnswerChange(currentQuestion.id, Number.parseInt(value))
              }
            >
              {currentQuestion.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50"
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === 'multiple' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    id={`option-${index}`}
                    checked={answers[currentQuestion.id]?.includes(index) || false}
                    onCheckedChange={(checked) => {
                      const currentAnswers = answers[currentQuestion.id] || [];
                      if (checked) {
                        handleAnswerChange(currentQuestion.id, [...currentAnswers, index]);
                      } else {
                        handleAnswerChange(
                          currentQuestion.id,
                          currentAnswers.filter((a: number) => a !== index)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {(currentQuestion.type === 'technical-analysis' ||
            currentQuestion.type === 'system-design') && (
            <div className="space-y-4">
              <Textarea
                placeholder={
                  currentQuestion.type === 'technical-analysis'
                    ? '请详细分析技术原理，包含数学推导、算法对比、优缺点分析等...'
                    : '请设计完整的系统架构，包含组件设计、数据流、技术选型、性能考虑等...'
                }
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="min-h-[400px]"
              />

              {currentQuestion.keywords && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">关键技术点：</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {currentQuestion.relatedConcepts && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900 mb-2">相关概念：</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.relatedConcepts.map((concept, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500">
                建议答题字数：
                {currentQuestion.type === 'technical-analysis' && '300-800字'}
                {currentQuestion.type === 'system-design' && '500-1200字'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 导航按钮 */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          上一题
        </Button>

        <div className="flex space-x-2">
          {currentQuestionIndex === examQuestions.length - 1 ? (
            <Button
              onClick={handleSubmitExam}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              提交考试
            </Button>
          ) : (
            <Button
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))
              }
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              下一题
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
