/**
 * @fileoverview 性能异常告警机制
 * @description 监控性能指标并触发告警
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-31
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { PERFORMANCE_THRESHOLDS, type PerformanceMetric } from './performance.config'

export interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  metric: string
  message: string
  value: number
  threshold: number
  timestamp: number
  acknowledged: boolean
}

export interface AlertRule {
  metric: string
  condition: 'exceeds' | 'below' | 'equals'
  threshold: number
  severity: 'critical' | 'warning' | 'info'
  cooldown: number
}

export interface NotificationChannel {
  type: 'console' | 'email' | 'slack' | 'webhook'
  enabled: boolean
  config?: Record<string, any>
}

class PerformanceAlertManager {
  private alerts: Alert[] = []
  private rules: Map<string, AlertRule> = new Map()
  private channels: NotificationChannel[] = []
  private lastAlertTimes: Map<string, number> = new Map()
  private maxAlerts = 1000

  constructor() {
    this.initializeDefaultRules()
    this.initializeDefaultChannels()
  }

  private initializeDefaultRules() {
    const defaultRules: AlertRule[] = [
      {
        metric: 'componentRenderTime',
        condition: 'exceeds',
        threshold: 100,
        severity: 'critical',
        cooldown: 60000,
      },
      {
        metric: 'firstContentfulPaint',
        condition: 'exceeds',
        threshold: 3000,
        severity: 'critical',
        cooldown: 120000,
      },
      {
        metric: 'largestContentfulPaint',
        condition: 'exceeds',
        threshold: 4000,
        severity: 'critical',
        cooldown: 120000,
      },
      {
        metric: 'firstInputDelay',
        condition: 'exceeds',
        threshold: 200,
        severity: 'warning',
        cooldown: 60000,
      },
      {
        metric: 'cumulativeLayoutShift',
        condition: 'exceeds',
        threshold: 0.25,
        severity: 'warning',
        cooldown: 60000,
      },
      {
        metric: 'timeToInteractive',
        condition: 'exceeds',
        threshold: 5000,
        severity: 'critical',
        cooldown: 120000,
      },
      {
        metric: 'totalBlockingTime',
        condition: 'exceeds',
        threshold: 500,
        severity: 'critical',
        cooldown: 60000,
      },
      {
        metric: 'cacheHitRate',
        condition: 'below',
        threshold: 80,
        severity: 'warning',
        cooldown: 300000,
      },
      {
        metric: 'databaseQueryTime',
        condition: 'exceeds',
        threshold: 200,
        severity: 'critical',
        cooldown: 30000,
      },
      {
        metric: 'apiResponseTime',
        condition: 'exceeds',
        threshold: 500,
        severity: 'critical',
        cooldown: 30000,
      },
    ]

    defaultRules.forEach(rule => {
      this.rules.set(rule.metric, rule)
    })
  }

  private initializeDefaultChannels() {
    this.channels = [
      {
        type: 'console',
        enabled: true,
      },
    ]
  }

  addRule(rule: AlertRule) {
    this.rules.set(rule.metric, rule)
  }

  removeRule(metric: string) {
    this.rules.delete(metric)
  }

  addChannel(channel: NotificationChannel) {
    this.channels.push(channel)
  }

  removeChannel(type: string) {
    this.channels = this.channels.filter(c => c.type !== type)
  }

  checkMetric(metric: PerformanceMetric) {
    const rule = this.rules.get(metric.name)
    if (!rule) return

    const shouldAlert = this.evaluateCondition(metric.value, rule.condition, rule.threshold)
    if (!shouldAlert) return

    const lastAlertTime = this.lastAlertTimes.get(metric.name) || 0
    const timeSinceLastAlert = Date.now() - lastAlertTime

    if (timeSinceLastAlert < rule.cooldown) {
      return
    }

    const alert: Alert = {
      id: `alert-${Date.now()}-${metric.name}`,
      type: rule.severity,
      metric: metric.name,
      message: this.generateAlertMessage(metric, rule),
      value: metric.value,
      threshold: rule.threshold,
      timestamp: Date.now(),
      acknowledged: false,
    }

    this.addAlert(alert)
    this.lastAlertTimes.set(metric.name, Date.now())
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'exceeds':
        return value > threshold
      case 'below':
        return value < threshold
      case 'equals':
        return value === threshold
      default:
        return false
    }
  }

  private generateAlertMessage(metric: PerformanceMetric, rule: AlertRule): string {
    const threshold = PERFORMANCE_THRESHOLDS.find(t => t.name === metric.name)
    const description = threshold?.description || metric.name

    switch (rule.condition) {
      case 'exceeds':
        return `${description} 超过阈值: ${metric.value.toFixed(2)}${metric.unit} > ${rule.threshold}${metric.unit}`
      case 'below':
        return `${description} 低于阈值: ${metric.value.toFixed(2)}${metric.unit} < ${rule.threshold}${metric.unit}`
      case 'equals':
        return `${description} 等于阈值: ${metric.value.toFixed(2)}${metric.unit}`
      default:
        return `${description} 异常: ${metric.value.toFixed(2)}${metric.unit}`
    }
  }

  private addAlert(alert: Alert) {
    this.alerts.unshift(alert)

    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts)
    }

    this.sendNotifications(alert)
  }

  private sendNotifications(alert: Alert) {
    this.channels.forEach(channel => {
      if (!channel.enabled) return

      switch (channel.type) {
        case 'console':
          this.sendConsoleNotification(alert)
          break
        case 'email':
          this.sendEmailNotification(alert, channel.config)
          break
        case 'slack':
          this.sendSlackNotification(alert, channel.config)
          break
        case 'webhook':
          this.sendWebhookNotification(alert, channel.config)
          break
      }
    })
  }

  private sendConsoleNotification(alert: Alert) {
    const emoji = alert.type === 'critical' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'
    console.log(`${emoji} [${alert.type.toUpperCase()}] ${alert.message}`)
  }

  private async sendEmailNotification(alert: Alert, config: Record<string, any>) {
    if (!config.to || !config.from) {
      console.warn('Email notification config missing: to or from')
      return
    }

    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: config.to,
          from: config.from,
          subject: `[${alert.type.toUpperCase()}] 性能告警: ${alert.metric}`,
          body: alert.message,
          alert,
        }),
      })

      if (!response.ok) {
        console.error('Failed to send email notification')
      }
    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  }

  private async sendSlackNotification(alert: Alert, config: Record<string, any>) {
    if (!config.webhookUrl) {
      console.warn('Slack webhook URL not configured')
      return
    }

    try {
      const color = alert.type === 'critical' ? '#FF0000' : alert.type === 'warning' ? '#FFA500' : '#0000FF'
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attachments: [
            {
              color,
              title: `[${alert.type.toUpperCase()}] 性能告警`,
              text: alert.message,
              fields: [
                {
                  title: '指标',
                  value: alert.metric,
                  short: true,
                },
                {
                  title: '当前值',
                  value: `${alert.value.toFixed(2)}`,
                  short: true,
                },
                {
                  title: '阈值',
                  value: `${alert.threshold}`,
                  short: true,
                },
                {
                  title: '时间',
                  value: new Date(alert.timestamp).toLocaleString('zh-CN'),
                  short: true,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        console.error('Failed to send Slack notification')
      }
    } catch (error) {
      console.error('Error sending Slack notification:', error)
    }
  }

  private async sendWebhookNotification(alert: Alert, config: Record<string, any>) {
    if (!config.url) {
      console.warn('Webhook URL not configured')
      return
    }

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alert,
          timestamp: new Date(alert.timestamp).toISOString(),
        }),
      })

      if (!response.ok) {
        console.error('Failed to send webhook notification')
      }
    } catch (error) {
      console.error('Error sending webhook notification:', error)
    }
  }

  acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
    }
  }

  getAlerts(options?: {
    type?: 'critical' | 'warning' | 'info'
    acknowledged?: boolean
    limit?: number
  }): Alert[] {
    let filtered = [...this.alerts]

    if (options?.type) {
      filtered = filtered.filter(a => a.type === options.type)
    }

    if (options?.acknowledged !== undefined) {
      filtered = filtered.filter(a => a.acknowledged === options.acknowledged)
    }

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit)
    }

    return filtered
  }

  getAlertStats() {
    const total = this.alerts.length
    const critical = this.alerts.filter(a => a.type === 'critical').length
    const warning = this.alerts.filter(a => a.type === 'warning').length
    const info = this.alerts.filter(a => a.type === 'info').length
    const acknowledged = this.alerts.filter(a => a.acknowledged).length

    return {
      total,
      critical,
      warning,
      info,
      acknowledged,
      unacknowledged: total - acknowledged,
    }
  }

  clearAlerts() {
    this.alerts = []
  }

  clearOldAlerts(maxAge: number) {
    const cutoff = Date.now() - maxAge
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff)
  }
}

export const performanceAlertManager = new PerformanceAlertManager()

export function usePerformanceAlerts() {
  return {
    checkMetric: (metric: PerformanceMetric) => performanceAlertManager.checkMetric(metric),
    addRule: (rule: AlertRule) => performanceAlertManager.addRule(rule),
    removeRule: (metric: string) => performanceAlertManager.removeRule(metric),
    addChannel: (channel: NotificationChannel) => performanceAlertManager.addChannel(channel),
    removeChannel: (type: string) => performanceAlertManager.removeChannel(type),
    acknowledgeAlert: (alertId: string) => performanceAlertManager.acknowledgeAlert(alertId),
    getAlerts: (options?: any) => performanceAlertManager.getAlerts(options),
    getAlertStats: () => performanceAlertManager.getAlertStats(),
    clearAlerts: () => performanceAlertManager.clearAlerts(),
    clearOldAlerts: (maxAge: number) => performanceAlertManager.clearOldAlerts(maxAge),
  }
}

export default performanceAlertManager
