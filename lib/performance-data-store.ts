/**
 * @fileoverview 性能数据存储模块
 * @description 存储和检索性能数据
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-31
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import type { PerformanceMetric } from './performance.config'
import type { Alert } from './performance-alerts'

export interface StoredPerformanceData {
  id: string
  timestamp: number
  url: string
  userId?: string
  sessionId: string
  metrics: PerformanceMetric[]
  userAgent: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  viewport: {
    width: number
    height: number
  }
}

export interface PerformanceQuery {
  startDate?: number
  endDate?: number
  url?: string
  userId?: string
  sessionId?: string
  metricName?: string
  limit?: number
}

export interface PerformanceAggregation {
  metricName: string
  period: string
  avg: number
  min: number
  max: number
  p50: number
  p95: number
  p99: number
  count: number
}

class PerformanceDataStore {
  private storage: StorageType
  private data: StoredPerformanceData[] = []
  private alerts: Alert[] = []
  private maxRecords = 10000
  private maxAlerts = 1000

  constructor(storageType: StorageType = 'memory') {
    this.storage = storageType
    this.initializeStorage()
  }

  private initializeStorage() {
    if (typeof window !== 'undefined' && this.storage === 'localStorage') {
      this.loadFromLocalStorage()
    }
  }

  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('performance-data')
      if (stored) {
        this.data = JSON.parse(stored)
      }

      const storedAlerts = localStorage.getItem('performance-alerts')
      if (storedAlerts) {
        this.alerts = JSON.parse(storedAlerts)
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error)
    }
  }

  private saveToLocalStorage() {
    if (typeof window === 'undefined' || this.storage !== 'localStorage') {
      return
    }

    try {
      localStorage.setItem('performance-data', JSON.stringify(this.data))
      localStorage.setItem('performance-alerts', JSON.stringify(this.alerts))
    } catch (error) {
      console.error('Failed to save data to localStorage:', error)
    }
  }

  private generateId(): string {
    return `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof window === 'undefined') {
      return 'desktop'
    }

    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  private getViewport() {
    if (typeof window === 'undefined') {
      return { width: 1920, height: 1080 }
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  private getUserAgent(): string {
    if (typeof navigator === 'undefined') {
      return 'Unknown'
    }

    return navigator.userAgent
  }

  storePerformanceData(
    metrics: PerformanceMetric[],
    options?: {
      url?: string
      userId?: string
      sessionId?: string
    }
  ): string {
    const data: StoredPerformanceData = {
      id: this.generateId(),
      timestamp: Date.now(),
      url: options?.url || (typeof window !== 'undefined' ? window.location.href : ''),
      userId: options?.userId,
      sessionId: options?.sessionId || this.generateSessionId(),
      metrics,
      userAgent: this.getUserAgent(),
      deviceType: this.detectDeviceType(),
      viewport: this.getViewport(),
    }

    this.data.unshift(data)

    if (this.data.length > this.maxRecords) {
      this.data = this.data.slice(0, this.maxRecords)
    }

    if (this.storage === 'localStorage') {
      this.saveToLocalStorage()
    }

    return data.id
  }

  storeAlert(alert: Alert): string {
    this.alerts.unshift(alert)

    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts)
    }

    if (this.storage === 'localStorage') {
      this.saveToLocalStorage()
    }

    return alert.id
  }

  queryPerformanceData(query: PerformanceQuery = {}): StoredPerformanceData[] {
    let results = [...this.data]

    if (query.startDate) {
      results = results.filter(d => d.timestamp >= query.startDate!)
    }

    if (query.endDate) {
      results = results.filter(d => d.timestamp <= query.endDate!)
    }

    if (query.url) {
      results = results.filter(d => d.url.includes(query.url!))
    }

    if (query.userId) {
      results = results.filter(d => d.userId === query.userId)
    }

    if (query.sessionId) {
      results = results.filter(d => d.sessionId === query.sessionId)
    }

    if (query.metricName) {
      results = results.filter(d =>
        d.metrics.some(m => m.name === query.metricName)
      )
    }

    if (query.limit) {
      results = results.slice(0, query.limit)
    }

    return results
  }

  getPerformanceDataById(id: string): StoredPerformanceData | undefined {
    return this.data.find(d => d.id === id)
  }

  getAlerts(options?: {
    type?: 'critical' | 'warning' | 'info'
    acknowledged?: boolean
    limit?: number
  }): Alert[] {
    let results = [...this.alerts]

    if (options?.type) {
      results = results.filter(a => a.type === options.type)
    }

    if (options?.acknowledged !== undefined) {
      results = results.filter(a => a.acknowledged === options.acknowledged)
    }

    if (options?.limit) {
      results = results.slice(0, options.limit)
    }

    return results
  }

  aggregatePerformanceMetrics(
    metricName: string,
    period: 'hour' | 'day' | 'week' | 'month',
    query?: PerformanceQuery
  ): PerformanceAggregation {
    const now = Date.now()
    let periodStart: number

    switch (period) {
      case 'hour':
        periodStart = now - 60 * 60 * 1000
        break
      case 'day':
        periodStart = now - 24 * 60 * 60 * 1000
        break
      case 'week':
        periodStart = now - 7 * 24 * 60 * 60 * 1000
        break
      case 'month':
        periodStart = now - 30 * 24 * 60 * 60 * 1000
        break
    }

    const data = this.queryPerformanceData({
      ...query,
      startDate: periodStart,
      endDate: now,
      metricName,
    })

    const values: number[] = []

    data.forEach(d => {
      const metric = d.metrics.find(m => m.name === metricName)
      if (metric) {
        values.push(metric.value)
      }
    })

    if (values.length === 0) {
      return {
        metricName,
        period,
        avg: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        count: 0,
      }
    }

    values.sort((a, b) => a - b)

    const sum = values.reduce((acc, val) => acc + val, 0)
    const avg = sum / values.length
    const min = values[0]
    const max = values[values.length - 1]
    const p50 = values[Math.floor(values.length * 0.5)]
    const p95 = values[Math.floor(values.length * 0.95)]
    const p99 = values[Math.floor(values.length * 0.99)]

    return {
      metricName,
      period,
      avg,
      min,
      max,
      p50,
      p95,
      p99,
      count: values.length,
    }
  }

  getPerformanceTrends(
    metricName: string,
    period: 'hour' | 'day' | 'week' | 'month',
    query?: PerformanceQuery
  ): Array<{ timestamp: number; value: number }> {
    const now = Date.now()
    let periodStart: number
    let interval: number
    let buckets: number

    switch (period) {
      case 'hour':
        periodStart = now - 60 * 60 * 1000
        interval = 5 * 60 * 1000
        buckets = 12
        break
      case 'day':
        periodStart = now - 24 * 60 * 60 * 1000
        interval = 60 * 60 * 1000
        buckets = 24
        break
      case 'week':
        periodStart = now - 7 * 24 * 60 * 60 * 1000
        interval = 24 * 60 * 60 * 1000
        buckets = 7
        break
      case 'month':
        periodStart = now - 30 * 24 * 60 * 60 * 1000
        interval = 24 * 60 * 60 * 1000
        buckets = 30
        break
    }

    const data = this.queryPerformanceData({
      ...query,
      startDate: periodStart,
      endDate: now,
      metricName,
    })

    const trendData: Array<{ timestamp: number; value: number }> = []

    for (let i = 0; i < buckets; i++) {
      const bucketStart = periodStart + i * interval
      const bucketEnd = bucketStart + interval

      const bucketData = data.filter(d => {
        const metric = d.metrics.find(m => m.name === metricName)
        return metric && d.timestamp >= bucketStart && d.timestamp < bucketEnd
      })

      if (bucketData.length > 0) {
        const values = bucketData
          .map(d => d.metrics.find(m => m.name === metricName)!.value)
          .filter((v): v is number => v !== undefined)

        const avg = values.reduce((acc, val) => acc + val, 0) / values.length
        trendData.push({
          timestamp: bucketStart,
          value: avg,
        })
      } else {
        trendData.push({
          timestamp: bucketStart,
          value: 0,
        })
      }
    }

    return trendData
  }

  deletePerformanceData(id: string): boolean {
    const index = this.data.findIndex(d => d.id === id)
    if (index !== -1) {
      this.data.splice(index, 1)
      if (this.storage === 'localStorage') {
        this.saveToLocalStorage()
      }
      return true
    }
    return false
  }

  deleteAlert(id: string): boolean {
    const index = this.alerts.findIndex(a => a.id === id)
    if (index !== -1) {
      this.alerts.splice(index, 1)
      if (this.storage === 'localStorage') {
        this.saveToLocalStorage()
      }
      return true
    }
    return false
  }

  clearOldData(maxAge: number) {
    const cutoff = Date.now() - maxAge
    const oldCount = this.data.length

    this.data = this.data.filter(d => d.timestamp > cutoff)
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff)

    if (this.storage === 'localStorage') {
      this.saveToLocalStorage()
    }

    return {
      deletedData: oldCount - this.data.length,
      deletedAlerts: oldCount - this.alerts.length,
    }
  }

  clearAll() {
    this.data = []
    this.alerts = []

    if (this.storage === 'localStorage') {
      localStorage.removeItem('performance-data')
      localStorage.removeItem('performance-alerts')
    }
  }

  getStorageStats() {
    return {
      dataRecords: this.data.length,
      alertRecords: this.alerts.length,
      storageType: this.storage,
      maxRecords: this.maxRecords,
      maxAlerts: this.maxAlerts,
      usagePercent: (this.data.length / this.maxRecords) * 100,
    }
  }

  exportData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        data: this.data,
        alerts: this.alerts,
        exportedAt: new Date().toISOString(),
      }, null, 2)
    } else if (format === 'csv') {
      const headers = ['id', 'timestamp', 'url', 'userId', 'sessionId', 'deviceType', 'metrics']
      const rows = this.data.map(d => [
        d.id,
        new Date(d.timestamp).toISOString(),
        d.url,
        d.userId || '',
        d.sessionId,
        d.deviceType,
        JSON.stringify(d.metrics),
      ])

      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    }

    return ''
  }

  async syncToServer(url: string, apiKey?: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
        },
        body: JSON.stringify({
          data: this.data,
          alerts: this.alerts,
        }),
      })

      if (response.ok) {
        return true
      }

      console.error('Failed to sync data to server:', response.statusText)
      return false
    } catch (error) {
      console.error('Error syncing data to server:', error)
      return false
    }
  }
}

type StorageType = 'memory' | 'localStorage' | 'indexedDB'

export const performanceDataStore = new PerformanceDataStore('localStorage')

export function usePerformanceDataStore() {
  return {
    storePerformanceData: (
      metrics: PerformanceMetric[],
      options?: { url?: string; userId?: string; sessionId?: string }
    ) => performanceDataStore.storePerformanceData(metrics, options),
    storeAlert: (alert: Alert) => performanceDataStore.storeAlert(alert),
    queryPerformanceData: (query?: PerformanceQuery) =>
      performanceDataStore.queryPerformanceData(query),
    getPerformanceDataById: (id: string) =>
      performanceDataStore.getPerformanceDataById(id),
    getAlerts: (options?: any) => performanceDataStore.getAlerts(options),
    aggregatePerformanceMetrics: (
      metricName: string,
      period: 'hour' | 'day' | 'week' | 'month',
      query?: PerformanceQuery
    ) => performanceDataStore.aggregatePerformanceMetrics(metricName, period, query),
    getPerformanceTrends: (
      metricName: string,
      period: 'hour' | 'day' | 'week' | 'month',
      query?: PerformanceQuery
    ) => performanceDataStore.getPerformanceTrends(metricName, period, query),
    deletePerformanceData: (id: string) => performanceDataStore.deletePerformanceData(id),
    deleteAlert: (id: string) => performanceDataStore.deleteAlert(id),
    clearOldData: (maxAge: number) => performanceDataStore.clearOldData(maxAge),
    clearAll: () => performanceDataStore.clearAll(),
    getStorageStats: () => performanceDataStore.getStorageStats(),
    exportData: (format?: 'json' | 'csv') => performanceDataStore.exportData(format),
    syncToServer: (url: string, apiKey?: string) =>
      performanceDataStore.syncToServer(url, apiKey),
  }
}

export default performanceDataStore
