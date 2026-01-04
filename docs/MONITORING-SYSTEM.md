# Monitoring System Documentation

> **Date**: 2026-01-03
> **Version**: 1.0.0
> **Status**: ✅ Implemented

---

## Overview

The YYC³ Learning Platform now includes a comprehensive monitoring system with health checks, metrics collection, and observability features.

---

## Components

### 1. Health Check System

**Location**: `lib/monitoring/health-check.ts`

#### Health Checks

| Check | Description | Dependency |
|-------|-------------|------------|
| Database | PostgreSQL connectivity check | `postgresql` |
| Redis | Redis connectivity check (optional) | `redis` |
| External API | External service availability | `external-api` |
| Memory | Application memory usage | N/A |

#### Health Status Levels

- **healthy**: All checks passing
- **degraded**: Some checks have warnings
- **unhealthy**: One or more checks have failed

### 2. Health Endpoints

#### `/api/health` - Detailed Health Check

**Response Example**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-03T10:00:00.000Z",
  "uptime": 3600.5,
  "checks": {
    "database": {
      "status": "pass",
      "responseTime": 15,
      "dependency": "postgresql"
    },
    "redis": {
      "status": "warn",
      "responseTime": 5,
      "message": "Redis not configured",
      "dependency": "redis"
    },
    "memory": {
      "status": "pass"
    }
  }
}
```

#### `/api/health/live` - Liveness Probe

Kubernetes liveness probe - checks if the application is running.

**Response**:
```json
{
  "status": "alive",
  "timestamp": "2026-01-03T10:00:00.000Z"
}
```

#### `/api/health/ready` - Readiness Probe

Kubernetes readiness probe - checks if the application is ready to serve traffic.

**Response**:
```json
{
  "status": "ready",
  "checks": [
    "database:ready"
  ]
}
```

### 3. Metrics Collection

**Location**: `lib/monitoring/metrics.ts`

#### Available Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `http_request_duration_ms` | Histogram | HTTP request duration in milliseconds |
| `http_requests_2xx` | Counter | Count of 2xx HTTP responses |
| `http_requests_4xx` | Counter | Count of 4xx HTTP responses |
| `http_requests_5xx` | Counter | Count of 5xx HTTP responses |
| `db_query_duration_ms` | Histogram | Database query duration |
| `errors_total` | Counter | Total errors by type |
| `system_uptime_seconds` | Gauge | System uptime in seconds |
| `system_memory_bytes` | Gauge | Memory usage in bytes |

#### `/api/metrics` - Metrics Endpoint

**Accept Headers**:
- `text/plain` - Returns Prometheus format
- `application/json` - Returns JSON format

**Prometheus Format Example**:
```
# HELP system_uptime_seconds System uptime in seconds
# TYPE system_uptime_seconds gauge
system_uptime_seconds 3600.5

# HELP system_memory_bytes System memory usage in bytes
# TYPE system_memory_bytes gauge
system_memory_bytes{type="heap_used"} 12345678
system_memory_bytes{type="heap_total"} 24680135
```

**JSON Format Example**:
```json
{
  "system": {
    "uptime": 3600.5,
    "memory": { "heapUsed": 12345678, "heapTotal": 24680135 },
    "cpu": { "user": 1234567, "system": 456789 }
  },
  "counters": [
    { "name": "http_requests_2xx", "count": 1234, "timestamp": 1704278400000 }
  ],
  "timestamp": 1704278400000
}
```

---

## Usage Examples

### 1. Check Application Health

```bash
curl http://localhost:3000/api/health
```

### 2. Check Liveness (Kubernetes)

```bash
curl http://localhost:3000/api/health/live
```

### 3. Check Readiness (Kubernetes)

```bash
curl http://localhost:3000/api/health/ready
```

### 4. Get Metrics (Prometheus)

```bash
curl -H "Accept: text/plain" http://localhost:3000/api/metrics
```

### 5. Get Metrics (JSON)

```bash
curl http://localhost:3000/api/metrics
```

---

## Integration with Monitoring Tools

### Prometheus

Add to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'learning-platform'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
```

### Grafana Dashboard

Import the pre-configured dashboard (to be created):

```json
{
  "dashboard": {
    "title": "YYC³ Learning Platform",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_2xx_total[5m])"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "targets": [
          {
            "expr": "system_memory_bytes{type=\"heap_used\"}"
          }
        ]
      }
    ]
  }
}
```

### Kubernetes Probes

Add to your deployment:

```yaml
livenessProbe:
  httpGet:
    path: /api/health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## Programmatic Usage

### Recording Metrics

```typescript
import { recordMetric, incrementCounter, recordHttpRequest } from '@/lib/monitoring/metrics';

// Record a custom metric
recordMetric({
  name: 'custom_metric',
  value: 42,
  timestamp: Date.now(),
  labels: { label1: 'value1' }
});

// Increment a counter
incrementCounter('api_calls', { endpoint: '/api/users' });

// Record HTTP request (in middleware)
recordHttpRequest('GET', '/api/users', 200, 150);
```

### Health Check in Code

```typescript
import { performHealthCheck } from '@/lib/monitoring/health-check';

const health = await performHealthCheck();
if (health.status !== 'healthy') {
  console.error('System unhealthy:', health.checks);
}
```

---

## Configuration

### Environment Variables

```env
# Redis for metrics storage (optional)
REDIS_URL=redis://localhost:6379

# External service health check
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Health check timeouts
DB_QUERY_TIMEOUT=5000
EXTERNAL_API_TIMEOUT=5000
```

### Custom Health Checks

Add custom checks in `lib/monitoring/health-check.ts`:

```typescript
async function checkCustomService() {
  const startTime = Date.now();
  try {
    // Your check logic
    return { status: 'pass', responseTime: Date.now() - startTime };
  } catch (error) {
    return { status: 'fail', responseTime: Date.now() - startTime };
  }
}
```

---

## Next Steps

### Phase 2 (Week 5-6)
- [ ] Integrate with Prometheus for metrics storage
- [ ] Set up Grafana dashboards
- [ ] Add alerting rules
- [ ] Implement distributed tracing

### Phase 3 (Week 7-8)
- [ ] Add log aggregation (ELK/Loki)
- [ ] Implement error tracking (Sentry)
- [ ] Add real user monitoring (RUM)
- [ ] Create synthetic monitoring tests

---

## Monitoring Best Practices

1. **Set up alerts** for critical metrics (error rate, response time, memory usage)
2. **Review dashboards** regularly to identify trends
3. **Use health checks** in load balancers for automatic failover
4. **Archive metrics** for long-term analysis
5. **Test alerting** to ensure you're notified of real issues

---

## Troubleshooting

### Health Check Returns `unhealthy`

1. Check the `checks` object to identify which service is failing
2. Verify database connectivity: `ping database-host`
3. Check database logs for errors
4. Verify environment variables are set correctly

### Metrics Not Appearing

1. Ensure the application is receiving traffic
2. Check that metrics are being recorded in the code
3. Verify Prometheus is scraping the correct endpoint
4. Check browser console for client-side errors

### High Memory Usage

1. Check for memory leaks in the code
2. Review the `memory` check in `/api/health`
3. Consider implementing memory limits in container configuration
4. Profile the application to identify memory-intensive operations

---

## References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Kubernetes Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [OpenTelemetry](https://opentelemetry.io/)

---

**Maintained by**: YYC³ AI Team
**Last Updated**: 2026-01-03
