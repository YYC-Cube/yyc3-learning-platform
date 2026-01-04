# Monitoring Stack Setup Guide

> **Date**: 2026-01-03
> **Version**: 1.0.0
> **Stack**: Prometheus + Grafana + AlertManager + Node Exporter

---

## Overview

This monitoring stack provides comprehensive observability for the YYC³ Learning Platform:

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **AlertManager**: Alert routing and management
- **Node Exporter**: System-level metrics

---

## Quick Start

### 1. One-Command Setup

```bash
./scripts/setup-monitoring.sh
```

### 2. Manual Setup

```bash
# Start all services
docker-compose -f docker-compose.monitoring.yml up -d

# View logs
docker-compose -f docker-compose.monitoring.yml logs -f

# Stop services
docker-compose -f docker-compose.monitoring.yml down
```

---

## Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3001 | admin / admin |
| AlertManager | http://localhost:9093 | - |
| Node Exporter | http://localhost:9100/metrics | - |

---

## Dashboard Features

### Pre-Configured Grafana Dashboard

The `learning-platform` dashboard includes:

1. **Service Status Panel**
   - Real-time UP/DOWN status
   - Quick visual health check

2. **HTTP Request Rate**
   - 2xx (success) requests
   - 4xx (client errors) requests
   - 5xx (server errors) requests
   - Real-time rate calculation

3. **Response Time Percentiles**
   - p50 (median)
   - p95 (95th percentile)
   - p99 (99th percentile)
   - Threshold indicators at 500ms and 1000ms

4. **Memory Usage Gauge**
   - Current heap usage percentage
   - Color-coded thresholds:
     - 🟢 < 70%
     - 🟡 70-85%
     - 🟠 85-95%
     - 🔴 > 95%

5. **Memory Usage Over Time**
   - Heap used
   - Heap total
   - External memory

6. **Error Rate by Type**
   - Errors grouped by type
   - Real-time error tracking

---

## Prometheus Configuration

### Scraping Endpoints

```yaml
scrape_configs:
  - job_name: 'learning-platform'
    scrape_interval: 15s
    metrics_path: '/api/metrics'
    static_configs:
      - targets: ['host.docker.internal:3000']
```

### Available Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `up` | gauge | Service status (1=up, 0=down) |
| `http_request_duration_ms` | histogram | HTTP request duration |
| `http_requests_2xx_total` | counter | Total 2xx responses |
| `http_requests_4xx_total` | counter | Total 4xx responses |
| `http_requests_5xx_total` | counter | Total 5xx responses |
| `errors_total` | counter | Total errors by type |
| `system_memory_bytes` | gauge | Memory usage by type |
| `system_uptime_seconds` | gauge | System uptime |

---

## Alert Rules

### Application Alerts

| Alert | Condition | Severity | Duration |
|-------|-----------|----------|----------|
| HighErrorRate | `rate(errors_total) > 10` | Warning | 5m |
| CriticalErrorRate | `rate(errors_total) > 50` | Critical | 2m |
| HighHTTP5xxRate | `rate(http_requests_5xx_total) > 0.1` | Warning | 5m |
| HighMemoryUsage | `heap_used/heap_total > 0.9` | Warning | 5m |
| CriticalMemoryUsage | `heap_used/heap_total > 0.95` | Critical | 2m |
| HighResponseTime | `p95 response time > 1000ms` | Warning | 5m |
| ServiceDown | `up == 0` | Critical | 2m |

### Infrastructure Alerts

| Alert | Condition | Severity | Duration |
|-------|-----------|----------|----------|
| HighCPUUsage | `CPU usage > 80%` | Warning | 10m |
| DiskSpaceLow | `Disk space < 20%` | Warning | 10m |
| DiskSpaceCritical | `Disk space < 10%` | Critical | 5m |

---

## Configuration Files

### Directory Structure

