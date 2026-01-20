/**
 * @fileoverview 性能配置文件 - 定义性能阈值和测量点
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

export interface PerformanceThreshold {
  name: string
  description: string
  threshold: number
  unit: string
  critical: boolean
}

export interface PerformanceMetric {
  name: string
  value: number
  threshold: number
  unit: string
  status: 'pass' | 'fail' | 'warning'
  timestamp: number
}

export interface PerformanceReport {
  timestamp: number
  metrics: PerformanceMetric[]
  overallScore: number
  recommendations: string[]
}

export const PERFORMANCE_THRESHOLDS: PerformanceThreshold[] = [
  {
    name: 'componentRenderTime',
    description: '组件渲染时间',
    threshold: 40,
    unit: 'ms',
    critical: true,
  },
  {
    name: 'firstContentfulPaint',
    description: '首次内容绘制',
    threshold: 1800,
    unit: 'ms',
    critical: true,
  },
  {
    name: 'largestContentfulPaint',
    description: '最大内容绘制',
    threshold: 2500,
    unit: 'ms',
    critical: true,
  },
  {
    name: 'firstInputDelay',
    description: '首次输入延迟',
    threshold: 100,
    unit: 'ms',
    critical: true,
  },
  {
    name: 'cumulativeLayoutShift',
    description: '累积布局偏移',
    threshold: 0.1,
    unit: '',
    critical: true,
  },
  {
    name: 'timeToInteractive',
    description: '可交互时间',
    threshold: 3800,
    unit: 'ms',
    critical: true,
  },
  {
    name: 'totalBlockingTime',
    description: '总阻塞时间',
    threshold: 300,
    unit: 'ms',
    critical: true,
  },
  {
    name: 'cacheHitRate',
    description: '缓存命中率',
    threshold: 90,
    unit: '%',
    critical: false,
  },
  {
    name: 'databaseQueryTime',
    description: '数据库查询时间',
    threshold: 100,
    unit: 'ms',
    critical: true,
  },
  {
    name: 'apiResponseTime',
    description: 'API响应时间',
    threshold: 200,
    unit: 'ms',
    critical: true,
  },
]

export const PERFORMANCE_MEASUREMENT_POINTS = [
  {
    name: 'HomePage',
    path: '/',
    description: '首页性能',
  },
  {
    name: 'AIAssistantPage',
    path: '/ai-assistant',
    description: 'AI助手页面性能',
  },
  {
    name: 'LearningPage',
    path: '/learning',
    description: '学习页面性能',
  },
  {
    name: 'IntelligentAIWidget',
    component: 'IntelligentAIWidget',
    description: '智能AI浮窗组件性能',
  },
]

export function evaluatePerformanceMetric(
  name: string,
  value: number
): PerformanceMetric {
  const threshold = PERFORMANCE_THRESHOLDS.find(t => t.name === name)
  
  if (!threshold) {
    throw new Error(`Unknown performance metric: ${name}`)
  }

  let status: 'pass' | 'fail' | 'warning'
  
  if (threshold.critical) {
    status = value <= threshold.threshold ? 'pass' : 'fail'
  } else {
    if (value >= threshold.threshold) {
      status = 'pass'
    } else if (value >= threshold.threshold * 0.8) {
      status = 'warning'
    } else {
      status = 'fail'
    }
  }

  return {
    name,
    value,
    threshold: threshold.threshold,
    unit: threshold.unit,
    status,
    timestamp: Date.now(),
  }
}

export function generatePerformanceReport(
  metrics: PerformanceMetric[]
): PerformanceReport {
  const passCount = metrics.filter(m => m.status === 'pass').length
  const warningCount = metrics.filter(m => m.status === 'warning').length
  const failCount = metrics.filter(m => m.status === 'fail').length
  
  const overallScore = Math.round(
    (passCount / metrics.length) * 100
  )

  const recommendations: string[] = []

  metrics.forEach(metric => {
    if (metric.status === 'fail') {
      recommendations.push(`⚠️ ${metric.name} (${metric.value}${metric.unit}) 超过阈值 ${metric.threshold}${metric.unit}`)
    } else if (metric.status === 'warning') {
      recommendations.push(`⚡ ${metric.name} (${metric.value}${metric.unit}) 接近阈值 ${metric.threshold}${metric.unit}`)
    }
  })

  return {
    timestamp: Date.now(),
    metrics,
    overallScore,
    recommendations,
  }
}

export function formatPerformanceReport(report: PerformanceReport): string {
  const lines = [
    '📊 性能测试报告',
    `📅 测试时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}`,
    `🎯 总体评分: ${report.overallScore}/100`,
    '',
    '📈 性能指标:',
    ...report.metrics.map(m => {
      const statusIcon = m.status === 'pass' ? '✅' : m.status === 'warning' ? '⚡' : '❌'
      return `  ${statusIcon} ${m.name}: ${m.value}${m.unit} (阈值: ${m.threshold}${m.unit})`
    }),
    '',
    '💡 优化建议:',
    ...report.recommendations.map(r => `  ${r}`),
  ]

  return lines.join('\n')
}
