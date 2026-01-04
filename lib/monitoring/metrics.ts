/**
 * @fileoverview Metrics collection and reporting
 * @description Collects application metrics for monitoring
 * @author YYC³ Team
 * @version 1.0.0
 */

interface Metric {
  name: string;
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

interface MetricCounter {
  name: string;
  count: number;
  timestamp: number;
}

// In-memory metrics store (for production, use Prometheus/Pushgateway)
const metricsStore = new Map<string, Metric[]>();
const counters = new Map<string, MetricCounter>();

/**
 * Record a metric
 */
export function recordMetric(metric: Metric): void {
  const metrics = metricsStore.get(metric.name) || [];
  metrics.push(metric);

  // Keep only last 1000 metrics per name
  if (metrics.length > 1000) {
    metrics.shift();
  }

  metricsStore.set(metric.name, metrics);
}

/**
 * Increment a counter
 */
export function incrementCounter(name: string, labels?: Record<string, string>): void {
  const key = labels ? `${name}:${JSON.stringify(labels)}` : name;
  const counter = counters.get(key) || { name, count: 0, timestamp: Date.now() };
  counter.count++;
  counter.timestamp = Date.now();
  counters.set(key, counter);
}

/**
 * Get metrics for a specific name
 */
export function getMetrics(name: string): Metric[] {
  return metricsStore.get(name) || [];
}

/**
 * Get all metrics
 */
export function getAllMetrics(): Record<string, Metric[]> {
  return Object.fromEntries(metricsStore.entries());
}

/**
 * Get all counters
 */
export function getAllCounters(): MetricCounter[] {
  return Array.from(counters.values());
}

/**
 * Clear metrics (useful for testing)
 */
export function clearMetrics(): void {
  metricsStore.clear();
  counters.clear();
}

/**
 * Record HTTP request metric
 */
export function recordHttpRequest(method: string, path: string, statusCode: number, duration: number): void {
  recordMetric({
    name: 'http_request_duration_ms',
    value: duration,
    timestamp: Date.now(),
    labels: { method, path, status: statusCode.toString() },
  });

  // Count requests by status code
  if (statusCode >= 500) {
    incrementCounter('http_requests_5xx', { method, path });
  } else if (statusCode >= 400) {
    incrementCounter('http_requests_4xx', { method, path });
  } else {
    incrementCounter('http_requests_2xx', { method, path });
  }
}

/**
 * Record database query metric
 */
export function recordDbQuery(operation: string, table: string, duration: number): void {
  recordMetric({
    name: 'db_query_duration_ms',
    value: duration,
    timestamp: Date.now(),
    labels: { operation, table },
  });
}

/**
 * Record error metric
 */
export function recordError(type: string, message: string): void {
  incrementCounter('errors_total', { type });
  recordMetric({
    name: 'error',
    value: 1,
    timestamp: Date.now(),
    labels: { type, message: message.substring(0, 100) },
  });
}

/**
 * Get system metrics
 */
export function getSystemMetrics(): {
  uptime: number;
  memory: NodeJS.MemoryUsage;
  cpu: NodeJS.CpuUsage;
  timestamp: number;
} {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: Date.now(),
  };
}

/**
 * Format metrics for Prometheus
 */
export function formatPrometheusMetrics(): string {
  const lines: string[] = [];

  // System metrics
  const system = getSystemMetrics();
  lines.push('# HELP system_uptime_seconds System uptime in seconds');
  lines.push('# TYPE system_uptime_seconds gauge');
  lines.push(`system_uptime_seconds ${system.uptime}`);
  lines.push('');

  // Memory metrics
  lines.push('# HELP system_memory_bytes System memory usage in bytes');
  lines.push('# TYPE system_memory_bytes gauge');
  lines.push(`system_memory_bytes{type="heap_used"} ${system.memory.heapUsed}`);
  lines.push(`system_memory_bytes{type="heap_total"} ${system.memory.heapTotal}`);
  lines.push(`system_memory_bytes{type="external"} ${system.memory.external}`);
  lines.push(`system_memory_bytes{type="array_buffers"} ${system.memory.arrayBuffers}`);
  lines.push('');

  // Counters
  for (const counter of getAllCounters()) {
    const labels = counter.name.split(':')[1];
    lines.push(`# HELP ${counter.name}_total Total count of ${counter.name}`);
    lines.push(`# TYPE ${counter.name}_total counter`);
    if (labels) {
      lines.push(`${counter.name}_total{${labels}} ${counter.count} ${counter.timestamp}`);
    } else {
      lines.push(`${counter.name}_total ${counter.count} ${counter.timestamp}`);
    }
  }

  return lines.join('\n');
}

/**
 * Metrics middleware helper
 */
export function createMetricsMiddleware() {
  return async (request: Request, response: Response) => {
    const startTime = Date.now();
    const url = new URL(request.url);

    // Let the request process
    const duration = Date.now() - startTime;

    // Record metrics
    const method = request.method;
    const path = url.pathname;
    const status = response.status;

    recordHttpRequest(method, path, status, duration);
  };
}