```
monitoring/
├── prometheus/
│   ├── prometheus.yml          # Prometheus configuration
│   └── alerts/
│       └── application.yml     # Alert rules
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/        # Datasource provisioning
│   │   └── dashboards/         # Dashboard provisioning
│   └── dashboards/
│       └── learning-platform.json  # Main dashboard
└── alertmanager/
    └── alertmanager.yml        # AlertManager configuration
```

---

## Customization

### Adding New Metrics

1. **Add metric to application code** (`lib/monitoring/metrics.ts`):
   ```typescript
   recordMetric({
     name: 'custom_metric',
     value: 42,
     timestamp: Date.now(),
     labels: { label1: 'value1' }
   });
   ```

2. **Query in Prometheus**:
   ```
   custom_metric
   rate(custom_metric[5m])
   ```

3. **Add to Grafana dashboard**:
   - Edit dashboard
   - Add new panel
   - Use PromQL query

### Adding New Alert Rules

Edit `monitoring/prometheus/alerts/application.yml`:

```yaml
groups:
  - name: custom_alerts
    rules:
      - alert: CustomAlert
        expr: custom_metric > threshold
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Custom alert triggered"
```

Reload Prometheus: `docker-compose restart prometheus`

### Modifying Grafana Dashboards

1. Open Grafana: http://localhost:3001
2. Navigate to dashboard
3. Click "Edit" (pencil icon)
4. Make changes
5. Save dashboard
6. Export JSON to `monitoring/grafana/dashboards/`

---

## Troubleshooting

### Prometheus Not Scraping Metrics

1. Check targets in Prometheus UI: http://localhost:9090/targets
2. Verify application is running: `curl http://localhost:3000/api/health`
3. Check metrics endpoint: `curl http://localhost:3000/api/metrics`
4. Verify Docker network connectivity:
   ```bash
   docker-compose -f docker-compose.monitoring.yml exec prometheus \
     ping host.docker.internal
   ```

### Grafana Cannot Connect to Prometheus

1. Verify datasource configuration:
   ```bash
   cat monitoring/grafana/provisioning/datasources/prometheus.yml
   ```
2. Check Prometheus is accessible:
   ```bash
   docker-compose -f docker-compose.monitoring.yml exec grafana \
     curl http://prometheus:9090/api/v1/status/config
   ```
3. Restart Grafana:
   ```bash
   docker-compose -f docker-compose.monitoring.yml restart grafana
   ```

### High Memory Usage Alerts

1. Check application metrics:
   ```
   curl http://localhost:3000/api/metrics | grep system_memory_bytes
   ```
2. Review memory profile:
   ```bash
   docker-compose -f docker-compose.monitoring.yml exec prometheus \
     promtool tsdb query metrics 'system_memory_bytes'
   ```
3. Consider increasing heap size or optimizing memory usage

---

## Production Deployment

### Security Considerations

1. **Change default passwords**:
   ```bash
   # Edit docker-compose.monitoring.yml
   GF_SECURITY_ADMIN_PASSWORD=your_secure_password
   ```

2. **Enable authentication**:
   - Add basic auth to Prometheus
   - Configure OAuth for Grafana

3. **Use HTTPS**:
   - Add reverse proxy (nginx/traefik)
   - Configure TLS certificates

4. **Network isolation**:
   - Use dedicated Docker network
   - Expose only necessary ports

### Persistence

Data is persisted in Docker volumes:

```bash
# List volumes
docker volume ls | grep monitoring

# Backup volumes
docker run --rm -v yyc3-prometheus-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/prometheus-backup.tar.gz /data
```

### Scaling

For high-availability setups:

1. **Prometheus**: Use Thanos or Cortex for long-term storage
2. **Grafana**: Use load balancer with multiple instances
3. **AlertManager**: Deploy in HA mode with 3+ replicas

---

## References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [AlertManager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [PromQL Guide](https://prometheus.io/docs/prometheus/latest/querying/basics/)

---

**Maintained by**: YYC³ AI Team
**Last Updated**: 2026-01-03
