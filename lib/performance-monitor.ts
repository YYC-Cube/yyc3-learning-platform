/**
 * @fileoverview 性能监控模块 - Web Vitals监控和性能数据收集
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import { evaluatePerformanceMetric, generatePerformanceReport, formatPerformanceReport, type PerformanceMetric } from './performance.config'

interface PerformanceData {
  timestamp: number
  url: string
  metrics: PerformanceMetric[]
}

interface PerformanceObserverOptions {
  reportUrl?: string
  enableConsoleLog?: boolean
  sampleRate?: number
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map()
  private options: PerformanceObserverOptions
  private reportQueue: PerformanceData[] = []
  private isInitialized = false

  constructor(options: PerformanceObserverOptions = {}) {
    this.options = {
      reportUrl: '/api/performance',
      enableConsoleLog: process.env.NODE_ENV === 'development',
      sampleRate: 1,
      ...options,
    }
  }

  initialize() {
    if (this.isInitialized) {
      console.warn('PerformanceMonitor already initialized')
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    this.observeWebVitals()
    this.observeCustomMetrics()
    this.setupPerformanceObserver()

    this.isInitialized = true

    if (this.options.enableConsoleLog) {
      console.log('🚀 PerformanceMonitor initialized')
    }
  }

  private observeWebVitals() {
    onCLS((metric) => {
      this.recordMetric('cumulativeLayoutShift', metric.value)
    })

    onFCP((metric) => {
      this.recordMetric('firstContentfulPaint', metric.value)
    })

    onFID((metric) => {
      this.recordMetric('firstInputDelay', metric.value)
    })

    onINP((metric) => {
      this.recordMetric('interactionToNextPaint', metric.value)
    })

    onLCP((metric) => {
      this.recordMetric('largestContentfulPaint', metric.value)
    })

    onTTFB((metric) => {
      this.recordMetric('timeToFirstByte', metric.value)
    })
  }

  private observeCustomMetrics() {
    if (typeof window === 'undefined') {
      return
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

        if (perfData) {
          this.recordMetric('domContentLoaded', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart)
          this.recordMetric('loadComplete', perfData.loadEventEnd - perfData.loadEventStart)
          this.recordMetric('timeToInteractive', perfData.domInteractive - perfData.fetchStart)
          this.recordMetric('totalBlockingTime', this.calculateTotalBlockingTime(perfData))
        }
      }, 0)
    })
  }

  private calculateTotalBlockingTime(perfData: PerformanceNavigationTiming): number {
    const entries = performance.getEntriesByType('longtask') as PerformanceEntry[]
    let totalBlockingTime = 0

    entries.forEach((entry) => {
      if (entry.startTime >= perfData.domContentLoadedEventEnd) {
        totalBlockingTime += entry.duration - 50
      }
    })

    return totalBlockingTime
  }

  private setupPerformanceObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          const measure = entry as PerformanceMeasure
          this.recordMetric(measure.name, measure.duration)
        }
      }
    })

    observer.observe({ entryTypes: ['measure'] })
  }

  recordMetric(name: string, value: number) {
    const metric = evaluatePerformanceMetric(name, value)
    this.metrics.set(name, metric.value)

    if (this.options.enableConsoleLog) {
      const statusIcon = metric.status === 'pass' ? '✅' : metric.status === 'warning' ? '⚡' : '❌'
      console.log(`${statusIcon} ${name}: ${metric.value}${metric.unit} (阈值: ${metric.threshold}${metric.unit})`)
    }
  }

  measureComponentRender(componentName: string, renderFn: () => void) {
    const startMark = `${componentName}-render-start`
    const endMark = `${componentName}-render-end`
    const measureName = `${componentName}RenderTime`

    performance.mark(startMark)

    renderFn()

    performance.mark(endMark)
    performance.measure(measureName, startMark, endMark)

    const measure = performance.getEntriesByName(measureName, 'measure')[0] as PerformanceMeasure
    if (measure) {
      this.recordMetric('componentRenderTime', measure.duration)
    }

    performance.clearMarks(startMark, endMark)
    performance.clearMeasures(measureName)
  }

  measureDatabaseQuery(queryName: string, queryFn: () => Promise<any>): Promise<any> {
    const startMark = `${queryName}-query-start`
    const endMark = `${queryName}-query-end`
    const measureName = `${queryName}QueryTime`

    performance.mark(startMark)

    return queryFn()
      .then((result) => {
        performance.mark(endMark)
        performance.measure(measureName, startMark, endMark)

        const measure = performance.getEntriesByName(measureName, 'measure')[0] as PerformanceMeasure
        if (measure) {
          this.recordMetric('databaseQueryTime', measure.duration)
        }

        performance.clearMarks(startMark, endMark)
        performance.clearMeasures(measureName)

        return result
      })
      .catch((error) => {
        performance.clearMarks(startMark, endMark)
        throw error
      })
  }

  measureApiCall(apiName: string, apiFn: () => Promise<any>): Promise<any> {
    const startMark = `${apiName}-call-start`
    const endMark = `${apiName}-call-end`
    const measureName = `${apiName}ResponseTime`

    performance.mark(startMark)

    return apiFn()
      .then((result) => {
        performance.mark(endMark)
        performance.measure(measureName, startMark, endMark)

        const measure = performance.getEntriesByName(measureName, 'measure')[0] as PerformanceMeasure
        if (measure) {
          this.recordMetric('apiResponseTime', measure.duration)
        }

        performance.clearMarks(startMark, endMark)
        performance.clearMeasures(measureName)

        return result
      })
      .catch((error) => {
        performance.clearMarks(startMark, endMark)
        throw error
      })
  }

  recordCacheHitRate(hits: number, total: number) {
    const hitRate = total > 0 ? (hits / total) * 100 : 0
    this.recordMetric('cacheHitRate', hitRate)
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.entries()).map(([name, value]) =>
      evaluatePerformanceMetric(name, value)
    )
  }

  generateReport() {
    const metrics = this.getMetrics()
    const report = generatePerformanceReport(metrics)

    if (this.options.enableConsoleLog) {
      console.log(formatPerformanceReport(report))
    }

    return report
  }

  async sendReport() {
    if (!this.options.reportUrl) {
      return
    }

    if (Math.random() > this.options.sampleRate!) {
      return
    }

    const report = this.generateReport()

    try {
      await fetch(this.options.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      })
    } catch (error) {
      console.error('Failed to send performance report:', error)
    }
  }

  clearMetrics() {
    this.metrics.clear()
  }
}

export const performanceMonitor = new PerformanceMonitor()

export function usePerformanceMonitor() {
  return {
    recordMetric: (name: string, value: number) => performanceMonitor.recordMetric(name, value),
    measureComponentRender: (componentName: string, renderFn: () => void) =>
      performanceMonitor.measureComponentRender(componentName, renderFn),
    measureDatabaseQuery: (queryName: string, queryFn: () => Promise<any>) =>
      performanceMonitor.measureDatabaseQuery(queryName, queryFn),
    measureApiCall: (apiName: string, apiFn: () => Promise<any>) =>
      performanceMonitor.measureApiCall(apiName, apiFn),
    recordCacheHitRate: (hits: number, total: number) =>
      performanceMonitor.recordCacheHitRate(hits, total),
    getMetrics: () => performanceMonitor.getMetrics(),
    generateReport: () => performanceMonitor.generateReport(),
    sendReport: () => performanceMonitor.sendReport(),
    clearMetrics: () => performanceMonitor.clearMetrics(),
  }
}

export default performanceMonitor
