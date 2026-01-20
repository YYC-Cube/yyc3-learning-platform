/**
 * Security audit logging module
 * @description Provides security event logging and monitoring functionality
 * @author YYC³
 * @version 1.1.0
 * @created 2026-02-06
 * @updated 2026-02-13
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { logger } from '@/lib/logger';
import { performanceMonitor } from '@/lib/performance-monitor';

/**
 * Security event types
 */
export enum SecurityEventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  VALIDATION_ERROR = 'validation_error',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SYSTEM_ERROR = 'system_error',
}

/**
 * Security event severity levels
 */
export enum SecuritySeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Security event interface
 */
export interface SecurityEvent {
  id: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resource?: string;
  details?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
}

/**
 * Security audit log configuration
 */
export interface SecurityAuditConfig {
  /** Enable logging to file */
  enableFileLogging?: boolean;
  /** Enable logging to database */
  enableDatabaseLogging?: boolean;
  /** Log file path */
  logFilePath?: string;
  /** Minimum severity level to log */
  minSeverity?: SecuritySeverity;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: SecurityAuditConfig = {
  enableFileLogging: true,
  enableDatabaseLogging: false,
  logFilePath: './logs/security-audit.log',
  minSeverity: SecuritySeverity.INFO,
};

/**
 * Enhanced audit log configuration with performance settings
 */
export interface EnhancedSecurityAuditConfig extends SecurityAuditConfig {
  /** Batch size for logging */
  batchSize?: number;
  /** Flush interval in milliseconds */
  flushInterval?: number;
  /** Maximum in-memory events to store */
  maxMemoryEvents?: number;
  /** Enable asynchronous logging */
  enableAsyncLogging?: boolean;
}

/**
 * Enhanced default configuration with performance optimizations
 */
const ENHANCED_DEFAULT_CONFIG: EnhancedSecurityAuditConfig = {
  ...DEFAULT_CONFIG,
  batchSize: 50,
  flushInterval: 2000, // 2 seconds
  maxMemoryEvents: 10000,
  enableAsyncLogging: true,
};

/**
 * In-memory event store with efficient indexing (for production, use database)
 * Using time-based buckets for efficient querying and memory management
 */
interface EventBucket {
  timestamp: number;
  events: Map<string, SecurityEvent>;
}

const eventStore = {
  buckets: new Map<string, EventBucket>(),
  maxBuckets: 24, // Keep events for 24 hours (1 bucket per hour)
  bucketSizeMs: 3600000, // 1 hour bucket size

  /** Add event to the appropriate bucket */
  add(event: SecurityEvent): void {
    const bucketKey = Math.floor(event.timestamp.getTime() / this.bucketSizeMs).toString();

    if (!this.buckets.has(bucketKey)) {
      this.buckets.set(bucketKey, {
        timestamp: parseInt(bucketKey) * this.bucketSizeMs,
        events: new Map()
      });

      // Clean up old buckets if we exceed max
      if (this.buckets.size > this.maxBuckets) {
        const oldestBucket = Array.from(this.buckets.keys())[0];
        this.buckets.delete(oldestBucket);
      }
    }

    this.buckets.get(bucketKey)!.events.set(event.id, event);
  },

  /** Get event by ID */
  get(id: string): SecurityEvent | undefined {
    for (const bucket of this.buckets.values()) {
      const event = bucket.events.get(id);
      if (event) return event;
    }
    return undefined;
  },

  /** Get all events in a time range */
  getInRange(start: Date, end: Date): SecurityEvent[] {
    const events: SecurityEvent[] = [];
    const startTime = start.getTime();
    const endTime = end.getTime();

    for (const bucket of this.buckets.values()) {
      if (bucket.timestamp >= startTime && bucket.timestamp <= endTime) {
        events.push(...bucket.events.values());
      }
    }

    return events.filter(event =>
      event.timestamp.getTime() >= startTime &&
      event.timestamp.getTime() <= endTime
    );
  },

  /** Get total number of events */
  size(): number {
    let total = 0;
    for (const bucket of this.buckets.values()) {
      total += bucket.events.size;
    }
    return total;
  }
};

/**
 * Batch queue for asynchronous logging
 */
let batchQueue: SecurityEvent[] = [];

/**
 * Flush timer reference
 */
let flushTimer: NodeJS.Timeout | null = null;

/**
 * Batch processing lock to prevent concurrent flushes
 */
let isFlushing = false;

/**
 * Get configuration with enhanced settings
 */
function getConfig(): EnhancedSecurityAuditConfig {
  return ENHANCED_DEFAULT_CONFIG;
}

/**
 * Generate unique event ID (optimized for performance)
 */
function generateEventId(): string {
  // Use performance.now() for higher precision and random string for uniqueness
  return `sec_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Check if severity meets minimum level
 */
function shouldLog(severity: SecuritySeverity): boolean {
  const config = getConfig();
  const severityOrder = [SecuritySeverity.INFO, SecuritySeverity.WARNING, SecuritySeverity.ERROR, SecuritySeverity.CRITICAL];
  const minIndex = severityOrder.indexOf(config.minSeverity || SecuritySeverity.INFO);
  const currentIndex = severityOrder.indexOf(severity);
  return currentIndex >= minIndex;
}

/**
 * Flush batch queue to storage
 */
async function flushBatch(): Promise<void> {
  if (isFlushing || batchQueue.length === 0) {
    return;
  }

  isFlushing = true;
  const batchToProcess = [...batchQueue];
  batchQueue = [];

  try {
    // Log batch to memory store
    batchToProcess.forEach(event => {
      eventStore.add(event);

      // Log to console/logger with proper severity
      const logMessage = `[${event.severity.toUpperCase()}] ${event.eventType}: ${event.action}`;
      const logData = {
        eventId: event.id,
        userId: event.userId,
        ipAddress: event.ipAddress,
        resource: event.resource,
        details: event.details,
        success: event.success,
        errorMessage: event.errorMessage,
      };

      switch (event.severity) {
        case SecuritySeverity.INFO:
          logger.info(logMessage, logData);
          break;
        case SecuritySeverity.WARNING:
          logger.warn(logMessage, logData);
          break;
        case SecuritySeverity.ERROR:
          logger.error(logMessage, logData);
          break;
        case SecuritySeverity.CRITICAL:
          logger.error(logMessage, logData);
          break;
      }
    });

  } catch (error) {
    logger.error('Error flushing audit log batch:', error);
  } finally {
    isFlushing = false;

    // If new events were added during flush, schedule another flush
    if (batchQueue.length > 0) {
      scheduleFlush();
    }
  }
}

/**
 * Schedule a flush of the batch queue
 */
function scheduleFlush(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
  }

  const config = getConfig();
  flushTimer = setTimeout(flushBatch, config.flushInterval!);
}

/**
 * Log security event (asynchronous with batching)
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
  const config = getConfig();

  if (!shouldLog(event.severity)) {
    return;
  }

  const startTime = performance.now();

  const fullEvent: SecurityEvent = {
    id: generateEventId(),
    timestamp: new Date(),
    ...event,
  };

  if (config.enableAsyncLogging) {
    // Add to batch queue for asynchronous processing
    batchQueue.push(fullEvent);

    // If batch size reached, flush immediately
    if (batchQueue.length >= config.batchSize!) {
      flushBatch().catch(error => {
        logger.error('Error during async log flush:', error);
      });
    } else {
      // Otherwise schedule a flush
      scheduleFlush();
    }
  } else {
    // Synchronous logging (fallback)
    eventStore.add(fullEvent);

    const logMessage = `[${fullEvent.severity.toUpperCase()}] ${fullEvent.eventType}: ${fullEvent.action}`;
    const logData = {
      eventId: fullEvent.id,
      userId: fullEvent.userId,
      ipAddress: fullEvent.ipAddress,
      resource: fullEvent.resource,
      details: fullEvent.details,
      success: fullEvent.success,
      errorMessage: fullEvent.errorMessage,
    };

    switch (fullEvent.severity) {
      case SecuritySeverity.INFO:
        logger.info(logMessage, logData);
        break;
      case SecuritySeverity.WARNING:
        logger.warn(logMessage, logData);
        break;
      case SecuritySeverity.ERROR:
        logger.error(logMessage, logData);
        break;
      case SecuritySeverity.CRITICAL:
        logger.error(logMessage, logData);
        break;
    }
  }

  // Log performance metrics
  const endTime = performance.now();
  performanceMonitor.recordMetric('audit-log.processing-time', endTime - startTime);
}

/**
 * Log authentication event
 */
export function logAuthenticationEvent(
  action: 'login' | 'logout' | 'register' | 'password_change',
  success: boolean,
  userId?: string,
  ipAddress?: string,
  errorMessage?: string
): void {
  logSecurityEvent({
    eventType: SecurityEventType.AUTHENTICATION,
    severity: success ? SecuritySeverity.INFO : SecuritySeverity.WARNING,
    action: `auth_${action}`,
    userId,
    ipAddress,
    success,
    errorMessage,
  });
}

/**
 * Log authorization event
 */
export function logAuthorizationEvent(
  action: string,
  success: boolean,
  userId?: string,
  resource?: string,
  ipAddress?: string,
  errorMessage?: string
): void {
  logSecurityEvent({
    eventType: SecurityEventType.AUTHORIZATION,
    severity: success ? SecuritySeverity.INFO : SecuritySeverity.WARNING,
    action,
    userId,
    ipAddress,
    resource,
    success,
    errorMessage,
  });
}

/**
 * Log rate limit event
 */
export function logRateLimitEvent(
  action: string,
  ipAddress?: string,
  userId?: string,
  details?: Record<string, unknown>
): void {
  logSecurityEvent({
    eventType: SecurityEventType.RATE_LIMIT,
    severity: SecuritySeverity.WARNING,
    action: `rate_limit_${action}`,
    ipAddress,
    userId,
    details,
    success: false,
    errorMessage: 'Rate limit exceeded',
  });
}

/**
 * Log data access event
 */
export function logDataAccessEvent(
  action: string,
  resource: string,
  success: boolean,
  userId?: string,
  ipAddress?: string,
  details?: Record<string, unknown>
): void {
  logSecurityEvent({
    eventType: SecurityEventType.DATA_ACCESS,
    severity: SecuritySeverity.INFO,
    action,
    resource,
    userId,
    ipAddress,
    details,
    success,
  });
}

/**
 * Log data modification event
 */
export function logDataModificationEvent(
  action: string,
  resource: string,
  success: boolean,
  userId?: string,
  ipAddress?: string,
  details?: Record<string, unknown>,
  errorMessage?: string
): void {
  logSecurityEvent({
    eventType: SecurityEventType.DATA_MODIFICATION,
    severity: success ? SecuritySeverity.INFO : SecuritySeverity.ERROR,
    action,
    resource,
    userId,
    ipAddress,
    details,
    success,
    errorMessage,
  });
}

/**
 * Log validation error event
 */
export function logValidationErrorEvent(
  action: string,
  errorMessage: string,
  userId?: string,
  ipAddress?: string,
  details?: Record<string, unknown>
): void {
  logSecurityEvent({
    eventType: SecurityEventType.VALIDATION_ERROR,
    severity: SecuritySeverity.WARNING,
    action,
    userId,
    ipAddress,
    details,
    success: false,
    errorMessage,
  });
}

/**
 * Log suspicious activity event
 */
export function logSuspiciousActivityEvent(
  action: string,
  ipAddress?: string,
  userId?: string,
  details?: Record<string, unknown>
): void {
  logSecurityEvent({
    eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
    severity: SecuritySeverity.ERROR,
    action,
    ipAddress,
    userId,
    details,
    success: false,
    errorMessage: 'Suspicious activity detected',
  });
}

/**
 * Helper function to convert eventStore events to sorted array by timestamp
 */
function getEventsArray(sortByDate: boolean = true, reverse: boolean = true): SecurityEvent[] {
  // Collect all events from all buckets
  const eventsArray: SecurityEvent[] = [];
  for (const bucket of eventStore.buckets.values()) {
    eventsArray.push(...bucket.events.values());
  }

  if (sortByDate) {
    eventsArray.sort((a, b) => {
      return reverse
        ? b.timestamp.getTime() - a.timestamp.getTime()
        : a.timestamp.getTime() - b.timestamp.getTime();
    });
  }
  return eventsArray;
}

/**
 * Get recent security events (optimized with Map iteration)
 */
export function getRecentEvents(limit: number = 100): SecurityEvent[] {
  const eventsArray = getEventsArray();
  return eventsArray.slice(0, limit);
}

/**
 * Get events by type (optimized with Map iteration)
 */
export function getEventsByType(eventType: SecurityEventType, limit: number = 100): SecurityEvent[] {
  const eventsArray = getEventsArray();
  return eventsArray
    .filter(event => event.eventType === eventType)
    .slice(0, limit);
}

/**
 * Get events by severity (optimized with Map iteration)
 */
export function getEventsBySeverity(severity: SecuritySeverity, limit: number = 100): SecurityEvent[] {
  const eventsArray = getEventsArray();
  return eventsArray
    .filter(event => event.severity === severity)
    .slice(0, limit);
}

/**
 * Get events by user (optimized with Map iteration)
 */
export function getEventsByUser(userId: string, limit: number = 100): SecurityEvent[] {
  const eventsArray = getEventsArray();
  return eventsArray
    .filter(event => event.userId === userId)
    .slice(0, limit);
}

/**
 * Get events by IP address (optimized with Map iteration)
 */
export function getEventsByIPAddress(ipAddress: string, limit: number = 100): SecurityEvent[] {
  const eventsArray = getEventsArray();
  return eventsArray
    .filter(event => event.ipAddress === ipAddress)
    .slice(0, limit);
}

/**
 * Get security statistics (optimized with bucket iteration)
 */
export function getSecurityStatistics(): {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  successRate: number;
  memoryUsage?: number;
} {
  const totalEvents = eventStore.size();
  const eventsByType: Record<string, number> = {};
  const eventsBySeverity: Record<string, number> = {};
  let successCount = 0;

  // Iterate through all buckets and events
  for (const bucket of eventStore.buckets.values()) {
    for (const event of bucket.events.values()) {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      if (event.success) {
        successCount++;
      }
    }
  }

  return {
    totalEvents,
    eventsByType,
    eventsBySeverity,
    successRate: totalEvents > 0 ? (successCount / totalEvents) * 100 : 0,
    memoryUsage: process.memoryUsage().heapUsed,
  };
}

/**
 * Clear old events (older than specified days) - optimized with bucket management
 */
export function clearOldEvents(daysOld: number = 30): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  const cutoffTime = cutoffDate.getTime();

  let removedCount = 0;

  // Iterate through buckets and delete old events
  for (const [bucketKey, bucket] of eventStore.buckets.entries()) {
    // If the entire bucket is old, delete the whole bucket
    if (bucket.timestamp < cutoffTime) {
      removedCount += bucket.events.size;
      eventStore.buckets.delete(bucketKey);
    } else {
      // Otherwise delete individual old events in the bucket
      const eventsToDelete: string[] = [];
      for (const [eventId, event] of bucket.events.entries()) {
        if (event.timestamp.getTime() < cutoffTime) {
          eventsToDelete.push(eventId);
        }
      }

      // Delete the identified old events
      eventsToDelete.forEach(eventId => {
        bucket.events.delete(eventId);
        removedCount++;
      });
    }
  }

  logger.info(`Cleared ${removedCount} old security events (older than ${daysOld} days)`);
  return removedCount;
}

/**
 * Force flush all pending events in the batch queue
 */
export async function flushAll(): Promise<void> {
  if (batchQueue.length > 0) {
    await flushBatch();
  }
}

/**
 * Initialize audit log system
 */
export function initializeAuditLog(): void {
  logger.info('Initializing security audit log system with performance optimizations');

  // Set up periodic cleanup of old events
  setInterval(() => {
    clearOldEvents(7); // Clear events older than 7 days
  }, 24 * 60 * 60 * 1000); // Run daily
}
