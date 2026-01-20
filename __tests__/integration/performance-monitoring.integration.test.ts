/**
 * @fileoverview 性能监控系统集成测试
 * @description 测试性能监控系统的各个模块
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-31
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { performanceMonitor } from '@/lib/performance-monitor'
import { performanceAlertManager } from '@/lib/performance-alerts'
import { performanceDataStore } from '@/lib/performance-data-store'
import type { PerformanceMetric } from '@/lib/performance.config'

describe('性能监控系统集成测试', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics()
    performanceAlertManager.clearAlerts()
    performanceDataStore.clearAll()
  })

  afterEach(() => {
    performanceMonitor.clearMetrics()
    performanceAlertManager.clearAlerts()
    performanceDataStore.clearAll()
  })

  describe('性能数据采集', () => {
    it('应该正确记录性能指标', () => {
      performanceMonitor.recordMetric('componentRenderTime', 50)
      performanceMonitor.recordMetric('firstContentfulPaint', 1500)
      performanceMonitor.recordMetric('apiResponseTime', 180)

      const metrics = performanceMonitor.getMetrics()

      expect(metrics).toHaveLength(3)
      expect(metrics[0].name).toBe('componentRenderTime')
      expect(metrics[0].value).toBe(50)
      expect(metrics[1].name).toBe('firstContentfulPaint')
      expect(metrics[1].value).toBe(1500)
      expect(metrics[2].name).toBe('apiResponseTime')
      expect(metrics[2].value).toBe(180)
    })

    it('应该正确评估性能指标状态', () => {
      performanceMonitor.recordMetric('componentRenderTime', 30)
      performanceMonitor.recordMetric('componentRenderTime', 50)
      performanceMonitor.recordMetric('componentRenderTime', 100)

      const metrics = performanceMonitor.getMetrics()

      expect(metrics[0].status).toBe('pass')
      expect(metrics[1].status).toBe('fail')
      expect(metrics[2].status).toBe('fail')
    })

    it('应该生成性能报告', () => {
      performanceMonitor.recordMetric('componentRenderTime', 30)
      performanceMonitor.recordMetric('firstContentfulPaint', 1500)
      performanceMonitor.recordMetric('apiResponseTime', 180)

      const report = performanceMonitor.generateReport()

      expect(report).toHaveProperty('timestamp')
      expect(report).toHaveProperty('metrics')
      expect(report).toHaveProperty('overallScore')
      expect(report).toHaveProperty('recommendations')
      expect(report.metrics).toHaveLength(3)
      expect(report.overallScore).toBeGreaterThanOrEqual(0)
      expect(report.overallScore).toBeLessThanOrEqual(100)
    })
  })

  describe('性能指标测量', () => {
    it('应该测量组件渲染时间', () => {
      const renderFn = vi.fn(() => {
        for (let i = 0; i < 1000; i++) {
          Math.sqrt(i)
        }
      })

      performanceMonitor.measureComponentRender('TestComponent', renderFn)

      expect(renderFn).toHaveBeenCalled()

      const metrics = performanceMonitor.getMetrics()
      const renderMetric = metrics.find(m => m.name === 'componentRenderTime')

      expect(renderMetric).toBeDefined()
      expect(renderMetric!.value).toBeGreaterThan(0)
    })

    it('应该测量数据库查询时间', async () => {
      const queryFn = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return { id: 1, name: 'Test' }
      })

      await performanceMonitor.measureDatabaseQuery('testQuery', queryFn)

      expect(queryFn).toHaveBeenCalled()

      const metrics = performanceMonitor.getMetrics()
      const queryMetric = metrics.find(m => m.name === 'databaseQueryTime')

      expect(queryMetric).toBeDefined()
      expect(queryMetric!.value).toBeGreaterThan(0)
    })

    it('应该测量API调用时间', async () => {
      const apiFn = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return { success: true }
      })

      await performanceMonitor.measureApiCall('testApi', apiFn)

      expect(apiFn).toHaveBeenCalled()

      const metrics = performanceMonitor.getMetrics()
      const apiMetric = metrics.find(m => m.name === 'apiResponseTime')

      expect(apiMetric).toBeDefined()
      expect(apiMetric!.value).toBeGreaterThan(0)
    })

    it('应该记录缓存命中率', () => {
      performanceMonitor.recordCacheHitRate(85, 100)
      performanceMonitor.recordCacheHitRate(95, 100)

      const metrics = performanceMonitor.getMetrics()
      const cacheMetrics = metrics.filter(m => m.name === 'cacheHitRate')

      expect(cacheMetrics).toHaveLength(2)
      expect(cacheMetrics[0].value).toBe(85)
      expect(cacheMetrics[1].value).toBe(95)
    })
  })

  describe('异常告警机制', () => {
    it('应该在指标超过阈值时触发告警', () => {
      const metric: PerformanceMetric = {
        name: 'componentRenderTime',
        value: 150,
        threshold: 40,
        unit: 'ms',
        status: 'fail',
        timestamp: Date.now(),
      }

      performanceAlertManager.checkMetric(metric)

      const alerts = performanceAlertManager.getAlerts()

      expect(alerts).toHaveLength(1)
      expect(alerts[0].type).toBe('critical')
      expect(alerts[0].metric).toBe('componentRenderTime')
      expect(alerts[0].value).toBe(150)
    })

    it('应该在指标低于阈值时触发告警', () => {
      const metric: PerformanceMetric = {
        name: 'cacheHitRate',
        value: 70,
        threshold: 90,
        unit: '%',
        status: 'fail',
        timestamp: Date.now(),
      }

      performanceAlertManager.checkMetric(metric)

      const alerts = performanceAlertManager.getAlerts()

      expect(alerts).toHaveLength(1)
      expect(alerts[0].type).toBe('warning')
      expect(alerts[0].metric).toBe('cacheHitRate')
      expect(alerts[0].value).toBe(70)
    })

    it('应该遵守告警冷却时间', () => {
      const metric: PerformanceMetric = {
        name: 'componentRenderTime',
        value: 150,
        threshold: 40,
        unit: 'ms',
        status: 'fail',
        timestamp: Date.now(),
      }

      performanceAlertManager.checkMetric(metric)
      performanceAlertManager.checkMetric(metric)

      const alerts = performanceAlertManager.getAlerts()

      expect(alerts).toHaveLength(1)
    })

    it('应该正确统计告警信息', () => {
      const criticalMetric: PerformanceMetric = {
        name: 'componentRenderTime',
        value: 150,
        threshold: 40,
        unit: 'ms',
        status: 'fail',
        timestamp: Date.now(),
      }

      const warningMetric: PerformanceMetric = {
        name: 'cacheHitRate',
        value: 70,
        threshold: 90,
        unit: '%',
        status: 'fail',
        timestamp: Date.now(),
      }

      performanceAlertManager.checkMetric(criticalMetric)
      performanceAlertManager.checkMetric(warningMetric)

      const stats = performanceAlertManager.getAlertStats()

      expect(stats.total).toBe(2)
      expect(stats.critical).toBe(1)
      expect(stats.warning).toBe(1)
      expect(stats.info).toBe(0)
      expect(stats.unacknowledged).toBe(2)
    })
  })

  describe('数据存储', () => {
    it('应该正确存储性能数据', () => {
      const metrics: PerformanceMetric[] = [
        {
          name: 'componentRenderTime',
          value: 50,
          threshold: 40,
          unit: 'ms',
          status: 'fail',
          timestamp: Date.now(),
        },
        {
          name: 'firstContentfulPaint',
          value: 1500,
          threshold: 1800,
          unit: 'ms',
          status: 'pass',
          timestamp: Date.now(),
        },
      ]

      const dataId = performanceDataStore.storePerformanceData(metrics, {
        url: 'http://localhost:3000/test',
        userId: 'test-user',
      })

      expect(dataId).toBeDefined()
      expect(dataId).toMatch(/^perf-\d+-[a-z0-9]+$/)

      const storedData = performanceDataStore.queryPerformanceData()

      expect(storedData).toHaveLength(1)
      expect(storedData[0].metrics).toHaveLength(2)
    })

    it('应该正确查询性能数据', () => {
      const metrics: PerformanceMetric[] = [
        {
          name: 'componentRenderTime',
          value: 50,
          threshold: 40,
          unit: 'ms',
          status: 'fail',
          timestamp: Date.now(),
        },
      ]

      performanceDataStore.storePerformanceData(metrics, {
        url: 'http://localhost:3000/test',
      })

      const queryResult = performanceDataStore.queryPerformanceData({
        url: 'http://localhost:3000/test',
      })

      expect(queryResult).toHaveLength(1)
      expect(queryResult[0].url).toBe('http://localhost:3000/test')
    })

    it('应该正确聚合性能指标', () => {
      const now = Date.now()
      for (let i = 0; i < 10; i++) {
        const metric: PerformanceMetric = {
          name: 'componentRenderTime',
          value: 30 + i * 5,
          threshold: 40,
          unit: 'ms',
          status: i < 3 ? 'pass' : 'fail',
          timestamp: now - (10 - i) * 60000,
        }

        performanceDataStore.storePerformanceData([metric])
      }

      const aggregation = performanceDataStore.aggregatePerformanceMetrics(
        'componentRenderTime',
        'hour'
      )

      expect(aggregation.metricName).toBe('componentRenderTime')
      expect(aggregation.period).toBe('hour')
      expect(aggregation.count).toBe(10)
      expect(aggregation.avg).toBeGreaterThan(30)
      expect(aggregation.min).toBe(30)
      expect(aggregation.max).toBe(75)
      expect(aggregation.p50).toBeDefined()
      expect(aggregation.p95).toBeDefined()
      expect(aggregation.p99).toBeDefined()
    })

    it('应该正确导出数据', () => {
      const metrics: PerformanceMetric[] = [
        {
          name: 'componentRenderTime',
          value: 50,
          threshold: 40,
          unit: 'ms',
          status: 'fail',
          timestamp: Date.now(),
        },
      ]

      performanceDataStore.storePerformanceData(metrics)

      const jsonData = performanceDataStore.exportData('json')
      const csvData = performanceDataStore.exportData('csv')

      expect(jsonData).toContain('componentRenderTime')
      expect(csvData).toContain('componentRenderTime')
      expect(csvData).toContain(',')
    })

    it('应该正确清理旧数据', () => {
      const now = Date.now()
      for (let i = 0; i < 5; i++) {
        const metric: PerformanceMetric = {
          name: 'componentRenderTime',
          value: 50,
          threshold: 40,
          unit: 'ms',
          status: 'fail',
          timestamp: now - (i + 1) * 24 * 60 * 60 * 1000,
        }

        performanceDataStore.storePerformanceData([metric])
      }

      const result = performanceDataStore.clearOldData(2 * 24 * 60 * 60 * 1000)

      expect(result.deletedData).toBe(3)
      expect(result.deletedAlerts).toBe(0)

      const remainingData = performanceDataStore.queryPerformanceData()
      expect(remainingData.length).toBeLessThan(5)
    })
  })

  describe('端到端集成测试', () => {
    it('应该完整执行性能监控流程', async () => {
      const renderFn = vi.fn(() => {
        for (let i = 0; i < 1000; i++) {
          Math.sqrt(i)
        }
      })

      performanceMonitor.measureComponentRender('TestComponent', renderFn)

      const metrics = performanceMonitor.getMetrics()
      const renderMetric = metrics.find(m => m.name === 'componentRenderTime')

      expect(renderMetric).toBeDefined()

      if (renderMetric) {
        performanceAlertManager.checkMetric(renderMetric)

        const alerts = performanceAlertManager.getAlerts()

        if (renderMetric.status === 'fail') {
          expect(alerts.length).toBeGreaterThan(0)
        }

        performanceDataStore.storePerformanceData([renderMetric], {
          url: 'http://localhost:3000/test',
        })

        const storedData = performanceDataStore.queryPerformanceData()

        expect(storedData).toHaveLength(1)
        expect(storedData[0].metrics[0].name).toBe('componentRenderTime')
      }
    })

    it('应该正确处理多个性能指标', () => {
      const metrics: PerformanceMetric[] = [
        {
          name: 'componentRenderTime',
          value: 30,
          threshold: 40,
          unit: 'ms',
          status: 'pass',
          timestamp: Date.now(),
        },
        {
          name: 'firstContentfulPaint',
          value: 1500,
          threshold: 1800,
          unit: 'ms',
          status: 'pass',
          timestamp: Date.now(),
        },
        {
          name: 'apiResponseTime',
          value: 250,
          threshold: 200,
          unit: 'ms',
          status: 'fail',
          timestamp: Date.now(),
        },
      ]

      metrics.forEach(metric => {
        performanceMonitor.recordMetric(metric.name, metric.value)
        performanceAlertManager.checkMetric(metric)
      })

      const allMetrics = performanceMonitor.getMetrics()
      const allAlerts = performanceAlertManager.getAlerts()

      expect(allMetrics).toHaveLength(3)
      expect(allAlerts).toHaveLength(1)
      expect(allAlerts[0].metric).toBe('apiResponseTime')

      performanceDataStore.storePerformanceData(metrics)

      const storedData = performanceDataStore.queryPerformanceData()
      expect(storedData).toHaveLength(1)
      expect(storedData[0].metrics).toHaveLength(3)
    })
  })
})
