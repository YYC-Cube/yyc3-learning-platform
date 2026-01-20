/**
 * @fileoverview 实时性能监控面板组件
 * @description 显示实时性能指标和图表
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-31
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertTriangle, CheckCircle, Clock, Database, Globe, Zap } from 'lucide-react';
import { performanceMonitor } from '@/lib/performance-monitor';
import type { PerformanceMetric } from '@/lib/performance.config';

interface PerformanceDashboardProps {
  refreshInterval?: number;
}

export function PerformanceDashboard({ refreshInterval = 5000 }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    const loadMetrics = () => {
      const currentMetrics = performanceMonitor.getMetrics();
      setMetrics(currentMetrics);
      setIsLoading(false);
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getMetricStatus = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressValue = (metric: PerformanceMetric) => {
    if (metric.threshold === 0) return 100;
    const percentage = (metric.value / metric.threshold) * 100;
    return Math.min(percentage, 100);
  };

  const getProgressColor = (metric: PerformanceMetric) => {
    const percentage = getProgressValue(metric);
    if (percentage <= 50) return 'bg-green-500';
    if (percentage <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const webVitalsMetrics = metrics.filter(m =>
    ['firstContentfulPaint', 'largestContentfulPaint', 'firstInputDelay', 'cumulativeLayoutShift', 'interactionToNextPaint'].includes(m.name)
  );

  const resourceMetrics = metrics.filter(m =>
    ['componentRenderTime', 'databaseQueryTime', 'apiResponseTime', 'cacheHitRate'].includes(m.name)
  );

  const overallScore = metrics.length > 0
    ? Math.round((metrics.filter(m => m.status === 'pass').length / metrics.length) * 100)
    : 0;

  const criticalIssues = metrics.filter(m => m.status === 'fail');
  const warnings = metrics.filter(m => m.status === 'warning');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">加载性能数据...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总体评分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{overallScore}</span>
              <Badge variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'}>
                {overallScore >= 80 ? '优秀' : overallScore >= 60 ? '良好' : '需改进'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">监控指标</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.length}</div>
            <p className="text-xs text-gray-600 mt-1">个性能指标</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">严重问题</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-red-600">{criticalIssues.length}</span>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">警告</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-yellow-600">{warnings.length}</span>
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="resources">资源性能</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>性能指标概览</CardTitle>
              <CardDescription>所有监控的性能指标状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getMetricStatus(metric.status)}
                        <span className="font-medium">{metric.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {metric.value.toFixed(2)}{metric.unit}
                        </span>
                        <Badge className={getMetricColor(metric.status)}>
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={getProgressValue(metric)}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>阈值: {metric.threshold}{metric.unit}</span>
                      <span>{new Date(metric.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="web-vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Web Vitals 指标</CardTitle>
              <CardDescription>核心Web性能指标</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {webVitalsMetrics.map((metric) => (
                  <Card key={metric.name} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{metric.name}</CardTitle>
                        {getMetricStatus(metric.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {metric.value.toFixed(2)}{metric.unit}
                        </div>
                        <Progress
                          value={getProgressValue(metric)}
                          className="h-2"
                        />
                        <div className="text-xs text-gray-600">
                          阈值: {metric.threshold}{metric.unit}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>资源性能指标</CardTitle>
              <CardDescription>组件、数据库和API性能</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resourceMetrics.map((metric) => (
                  <div key={metric.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {metric.name.includes('component') && <Zap className="h-5 w-5 text-blue-600" />}
                        {metric.name.includes('database') && <Database className="h-5 w-5 text-blue-600" />}
                        {metric.name.includes('api') && <Globe className="h-5 w-5 text-blue-600" />}
                        {metric.name.includes('cache') && <Clock className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-xs text-gray-600">
                          {metric.value.toFixed(2)}{metric.unit}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getMetricColor(metric.status)}>
                        {metric.status}
                      </Badge>
                      {getMetricStatus(metric.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PerformanceDashboard;
