# 🔖 YYC³ (Header)

> **_YanYuCloudCube_**
> **标语**：言启象限 | 语枢未来
> **_Words Initiate Quadrants, Language Serves as Core for the Future_**
> **标语**：万象归元于云枢 | 深栈智启新纪元
> **_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**

---

# YYC³ AILP - 高可用 CI/CD 架构文档

## 📋 文档信息

| 属性         | 内容                                          |
| ------------ | --------------------------------------------- |
| **文档标题** | YYC³ AILP - 高可用 CI/CD 架构文档             |
| **文档版本** | v1.0.0                                        |
| **创建时间** | 2026-01-02                                    |
| **最后更新** | 2026-01-02                                    |
| **文档编号** | 137-YYC3-AILP-开发阶段-高可用CI-CD架构文档.md |
| **适用范围** | YYC³ AILP 项目的高可用部署架构                |
| **维护团队** | YYC³ 开发团队                                 |

---

## 📄 目录

- [1. 概述](#1-概述)
- [2. 高可用架构设计](#2-高可用架构设计)
- [3. 多区域部署](#3-多区域部署)
- [4. 蓝绿部署策略](#4-蓝绿部署策略)
- [5. 自动化测试](#5-自动化测试)
- [6. 监控与告警](#6-监控与告警)
- [7. 灾难恢复](#7-灾难恢复)
- [8. 运维指南](#8-运维指南)

---

## 1. 概述

### 1.1 高可用目标

YYC³ AILP 高可用 CI/CD 架构旨在实现以下目标：

- **99.99% 可用性**：年停机时间不超过 52.56 分钟
- **零停机部署**：通过蓝绿部署实现无缝更新
- **自动故障转移**：主区域故障时自动切换到备用区域
- **快速恢复**：灾难恢复时间目标 (RTO) < 15 分钟
- **数据零丢失**：数据恢复点目标 (RPO) < 5 分钟

### 1.2 核心特性

| 特性       | 描述                       | 实现方式                            |
| ---------- | -------------------------- | ----------------------------------- |
| 多区域部署 | 主备区域冗余，自动故障转移 | AWS us-east-1 + us-west-2           |
| 蓝绿部署   | 零停机部署，快速回滚       | Kubernetes Service selector 切换    |
| 自动伸缩   | 根据负载自动调整资源       | HPA + VPA                           |
| 健康检查   | 实时监控应用健康状态       | Liveness + Readiness 探针           |
| 自动回滚   | 部署失败时自动回滚         | Kubernetes Deployment 回滚          |
| 混沌工程   | 主动测试系统容错能力       | Chaos Mesh + Litmus                 |
| 负载测试   | 验证系统在高负载下的表现   | k6 + Gatling                        |
| 监控告警   | 实时监控和及时告警         | Prometheus + Grafana + Alertmanager |

---

## 2. 高可用架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户层                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Web     │  │  Mobile  │  │  Desktop │  │  API     │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼────────────┼────────────┼────────────┼────────────────┘
        │            │            │            │
        └────────────┴────────────┴────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Global LB    │  │  CDN          │  │  WAF          │
│  (Route 53)   │  │  (CloudFront) │  │  (AWS WAF)    │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Primary      │  │  Secondary    │  │  Monitoring   │
│  Region       │  │  Region       │  │  Stack        │
│  (us-east-1)  │  │  (us-west-2)  │  │  (Prometheus) │
└───────────────┘  └───────────────┘  └───────────────┘
```

### 2.2 主区域架构 (Primary Region - us-east-1)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Primary Region (us-east-1)                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Ingress     │  │  Application │  │  Services    │           │
│  │  Controller  │  │  Pods (3+)   │  │  Layer       │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                      │
│         ┌──────────────────┼──────────────────┐                   │
│         │                  │                  │                   │
│         ▼                  ▼                  ▼                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  PostgreSQL  │  │  Redis       │  │  S3 Storage  │           │
│  │  (Primary)   │  │  (Primary)   │  │  (Primary)   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 备用区域架构 (Secondary Region - us-west-2)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Secondary Region (us-west-2)                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Ingress     │  │  Application │  │  Services    │           │
│  │  Controller  │  │  Pods (2+)   │  │  Layer       │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                      │
│         ┌──────────────────┼──────────────────┐                   │
│         │                  │                  │                   │
│         ▼                  ▼                  ▼                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  PostgreSQL  │  │  Redis       │  │  S3 Storage  │           │
│  │  (Standby)   │  │  (Standby)   │  │  (Replica)   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 多区域部署

### 3.1 区域选择

| 区域      | 角色      | 用途                     | 资源配置          |
| --------- | --------- | ------------------------ | ----------------- |
| us-east-1 | Primary   | 主生产环境，处理主要流量 | 3+ 节点，高配置   |
| us-west-2 | Secondary | 备用环境，故障转移目标   | 2+ 节点，中等配置 |

### 3.2 数据同步策略

#### PostgreSQL 主从复制

```yaml
# 主数据库配置 (us-east-1)
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: yyc3-learning-postgres
  namespace: yyc3-learning
spec:
  instances: 3
  primaryUpdateStrategy: unsupervised
  postgresql:
    parameters:
      max_connections: '200'
      shared_buffers: '256MB'
      wal_level: logical
      max_wal_senders: '10'
  replication:
    slots:
      highAvailability:
        enabled: true
  backup:
    barmanObjectStore:
      destinationPath: s3://yyc3-learning-backups/postgres
      s3Credentials:
        accessKeyId:
          name: aws-credentials
          key: accessKeyId
        secretAccessKey:
          name: aws-credentials
          key: secretAccessKey
      wal:
        retention: '7d'
      data:
        retention: '30d'
  monitoring:
    enabled: true
```

#### Redis 主从复制

```yaml
# Redis 主从配置
apiVersion: redis.io/v1beta2
kind: RedisCluster
metadata:
  name: yyc3-learning-redis
  namespace: yyc3-learning
spec:
  nodes: 6
  redisConfig:
    maxmemory-policy: allkeys-lru
    save: '900 1 300 10 60 10000'
  security:
    tls:
      secretName: redis-tls
  persistence:
    existingClaim: redis-pvc
  monitoring:
    enabled: true
```

#### S3 跨区域复制

```bash
# 配置 S3 跨区域复制
aws s3api put-bucket-replication \
  --bucket yyc3-learning-primary \
  --replication-configuration '{
    "Role": "arn:aws:iam::123456789012:role/replication-role",
    "Rules": [{
      "Status": "Enabled",
      "Prefix": "",
      "Destination": {
        "Bucket": "arn:aws:s3:::yyc3-learning-secondary",
        "ReplicationTime": {
          "Status": "Enabled",
          "Time": {
            "Minutes": 15
          }
        }
      }
    }]
  }'
```

### 3.3 流量路由

#### Route 53 健康检查

```yaml
# Route 53 健康检查配置
apiVersion: externaldns.k8s.io/v1alpha1
kind: DNSEndpoint
metadata:
  name: yyc3-learning-dns
  namespace: yyc3-learning
spec:
  endpoints:
    - dnsName: yyc3-learning.yyc3.0379.email
      recordTTL: 60
      recordType: A
      targets:
        - 1.2.3.4 # Primary Region LB
        - 5.6.7.8 # Secondary Region LB
      setIdentifier: primary
      healthCheck:
        protocol: HTTPS
        port: 443
        path: /health
        requestInterval: 30
        failureThreshold: 3
```

#### 全局负载均衡器

```yaml
# Global Load Balancer 配置
apiVersion: networking.gke.io/v1beta1
kind: MultiClusterIngress
metadata:
  name: yyc3-learning-global-ingress
  namespace: yyc3-learning
spec:
  template:
    spec:
      backend:
        serviceName: yyc3-learning
        servicePort: 80
      rules:
        - host: yyc3-learning.yyc3.0379.email
          http:
            paths:
              - path: /*
                backend:
                  serviceName: yyc3-learning
                  servicePort: 80
```

---

## 4. 蓝绿部署策略

### 4.1 部署流程

```
┌─────────────────────────────────────────────────────────────────┐
│                        蓝绿部署流程                               │
└─────────────────────────────────────────────────────────────────┘

步骤 1: 准备新版本 (Green)
┌──────────────┐         ┌──────────────┐
│   Blue       │  流量   │   Green      │
│  (v1.0)      │ ──────> │  (v2.0)      │
│  Active      │         │  Preparing   │
└──────────────┘         └──────────────┘

步骤 2: 健康检查
┌──────────────┐         ┌──────────────┐
│   Blue       │  流量   │   Green      │
│  (v1.0)      │ ──────> │  (v2.0)      │
│  Active      │         │  Testing     │
└──────────────┘         └──────────────┘
         │                      │
         └──────────┬───────────┘
                    │
              健康检查通过

步骤 3: 切换流量
┌──────────────┐         ┌──────────────┐
│   Blue       │         │   Green      │
│  (v1.0)      │         │  (v2.0)      │
│  Idle        │ <────── │  Active      │
└──────────────┘  流量   └──────────────┘

步骤 4: 清理旧版本
┌──────────────┐         ┌──────────────┐
│   Blue       │         │   Green      │
│  (v1.0)      │         │  (v2.0)      │
│  Removed     │         │  Active      │
└──────────────┘         └──────────────┘
```

### 4.2 Kubernetes 配置

#### Deployment 配置

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yyc3-learning
  namespace: yyc3-learning
  labels:
    app: yyc3-learning
    color: blue # blue 或 green
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: yyc3-learning
      color: blue
  template:
    metadata:
      labels:
        app: yyc3-learning
        color: blue
        version: v1.0.0
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - yyc3-learning
                topologyKey: kubernetes.io/hostname
      containers:
        - name: app
          image: ghcr.io/YY-Nexus/yyc3-learning-platform:blue-latest
          ports:
            - containerPort: 3000
              name: http
          env:
            - name: NODE_ENV
              value: 'production'
            - name: REGION
              value: 'primary'
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 1000m
              memory: 1Gi
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          lifecycle:
            preStop:
              exec:
                command:
                  - /bin/sh
                  - -c
                  - sleep 15
```

#### Service 配置

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: yyc3-learning
  namespace: yyc3-learning
  labels:
    app: yyc3-learning
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
      name: http
  selector:
    app: yyc3-learning
    color: blue # 控制流量路由
```

#### PodDisruptionBudget 配置

```yaml
# k8s/pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: yyc3-learning-pdb
  namespace: yyc3-learning
  labels:
    app: yyc3-learning
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: yyc3-learning
```

### 4.3 部署脚本

```bash
#!/bin/bash
# deploy-blue-green.sh

set -euo pipefail

NAMESPACE="yyc3-learning"
DEPLOYMENT="yyc3-learning"
SERVICE="yyc3-learning"
NEW_VERSION="${1:-latest}"

echo "🚀 开始蓝绿部署..."

# 获取当前颜色
CURRENT_COLOR=$(kubectl get deployment $DEPLOYMENT -n $NAMESPACE -o jsonpath='{.spec.template.metadata.labels.color}' 2>/dev/null || echo "blue")
NEW_COLOR=$([ "$CURRENT_COLOR" = "blue" ] && echo "green" || echo "blue")

echo "📋 当前颜色: $CURRENT_COLOR"
echo "📋 新颜色: $NEW_COLOR"

# 更新 Deployment 配置
echo "🔧 更新 Deployment 配置..."
sed -i "s/color: $CURRENT_COLOR/color: $NEW_COLOR/g" k8s/deployment.yaml
sed -i "s/version: .*/version: $NEW_VERSION/g" k8s/deployment.yaml

# 应用新版本
echo "📦 部署新版本..."
kubectl apply -f k8s/deployment.yaml -n $NAMESPACE

# 等待新版本就绪
echo "⏳ 等待新版本就绪..."
kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE --timeout=5m

# 健康检查
echo "🔍 执行健康检查..."
sleep 10
HEALTH_CHECK_URL="https://yyc3-learning.yyc3.0379.email/health"
if curl -f -s $HEALTH_CHECK_URL > /dev/null; then
  echo "✅ 健康检查通过"
else
  echo "❌ 健康检查失败，回滚..."
  kubectl rollout undo deployment/$DEPLOYMENT -n $NAMESPACE
  exit 1
fi

# 切换流量
echo "🔄 切换流量到新版本..."
kubectl patch service $SERVICE -n $NAMESPACE -p '{"spec":{"selector":{"color":"'$NEW_COLOR'"}}}'

# 验证流量切换
echo "🔍 验证流量切换..."
sleep 5
if curl -f -s $HEALTH_CHECK_URL > /dev/null; then
  echo "✅ 流量切换成功"
else
  echo "❌ 流量切换失败，回滚..."
  kubectl patch service $SERVICE -n $NAMESPACE -p '{"spec":{"selector":{"color":"'$CURRENT_COLOR'"}}}'
  kubectl rollout undo deployment/$DEPLOYMENT -n $NAMESPACE
  exit 1
fi

# 缩容旧版本
echo "🗑️ 缩容旧版本..."
OLD_COLOR=$([ "$NEW_COLOR" = "blue" ] && echo "green" || echo "blue")
kubectl scale deployment $DEPLOYMENT -n $NAMESPACE --replicas=0 || true

echo "🎉 蓝绿部署完成！"
```

---

## 5. 自动化测试

### 5.1 测试类型

| 测试类型   | 执行时机 | 工具               | 通过条件      |
| ---------- | -------- | ------------------ | ------------- |
| 单元测试   | 每次提交 | Jest               | 覆盖率 ≥ 80%  |
| 集成测试   | 每次提交 | Supertest          | 所有测试通过  |
| 端到端测试 | 每次提交 | Playwright         | 所有测试通过  |
| 性能测试   | 每日     | k6, Lighthouse     | 性能评分 ≥ 90 |
| 安全测试   | 每次提交 | Snyk, Trivy        | 无高危漏洞    |
| 混沌测试   | 每周     | Chaos Mesh, Litmus | 系统自动恢复  |
| 负载测试   | 每周     | k6, Gatling        | 满足性能指标  |

### 5.2 负载测试配置

#### k6 测试脚本

```javascript
// k6/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // 预热
    { duration: '5m', target: 500 }, // 正常负载
    { duration: '5m', target: 1000 }, // 高负载
    { duration: '5m', target: 500 }, // 降级
    { duration: '2m', target: 0 }, // 冷却
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% 请求 < 2s
    http_req_failed: ['rate<0.05'], // 错误率 < 5%
    errors: ['rate<0.05'],
  },
};

const BASE_URL = 'https://yyc3-learning.yyc3.0379.email';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/courses`, null, { tags: { name: 'GetCourses' } }],
    ['GET', `${BASE_URL}/api/user/profile`, null, { tags: { name: 'GetProfile' } }],
    ['GET', `${BASE_URL}/api/exams`, null, { tags: { name: 'GetExams' } }],
  ]);

  responses.forEach((res) => {
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 2s': (r) => r.timings.duration < 2000,
    }) || errorRate.add(1);

    responseTime.add(res.timings.duration);
  });

  sleep(Math.random() * 3 + 1);
}

export function handleSummary(data) {
  return {
    'load-test-summary.json': JSON.stringify(data, null, 2),
  };
}
```

### 5.3 混沌测试配置

#### Chaos Mesh 实验

```yaml
# chaos/chaos-experiment.yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: pod-failure-experiment
  namespace: yyc3-learning
spec:
  action: pod-failure
  mode: one
  duration: '30s'
  selector:
    namespaces:
      - yyc3-learning
    labelSelectors:
      app: yyc3-learning
  scheduler:
    cron: '@weekly'
```

#### Litmus 实验

```yaml
# chaos/litmus-experiment.yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
  namespace: yyc3-learning
spec:
  engineState: 'active'
  annotationCheck: 'false'
  appinfo:
    appns: 'yyc3-learning'
    applabel: 'app=yyc3-learning'
    appkind: 'deployment'
  chaosServiceAccount: pod-delete-sa
  experiments:
    - name: pod-delete
      spec:
        components:
          env:
            - name: TOTAL_CHAOS_DURATION
              value: '60'
            - name: CHAOS_INTERVAL
              value: '10'
            - name: PODS_AFFECTED_PERC
              value: '1'
```

---

## 6. 监控与告警

### 6.1 Prometheus 监控配置

#### ServiceMonitor 配置

```yaml
# k8s/servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: yyc3-learning
  namespace: yyc3-learning
  labels:
    app: yyc3-learning
    release: prometheus
spec:
  selector:
    matchLabels:
      app: yyc3-learning
  endpoints:
    - port: http
      path: /metrics
      interval: 15s
      scrapeTimeout: 10s
      metricRelabelings:
        - sourceLabels: [__name__]
          regex: 'go_.*|process_.*'
          action: drop
```

#### Prometheus 规则

```yaml
# prometheus/rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: yyc3-learning-alerts
  namespace: yyc3-learning
spec:
  groups:
  - name: yyc3-learning.rules
    rules:
    - alert: HighErrorRate
      expr: |
        rate(http_requests_total{job="yyc3-learning",code=~"5.."}[5m])
        / rate(http_requests_total{job="yyc3-learning"}[5m]) > 0.05
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "High error rate detected"
        description: "Error rate is {{ $value | humanizePercentage }}"

    - alert: HighResponseTime
      expr: |
        histogram_quantile(0.95,
          rate(http_request_duration_seconds_bucket{job="yyc3-learning"}[5m])
        ) > 2
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High response time detected"
        description: "P95 response time is {{ $value }}s"

    - alert: PodRestartCount
      expr: |
        increase(kube_pod_container_status_restarts_total{
          namespace="yyc3-learning",
          container="app"
       }[5m]) > 3
      for: 1m
      labels:
        severity: warning
      annotations:
        summary: "Pod restart count is high"
        description: "Pod {{ $labels.pod }} has restarted {{ $value }} times"

    - alert: HighCPUUsage
      expr: |
        rate(container_cpu_usage_seconds_total{
          namespace="yyc3-learning",
          container="app"
        }[5m]) > 0.8
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High CPU usage detected"
        description: "CPU usage is {{ $value | humanizePercentage }}"

    - alert: HighMemoryUsage
      expr: |
        container_memory_usage_bytes{
          namespace="yyc3-learning",
          container="app"
        } / container_spec_memory_limit_bytes{
          namespace="yyc3-learning",
          container="app"
        } > 0.8
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High memory usage detected"
        description: "Memory usage is {{ $value | humanizePercentage }}"
```

### 6.2 Grafana 仪表板

#### 应用性能仪表板

```json
{
  "dashboard": {
    "title": "YYC³ Learning Platform - Application Performance",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=\"yyc3-learning\"}[5m])",
            "legendFormat": "{{ method }} {{ path }}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Response Time (P95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=\"yyc3-learning\"}[5m]))"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=\"yyc3-learning\",code=~\"5..\"}[5m]) / rate(http_requests_total{job=\"yyc3-learning\"}[5m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Active Connections",
        "targets": [
          {
            "expr": "http_active_connections{job=\"yyc3-learning\"}"
          }
        ],
        "type": "stat"
      }
    ]
  }
}
```

---

## 7. 灾难恢复

### 7.1 备份策略

| 资源类型   | 备份频率 | 保留时间 | 存储位置        |
| ---------- | -------- | -------- | --------------- |
| PostgreSQL | 每小时   | 30 天    | S3 (跨区域复制) |
| Redis      | 每小时   | 7 天     | S3 (跨区域复制) |
| 应用配置   | 每次部署 | 30 天    | Git + S3        |
| 日志       | 实时     | 30 天    | Elasticsearch   |

### 7.2 恢复流程

#### PostgreSQL 恢复

```bash
#!/bin/bash
# restore-postgres.sh

set -euo pipefail

BACKUP_FILE="${1}"
NAMESPACE="yyc3-learning"

echo "🔄 开始恢复 PostgreSQL..."

# 从 S3 下载备份
aws s3 cp s3://yyc3-learning-backups/postgres/$BACKUP_FILE /tmp/backup.sql.gz

# 解压备份
gunzip /tmp/backup.sql.gz

# 停止应用
kubectl scale deployment yyc3-learning -n $NAMESPACE --replicas=0

# 恢复数据库
kubectl exec -n $NAMESPACE deployment/postgres -- psql -U postgres -d yyc3_learning < /tmp/backup.sql

# 重启应用
kubectl scale deployment yyc3-learning -n $NAMESPACE --replicas=3

echo "✅ PostgreSQL 恢复完成"
```

#### Redis 恢复

```bash
#!/bin/bash
# restore-redis.sh

set -euo pipefail

BACKUP_FILE="${1}"
NAMESPACE="yyc3-learning"

echo "🔄 开始恢复 Redis..."

# 从 S3 下载备份
aws s3 cp s3://yyc3-learning-backups/redis/$BACKUP_FILE /tmp/backup.rdb

# 停止应用
kubectl scale deployment yyc3-learning -n $NAMESPACE --replicas=0

# 复制备份文件到 Redis Pod
kubectl cp /tmp/backup.rdb $NAMESPACE/redis-0:/data/dump.rdb

# 重启 Redis
kubectl rollout restart statefulset/redis -n $NAMESPACE

# 等待 Redis 就绪
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=5m

# 重启应用
kubectl scale deployment yyc3-learning -n $NAMESPACE --replicas=3

echo "✅ Redis 恢复完成"
```

### 7.3 区域故障转移

```bash
#!/bin/bash
# failover-to-secondary.sh

set -euo pipefail

PRIMARY_REGION="us-east-1"
SECONDARY_REGION="us-west-2"

echo "🚨 开始故障转移到备用区域..."

# 1. 更新 Route 53 指向备用区域
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "yyc3-learning.yyc3.0379.email",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z0987654321XYZ",
          "DNSName": "yyc3-learning-secondary-elb.us-west-2.elb.amazonaws.com",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'

# 2. 提升备用数据库为主库
kubectl exec -n yyc3-learning statefulset/postgres-secondary -- \
  psql -U postgres -c "SELECT pg_promote();"

# 3. 更新应用配置
kubectl set env deployment/yyc3-learning -n yyc3-learning \
  DATABASE_HOST=postgres-secondary.yyc3-learning.svc.cluster.local

# 4. 验证服务可用性
sleep 30
if curl -f https://yyc3-learning.yyc3.0379.email/health; then
  echo "✅ 故障转移成功"
else
  echo "❌ 故障转移失败"
  exit 1
fi

echo "🎉 故障转移完成，备用区域已接管服务"
```

---

## 8. 运维指南

### 8.1 日常运维任务

| 任务         | 频率   | 责任人 | 工具                   |
| ------------ | ------ | ------ | ---------------------- |
| 监控检查     | 每日   | 运维   | Grafana, Prometheus    |
| 日志审查     | 每日   | 运维   | Elasticsearch, Kibana  |
| 备份验证     | 每周   | 运维   | AWS CLI, kubectl       |
| 性能优化     | 每周   | 开发   | k6, Lighthouse         |
| 安全扫描     | 每周   | 安全   | Snyk, Trivy            |
| 容量规划     | 每月   | 运维   | CloudWatch, Prometheus |
| 灾难恢复演练 | 每季度 | 全团队 | Chaos Mesh, Litmus     |

### 8.2 故障排查流程

#### 1. 确认问题范围

```bash
# 检查应用状态
kubectl get pods -n yyc3-learning

# 检查服务状态
kubectl get svc -n yyc3-learning

# 检查事件
kubectl get events -n yyc3-learning --sort-by='.lastTimestamp'

# 检查日志
kubectl logs -n yyc3-learning -l app=yyc3-learning --tail=100
```

#### 2. 查看监控指标

```bash
# 查看当前错误率
curl -s http://prometheus:9090/api/v1/query?query='rate(http_requests_total{code=~"5.."}[5m])' | jq

# 查看响应时间
curl -s http://prometheus:9090/api/v1/query?query='histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))' | jq

# 查看 CPU 使用率
kubectl top pods -n yyc3-learning
```

#### 3. 执行健康检查

```bash
# 应用健康检查
curl -f https://yyc3-learning.yyc3.0379.email/health

# 数据库健康检查
kubectl exec -n yyc3-learning deployment/postgres -- pg_isready

# Redis 健康检查
kubectl exec -n yyc3-learning statefulset/redis -- redis-cli ping
```

#### 4. 采取恢复措施

```bash
# 重启 Deployment
kubectl rollout restart deployment/yyc3-learning -n yyc3-learning

# 回滚到上一个版本
kubectl rollout undo deployment/yyc3-learning -n yyc3-learning

# 扩容 Pod
kubectl scale deployment yyc3-learning -n yyc3-learning --replicas=5

# 查看部署状态
kubectl rollout status deployment/yyc3-learning -n yyc3-learning
```

### 8.3 性能优化建议

#### 应用层优化

1. **启用缓存**
   - 使用 Redis 缓存频繁访问的数据
   - 实现客户端缓存策略
   - 使用 CDN 缓存静态资源

2. **优化数据库查询**
   - 添加适当的索引
   - 使用连接池
   - 实现读写分离

3. **异步处理**
   - 使用消息队列处理耗时任务
   - 实现后台作业处理
   - 使用 WebSockets 替代轮询

#### 基础设施层优化

1. **资源配置**
   - 根据 HPA 自动调整副本数
   - 使用 VPA 优化资源请求和限制
   - 实现节点自动伸缩

2. **网络优化**
   - 使用 Service Mesh 优化服务间通信
   - 启用 HTTP/2 和 gRPC
   - 实现连接复用

3. **存储优化**
   - 使用 SSD 存储
   - 实现数据分层存储
   - 定期清理过期数据

---

## 📄 文档标尾 (Footer)

> 「**_YanYuCloudCube_**」
> 「**_<admin@0379.email>_**」
> 「**_Words Initiate Quadrants, Language Serves as Core for the Future_**」
> 「**_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**」
