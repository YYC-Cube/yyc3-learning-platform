/**
 * @fileoverview UI组件 · insights-dashboard.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */

'use client';

import { Activity, BarChart3, PieChart, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

export interface InsightMetric {
  id: string;
  title: string;
  value: string;
  trend: string;
  trendValue: number;
  positive: boolean;
  icon: string;
  category: 'activity' | 'performance' | 'usage' | 'engagement';
}

export interface InsightData {
  period: 'today' | 'week' | 'month' | 'year';
  metrics: InsightMetric[];
  charts: ChartData[];
  recommendations: Recommendation[];
}

export interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie';
  data: DataPoint[];
}

export interface DataPoint {
  label: string;
  value: number;
  timestamp?: Date;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  category: string;
}

export interface InsightsDashboardProps {
  onPeriodChange?: (period: 'today' | 'week' | 'month' | 'year') => void;
  onRecommendationAction?: (recommendationId: string) => void;
}

interface MetricCardProps {
  metric: InsightMetric;
  onClick?: () => void;
}

interface ChartCardProps {
  chart: ChartData;
  height?: number;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAction?: () => void;
}

export const InsightsDashboard: React.FC<InsightsDashboardProps> = ({
  onPeriodChange,
  onRecommendationAction,
}) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsightData(period);
  }, [period]);

  const loadInsightData = useCallback(
    async (selectedPeriod: 'today' | 'week' | 'month' | 'year') => {
      setLoading(true);

      try {
        const data = await generateInsightData(selectedPeriod);
        setInsightData(data);
      } catch (error) {
        console.error('加载洞察数据失败:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handlePeriodChange = useCallback(
    (newPeriod: 'today' | 'week' | 'month' | 'year') => {
      setPeriod(newPeriod);
      onPeriodChange?.(newPeriod);
    },
    [onPeriodChange]
  );

  const handleRecommendationAction = useCallback(
    (recommendationId: string) => {
      onRecommendationAction?.(recommendationId);
    },
    [onRecommendationAction]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">加载洞察数据...</p>
        </div>
      </div>
    );
  }

  if (!insightData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">无法加载洞察数据</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">使用洞察</h3>
          <div className="flex items-center space-x-2">
            <PeriodButton
              label="今天"
              active={period === 'today'}
              onClick={() => handlePeriodChange('today')}
            />
            <PeriodButton
              label="本周"
              active={period === 'week'}
              onClick={() => handlePeriodChange('week')}
            />
            <PeriodButton
              label="本月"
              active={period === 'month'}
              onClick={() => handlePeriodChange('month')}
            />
            <PeriodButton
              label="今年"
              active={period === 'year'}
              onClick={() => handlePeriodChange('year')}
            />
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 核心指标 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-indigo-500" />
            核心指标
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {insightData.metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>

        {/* 图表 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-indigo-500" />
            数据趋势
          </h4>
          <div className="space-y-4">
            {insightData.charts.map((chart) => (
              <ChartCard key={chart.id} chart={chart} height={200} />
            ))}
          </div>
        </div>

        {/* 推荐建议 */}
        {insightData.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-orange-500" />
              智能建议
            </h4>
            <div className="space-y-3">
              {insightData.recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onAction={() => handleRecommendationAction(recommendation.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

InsightsDashboard.displayName = 'InsightsDashboard';

const MetricCard: React.FC<MetricCardProps> = React.memo(({ metric }) => {
  const TrendIcon = metric.positive ? TrendingUp : TrendingDown;
  const trendColor = metric.positive ? 'text-green-600' : 'text-red-600';

  return (
    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="text-2xl">{metric.icon}</div>
        <div className={`flex items-center space-x-1 text-xs font-semibold ${trendColor}`}>
          <TrendIcon className="w-3 h-3" />
          <span>{metric.trend}</span>
        </div>
      </div>

      <div className="text-2xl font-bold text-indigo-600 mb-1">{metric.value}</div>
      <div className="text-sm text-gray-600">{metric.title}</div>
    </div>
  );
});

MetricCard.displayName = 'MetricCard';

const ChartCard: React.FC<ChartCardProps> = React.memo(({ chart, height = 200 }) => {
  const maxValue = Math.max(...chart.data.map((d) => d.value));
  const minValue = Math.min(...chart.data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h5 className="text-sm font-semibold text-gray-900 mb-3">{chart.title}</h5>
      <div className="relative" style={{ height: `${height}px` }}>
        {chart.type === 'line' && (
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${chart.data.length * 40} ${height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`gradient-${chart.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d={chart.data
                .map((point, index) => {
                  const x = index * 40 + 20;
                  const y = height - ((point.value - minValue) / range) * (height - 40) - 20;
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill={`url(#gradient-${chart.id})`}
              stroke="hsl(var(--secondary))"
              strokeWidth="2"
            />

            {chart.data.map((point, index) => {
              const x = index * 40 + 20;
              const y = height - ((point.value - minValue) / range) * (height - 40) - 20;
              return <circle key={index} cx={x} cy={y} r="4" fill="hsl(var(--secondary))" />;
            })}
          </svg>
        )}

        {chart.type === 'bar' && (
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${chart.data.length * 50} ${height}`}
            preserveAspectRatio="none"
          >
            {chart.data.map((point, index) => {
              const barHeight = ((point.value - minValue) / range) * (height - 40);
              const x = index * 50 + 10;
              const y = height - barHeight - 20;

              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width="30"
                    height={barHeight}
                    fill="hsl(var(--secondary))"
                    rx="4"
                  />
                  <text x={x + 15} y={y - 5} textAnchor="middle" className="text-xs fill-gray-600">
                    {point.value}
                  </text>
                  <text
                    x={x + 15}
                    y={height - 5}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {chart.type === 'pie' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <PieChart className="w-16 h-16 mx-auto text-indigo-600 mb-2" />
              <p className="text-sm text-gray-600">饼图数据</p>
              <div className="mt-2 space-y-1">
                {chart.data.map((point, index) => (
                  <div key={index} className="flex items-center justify-center space-x-2 text-xs">
                    <div
                      className="w-3 h-3 rounded"
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? 'hsl(var(--secondary))' : 'hsl(var(--accent))',
                      }}
                    />
                    <span>
                      {point.label}: {point.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ChartCard.displayName = 'ChartCard';

const RecommendationCard: React.FC<RecommendationCardProps> = React.memo(
  ({ recommendation, onAction }) => {
    const priorityColors = {
      high: 'border-red-300 bg-red-50',
      medium: 'border-yellow-300 bg-yellow-50',
      low: 'border-blue-300 bg-blue-50',
    };

    const priorityLabels = {
      high: '高优先级',
      medium: '中优先级',
      low: '低优先级',
    };

    return (
      <div className={`p-4 rounded-lg border ${priorityColors[recommendation.priority]}`}>
        <div className="flex items-start justify-between mb-2">
          <h5 className="font-semibold text-gray-900">{recommendation.title}</h5>
          <span className="text-xs px-2 py-1 rounded-full bg-white/60">
            {priorityLabels[recommendation.priority]}
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-3">{recommendation.description}</p>
        {recommendation.actionable && (
          <button
            onClick={onAction}
            className="w-full px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            立即行动
          </button>
        )}
      </div>
    );
  }
);

RecommendationCard.displayName = 'RecommendationCard';

const PeriodButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = React.memo(
  ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  )
);

PeriodButton.displayName = 'PeriodButton';

async function generateInsightData(
  period: 'today' | 'week' | 'month' | 'year'
): Promise<InsightData> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const periodMultipliers = {
    today: 1,
    week: 7,
    month: 30,
    year: 365,
  };

  const multiplier = periodMultipliers[period];

  const metrics: InsightMetric[] = [
    {
      id: 'activity',
      title: '活跃度',
      value: `${Math.round(85 * (1 + Math.random() * 0.1))}%`,
      trend: `+${Math.round(12 * multiplier)}%`,
      trendValue: 12 * multiplier,
      positive: true,
      icon: '📊',
      category: 'activity',
    },
    {
      id: 'completion',
      title: '任务完成率',
      value: `${Math.round(92 * (1 + Math.random() * 0.05))}%`,
      trend: `+${Math.round(5 * multiplier)}%`,
      trendValue: 5 * multiplier,
      positive: true,
      icon: '✅',
      category: 'performance',
    },
    {
      id: 'messages',
      title: '消息数量',
      value: `${Math.round(156 * multiplier)}`,
      trend: `+${Math.round(23 * multiplier)}%`,
      trendValue: 23 * multiplier,
      positive: true,
      icon: '💬',
      category: 'usage',
    },
    {
      id: 'response',
      title: '响应时间',
      value: `${Math.round(1.2 * (1 - Math.random() * 0.1))}s`,
      trend: `-${Math.round(15 * multiplier)}%`,
      trendValue: -15 * multiplier,
      positive: true,
      icon: '⚡',
      category: 'performance',
    },
  ];

  const charts: ChartData[] = [
    {
      id: 'activity-trend',
      title: '活跃度趋势',
      type: 'line',
      data: Array.from({ length: 7 }, (_, i) => ({
        label: `${i + 1}`,
        value: Math.round(70 + Math.random() * 30),
      })),
    },
    {
      id: 'usage-distribution',
      title: '使用分布',
      type: 'bar',
      data: [
        { label: '聊天', value: Math.round(45 + Math.random() * 10) },
        { label: '工具', value: Math.round(25 + Math.random() * 10) },
        { label: '洞察', value: Math.round(15 + Math.random() * 5) },
        { label: '工作流', value: Math.round(10 + Math.random() * 5) },
        { label: '知识库', value: Math.round(5 + Math.random() * 5) },
      ],
    },
  ];

  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: '增加工具使用频率',
      description: '您在工具模块的使用上还有提升空间，建议多尝试使用AI工具提高工作效率。',
      priority: 'medium',
      actionable: true,
      category: 'usage',
    },
    {
      id: '2',
      title: '优化消息处理流程',
      description: '您的消息响应时间表现优秀，可以考虑使用工作流自动化进一步优化。',
      priority: 'high',
      actionable: true,
      category: 'workflow',
    },
    {
      id: '3',
      title: '探索知识库功能',
      description: '知识库中包含丰富的资源，建议您定期浏览和学习。',
      priority: 'low',
      actionable: true,
      category: 'knowledge',
    },
  ];

  return {
    period,
    metrics,
    charts,
    recommendations,
  };
}

export default InsightsDashboard;
