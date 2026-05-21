# YYC³ Learning Platform - Kubernetes 部署指南

> **_YanYuCloudCube_**
> **标语**：言启象限 | 语枢未来
> **_Words Initiate Quadrants, Language Serves as Core for the Future_**
> **标语**：万象归元于云枢 | 深栈智启新纪元
> **_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**

## 📋 目录

- [概述](#概述)
- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [高可用特性](#高可用特性)
- [监控和日志](#监控和日志)
- [故障排查](#故障排查)
- [维护操作](#维护操作)

---

## 概述

本目录包含 YYC³ Learning Platform 的 Kubernetes 部署配置文件，支持高可用、自动扩缩容和蓝绿部署。

### 架构组件

- **应用部署**: 3 副本，支持自动扩缩容
- **PostgreSQL**: StatefulSet，持久化存储
- **Redis**: StatefulSet，持久化存储
- **Ingress**: Nginx Ingress Controller，支持 HTTPS
- **HPA**: 水平 Pod 自动缩放
- **ServiceAccount**: RBAC 权限管理

---

## 前置要求

### 必需工具

- **kubectl** v1.28.0+
- **Helm** v3.0+ (可选，用于安装 Ingress Controller)
- **Docker** v20.10+ (用于构建镜像)
- **kubectl** 配置文件 (kubeconfig)

### Kubernetes 集群要求

- Kubernetes v1.24+
- 至少 3 个工作节点
- 每个节点至少 4 CPU 和 8GB RAM
- 支持 LoadBalancer 或 Ingress Controller
- 支持 PersistentVolume (GP3 或 SSD)

### 检查集群连接

```bash
kubectl cluster-info
kubectl get nodes
```

---

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/YY-Nexus/yyc3-learning-platform.git
cd yyc3-learning-platform/k8s
```

### 2. 配置密钥

编辑 `secret.yaml` 文件，更新所有敏感信息：

```bash
vim secret.yaml
```

必须更新的字段：

- `POSTGRES_PASSWORD`: PostgreSQL 密码
- `DATABASE_URL`: PostgreSQL 连接字符串
- `REDIS_PASSWORD`: Redis 密码
- `REDIS_URL`: Redis 连接字符串
- `JWT_SECRET`: JWT 密钥（使用 `openssl rand -base64 32` 生成）

### 3. 部署到集群

使用部署脚本一键部署：

```bash
./deploy.sh deploy
```

或手动部署：

```bash
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml
kubectl apply -f configmap.yaml
kubectl apply -f serviceaccount.yaml
kubectl apply -f postgres.yaml
kubectl apply -f redis.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

### 4. 验证部署

```bash
# 查看所有资源
./deploy.sh status

# 查看应用日志
./deploy.sh logs

# 检查 Pod 状态
kubectl get pods -n yyc3-learning

# 检查服务状态
kubectl get svc -n yyc3-learning

# 检查 Ingress 状态
kubectl get ingress -n yyc3-learning
```

### 5. 访问应用

通过 Ingress 访问：

```
https://yyc3-learning.yyc3.0379.email
```

---

## 配置说明

### Namespace

定义独立的命名空间 `yyc3-learning`，实现资源隔离。

### ConfigMap

包含非敏感的配置信息：

- 应用 URL 和 API URL
- PostgreSQL 和 Redis 连接信息
- 日志级别
- 性能参数

### Secret

包含敏感信息：

- 数据库凭证
- Redis 密码
- JWT 密钥
- 第三方 API 密钥

### Deployment

应用部署配置：

- **副本数**: 3（可通过 HPA 自动调整）
- **资源限制**: CPU 1000m, Memory 1Gi
- **健康检查**: Liveness 和 Readiness 探针
- **Pod 反亲和性**: 分散到不同节点

### Service

服务暴露配置：

- **ClusterIP**: 内部服务访问
- **Session Affinity**: 客户端 IP 会话保持
- **端口映射**: 80 -> 3000

### Ingress

外部访问配置：

- **域名**: yyc3-learning.yyc3.0379.email
- **HTTPS**: 自动 SSL 证书（Let's Encrypt）
- **速率限制**: 100 请求/秒
- **CORS**: 跨域资源共享

### HPA

自动扩缩容配置：

- **最小副本**: 3
- **最大副本**: 10
- **CPU 阈值**: 70%
- **内存阈值**: 80%

### StatefulSet (PostgreSQL & Redis)

有状态服务配置：

- **持久化存储**: GP3 SSD
- **存储大小**: PostgreSQL 20Gi, Redis 5Gi
- **健康检查**: Liveness 和 Readiness 探针

---

## 高可用特性

### 1. 多副本部署

应用默认部署 3 个副本，通过 HPA 可自动扩展到 10 个副本。

### 2. Pod 反亲和性

Pod 分散到不同的节点，避免单点故障。

### 3. 健康检查

Liveness 和 Readiness 探针确保应用健康运行。

### 4. 自动扩缩容

基于 CPU 和内存使用率自动调整副本数量。

### 5. 持久化存储

PostgreSQL 和 Redis 使用持久化存储，数据不丢失。

### 6. 蓝绿部署

通过 CI/CD 实现蓝绿部署，零停机更新。

### 7. 滚动更新

Deployment 使用滚动更新策略，逐步替换 Pod。

### 8. 会话保持

Service 配置会话保持，确保用户会话连续性。

---

## 监控和日志

### 查看 Pod 日志

```bash
# 查看应用日志
kubectl logs -l app=yyc3-learning -n yyc3-learning --tail=100 -f

# 查看 PostgreSQL 日志
kubectl logs -l app=postgres -n yyc3-learning --tail=100 -f

# 查看 Redis 日志
kubectl logs -l app=redis -n yyc3-learning --tail=100 -f
```

### 查看资源使用

```bash
# 查看 Pod 资源使用
kubectl top pods -n yyc3-learning

# 查看 Node 资源使用
kubectl top nodes
```

### 查看事件

```bash
# 查看命名空间事件
kubectl get events -n yyc3-learning --sort-by='.lastTimestamp'
```

### Prometheus 监控

应用暴露 `/metrics` 端点，可被 Prometheus 采集。

配置示例：

```yaml
scrape_configs:
  - job_name: 'yyc3-learning'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - yyc3-learning
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: yyc3-learning
      - source_labels: [__meta_kubernetes_pod_ip]
        target_label: __address__
        replacement: $1:3000
```

---

## 故障排查

### Pod 无法启动

```bash
# 查看 Pod 状态
kubectl describe pod <pod-name> -n yyc3-learning

# 查看 Pod 日志
kubectl logs <pod-name> -n yyc3-learning

# 查看 Pod 事件
kubectl get events -n yyc3-learning --field-selector involvedObject.name=<pod-name>
```

### 服务无法访问

```bash
# 检查 Service
kubectl get svc -n yyc3-learning
kubectl describe svc yyc3-learning -n yyc3-learning

# 检查 Endpoint
kubectl get endpoints -n yyc3-learning

# 测试服务连通性
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://yyc3-learning:80
```

### Ingress 无法访问

```bash
# 检查 Ingress
kubectl get ingress -n yyc3-learning
kubectl describe ingress yyc3-learning-ingress -n yyc3-learning

# 检查 Ingress Controller
kubectl get pods -n ingress-nginx

# 检查 DNS 解析
nslookup yyc3-learning.yyc3.0379.email
```

### 数据库连接失败

```bash
# 检查 PostgreSQL Pod
kubectl get pods -l app=postgres -n yyc3-learning

# 测试数据库连接
kubectl run -it --rm debug --image=postgres:15-alpine --restart=Never -- psql -h postgres -U yyc3 -d yyc3_my

# 查看 PostgreSQL 日志
kubectl logs -l app=postgres -n yyc3-learning
```

### Redis 连接失败

```bash
# 检查 Redis Pod
kubectl get pods -l app=redis -n yyc3-learning

# 测试 Redis 连接
kubectl run -it --rm debug --image=redis:7-alpine --restart=Never -- redis-cli -h redis -a <password> ping

# 查看 Redis 日志
kubectl logs -l app=redis -n yyc3-learning
```

---

## 维护操作

### 扩容应用

```bash
# 手动扩容到 5 个副本
kubectl scale deployment yyc3-learning -n yyc3-learning --replicas=5

# 查看扩容状态
kubectl rollout status deployment/yyc3-learning -n yyc3-learning
```

### 更新应用镜像

```bash
# 更新镜像
kubectl set image deployment/yyc3-learning app=ghcr.io/yy-nexus/yyc3-learning-platform/yyc3-learning:v1.0.1 -n yyc3-learning

# 查看更新状态
kubectl rollout status deployment/yyc3-learning -n yyc3-learning

# 回滚到上一个版本
kubectl rollout undo deployment/yyc3-learning -n yyc3-learning
```

### 备份数据库

```bash
# 备份 PostgreSQL
kubectl exec -it postgres-0 -n yyc3-learning -- pg_dump -U yyc3 yyc3_my > backup.sql

# 恢复 PostgreSQL
kubectl exec -i postgres-0 -n yyc3-learning -- psql -U yyc3 yyc3_my < backup.sql
```

### 清理部署

```bash
# 使用部署脚本清理
./deploy.sh cleanup

# 或手动清理
kubectl delete namespace yyc3-learning
```

---

## 📄 文档标尾 (Footer)

> 「**_YanYuCloudCube_**」
> 「**_<admin@0379.email>_**」
> 「**_Words Initiate Quadrants, Language Serves as Core for the Future_**」
> 「**_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**」
