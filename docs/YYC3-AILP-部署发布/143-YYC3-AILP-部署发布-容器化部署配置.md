---
@file: 143-YYC3-AILP-部署发布-容器化部署配置.md
@description: YYC3-AILP Docker+K8s容器化部署的配置文件、镜像构建、编排规则
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2026-01-24
@status: published
@tags: [部署发布],[容器化],[Docker]
---

> **_YanYuCloudCube_**
> **标语**：言启象限 | 语枢未来
> **_Words Initiate Quadrants, Language Serves as Core for the Future_**
> **标语**：万象归元于云枢 | 深栈智启新纪元
> **_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**

---

# 143-YYC3-AILP-部署发布-容器化部署配置

## 📋 文档信息

| 属性         | 内容                              |
| ------------ | --------------------------------- |
| **文档标题** | YYC3-AILP-部署发布-容器化部署配置 |
| **文档版本** | v1.0.0                            |
| **创建时间** | 2026-01-24                        |
| **适用范围** | YYC3-AILP学习平台容器化部署       |
| **文档类型** | 容器化部署、Docker、Kubernetes    |

---

## 📖 文档概述

本文档详细描述YYC³ AILP学习平台的容器化部署配置，包括Docker镜像构建、Kubernetes集群配置、容器编排规则、服务发现、负载均衡、监控告警等关键内容。通过本文档，运维团队可以实现高效、可靠的容器化部署，确保按照YYC³团队的「五高五标五化」核心理念进行高质量的系统交付。

---

## 🐳 Docker镜像构建配置

### 🎯 基础镜像选择

**多阶段构建策略**:

```dockerfile
# 基础构建镜像
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产环境镜像
FROM node:18-alpine AS production

# 创建应用用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 设置工作目录
WORKDIR /app

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 启动命令
CMD ["npm", "start"]
```

**Docker Compose开发环境配置**:

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # 应用服务
  yyc3-ailp-app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: yyc3-ailp-app-dev
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
      - DATABASE_URL=mysql://yyc3_user:password@mysql:3306/yyc3_ailp
      - REDIS_URL=redis://redis:6379
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - mysql
      - redis
    networks:
      - yyc3-network

  # MySQL数据库
  mysql:
    image: mysql:8.0
    container_name: yyc3-ailp-mysql-dev
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: yyc3_ailp
      MYSQL_USER: yyc3_user
      MYSQL_PASSWORD: password
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - yyc3-network

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: yyc3-ailp-redis-dev
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - yyc3-network

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: yyc3-ailp-nginx-dev
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.dev.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - yyc3-ailp-app
    networks:
      - yyc3-network

volumes:
  mysql_data:
  redis_data:

networks:
  yyc3-network:
    driver: bridge
```

---

## ☸️ Kubernetes集群配置

### 🎯 集群架构设计

**Kubernetes集群架构**:

```
┌─────────────────────────────────────────────────────────────┐
│                    YYC³ AILP Kubernetes集群架构        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │  Master节点  │    │  Master节点  │    │  Master节点  │   │
│  │ Master-1   │    │ Master-2   │    │ Master-3   │   │
│  │ (控制平面)   │    │ (控制平面)   │    │ (控制平面)   │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │  Worker节点  │    │  Worker节点  │    │  Worker节点  │   │
│  │ Worker-1   │    │ Worker-2   │    │ Worker-3   │   │
│  │ (应用节点)   │    │ (应用节点)   │    │ (应用节点)   │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │  Worker节点  │    │  Worker节点  │    │  Worker节点  │   │
│  │ Worker-4   │    │ Worker-5   │    │ Worker-6   │   │
│  │ (数据库节点)  │    │ (数据库节点)  │    │ (数据库节点)  │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              存储层              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│   │
│  │  │  持久化存储   │  │  对象存储     │  │  备份存储    ││   │
│  │  │ Persistent  │  │ Object     │  │ Backup     ││   │
│  │  │ Storage    │  │ Storage    │  │ Storage    ││   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**命名空间配置**:

```yaml
# namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: yyc3-ailp-prod
  labels:
    name: yyc3-ailp-prod
    environment: production
    project: yyc3-ailp
---
apiVersion: v1
kind: Namespace
metadata:
  name: yyc3-ailp-staging
  labels:
    name: yyc3-ailp-staging
    environment: staging
    project: yyc3-ailp
---
apiVersion: v1
kind: Namespace
metadata:
  name: yyc3-ailp-dev
  labels:
    name: yyc3-ailp-dev
    environment: development
    project: yyc3-ailp
```

**应用部署配置**:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yyc3-ailp-app
  namespace: yyc3-ailp-prod
  labels:
    app: yyc3-ailp-app
    version: v2.2.0
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: yyc3-ailp-app
  template:
    metadata:
      labels:
        app: yyc3-ailp-app
        version: v2.2.0
    spec:
      containers:
        - name: yyc3-ailp-app
          image: yyc3/ailp-app:v2.2.0
          ports:
            - containerPort: 3000
              name: http
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: yyc3-ailp-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: yyc3-ailp-secrets
                  key: redis-url
          resources:
            requests:
              memory: '512Mi'
              cpu: '250m'
            limits:
              memory: '1Gi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /api/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          volumeMounts:
            - name: config-volume
              mountPath: /app/config
              readOnly: true
      volumes:
        - name: config-volume
          configMap:
            name: yyc3-ailp-config
      imagePullSecrets:
        - name: yyc3-registry-secret
      nodeSelector:
        node-type: application
      tolerations:
        - key: 'application'
          operator: 'Equal'
          value: 'true'
          effect: 'NoSchedule'
```

**服务配置**:

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: yyc3-ailp-app-service
  namespace: yyc3-ailp-prod
  labels:
    app: yyc3-ailp-app
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
      name: http
  selector:
    app: yyc3-ailp-app
---
apiVersion: v1
kind: Service
metadata:
  name: yyc3-ailp-app-headless
  namespace: yyc3-ailp-prod
  labels:
    app: yyc3-ailp-app
spec:
  type: ClusterIP
  clusterIP: None
  ports:
    - port: 3000
      targetPort: 3000
      protocol: TCP
      name: http
  selector:
    app: yyc3-ailp-app
```

**Ingress配置**:

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: yyc3-ailp-ingress
  namespace: yyc3-ailp-prod
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
    nginx.ingress.kubernetes.io/proxy-body-size: '50m'
    nginx.ingress.kubernetes.io/rate-limit: '100'
    nginx.ingress.kubernetes.io/rate-limit-window: '1m'
spec:
  tls:
    - hosts:
        - yyc3-ailp.example.com
      secretName: yyc3-ailp-tls
  rules:
    - host: yyc3-ailp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: yyc3-ailp-app-service
                port:
                  number: 80
```

---

## 🔧 配置管理与密钥

### 🎯 ConfigMap配置

**应用配置**:

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: yyc3-ailp-config
  namespace: yyc3-ailp-prod
data:
  app.json: |
    {
      "name": "YYC³ AILP",
      "version": "2.2.0",
      "environment": "production",
      "features": {
        "intelligentWidget": true,
        "collaboration": true,
        "aiRecommendations": true,
        "advancedAnalytics": true
      },
      "limits": {
        "maxFileSize": "50MB",
        "maxConcurrentUsers": 10000,
        "sessionTimeout": "30m"
      }
    }
  logging.json: |
    {
      "level": "info",
      "format": "json",
      "outputs": ["console", "file"],
      "file": {
        "path": "/var/log/yyc3-ailp/app.log",
        "maxSize": "100MB",
        "maxFiles": 10
      }
    }
  nginx.conf: |
    upstream yyc3_ailp_backend {
      server yyc3-ailp-app-service:80;
    }

    server {
      listen 80;
      server_name yyc3-ailp.example.com;
      
      location / {
        proxy_pass http://yyc3_ailp_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
      }
      
      location /api/health {
        proxy_pass http://yyc3-ailp-app-service:3000/api/health;
        access_log off;
      }
    }
```

### 🎯 Secret配置

**敏感信息配置**:

```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: yyc3-ailp-secrets
  namespace: yyc3-ailp-prod
type: Opaque
data:
  database-url: bXlzcWw6Ly95eWMzX3VzZXI6cGFzc3dvcmRAbXlzcWw6MzMwNi95eWMzX2FpbHA= # base64编码
  redis-url: cmVkaXM6Ly9yZWRpczYzNzA6NjM3MA== # base64编码
  jwt-secret: eWljMy1haWxwLWp3dC1zZWNyZXQta2V5LTIwMjY= # base64编码
  api-key: YWJjZGVmZ2hpamsxMjM0NTY3ODkw # base64编码
---
apiVersion: v1
kind: Secret
metadata:
  name: yyc3-registry-secret
  namespace: yyc3-ailp-prod
type: kubernetes.io/dockerconfigjson

---
# storage.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: yyc3-ailp-storage-pvc
  namespace: yyc3-ailp-prod
  labels:
    app: yyc3-ailp-app
    component: storage
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: yyc3-ailp-storage
  resources:
    requests:
      storage: 50Gi

---
# monitoring.yaml
apiVersion: v1
kind: ServiceMonitor
metadata:
  name: yyc3-ailp-app-metrics
  namespace: yyc3-ailp-prod
  labels:
    app: yyc3-ailp-app
    component: monitoring
spec:
  selector:
    matchLabels:
      app: yyc3-ailp-app
  endpoints:
    - port: metrics
      path: /metrics
      interval: 30s
      scrapeTimeout: 10s

---
# autoscaler.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: yyc3-ailp-app-hpa
  namespace: yyc3-ailp-prod
  labels:
    app: yyc3-ailp-app
    component: autoscaling
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: yyc3-ailp-app
  minReplicas: 4
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60

---
# networkpolicy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: yyc3-ailp-app-network-policy
  namespace: yyc3-ailp-prod
  labels:
    app: yyc3-ailp-app
    component: security
spec:
  podSelector:
    matchLabels:
      app: yyc3-ailp-app
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: yyc3-ailp-ingress
        - namespaceSelector:
            matchLabels:
              name: yyc3-ailp-monitoring
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: yyc3-ailp-database
      ports:
        - protocol: TCP
          port: 3306
    - to:
        - namespaceSelector:
            matchLabels:
              name: yyc3-ailp-cache
      ports:
        - protocol: TCP
          port: 6379
    - to: []
      ports:
        - protocol: TCP
          port: 53
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 443
        - protocol: TCP
          port: 80

---
# rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: yyc3-ailp-app-sa
  namespace: yyc3-ailp-prod
  labels:
    app: yyc3-ailp-app
    component: rbac

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: yyc3-ailp-app-role
  namespace: yyc3-ailp-prod
  labels:
    app: yyc3-ailp-app
    component: rbac
rules:
  - apiGroups: ['']
    resources: ['configmaps', 'secrets']
    verbs: ['get', 'list', 'watch']
  - apiGroups: ['']
    resources: ['pods']
    verbs: ['get', 'list', 'watch']

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: yyc3-ailp-app-rolebinding
  namespace: yyc3-ailp-prod
  labels:
    app: yyc3-ailp-app
    component: rbac
subjects:
  - kind: ServiceAccount
    name: yyc3-ailp-app-sa
    namespace: yyc3-ailp-prod
roleRef:
  kind: Role
  name: yyc3-ailp-app-role
  apiGroup: rbac.authorization.k8s.io

---
# poddisruptionbudget.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: yyc3-ailp-app-pdb
  namespace: yyc3-ailp-prod
  labels:
    app: yyc3-ailp-app
    component: availability
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: yyc3-ailp-app

---
# resourcequota.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: yyc3-ailp-app-quota
  namespace: yyc3-ailp-prod
  labels:
    app: yyc3-ailp-app
    component: resources
spec:
  hard:
    requests.cpu: '4'
    requests.memory: 8Gi
    limits.cpu: '8'
    limits.memory: 16Gi
    persistentvolumeclaims: '5'
    services: '5'
    secrets: '10'
    configmaps: '10'
    count/deployments.apps: '5'
    count/pods: '20'
```

## 5. CI/CD集成配置

### 5.1 GitHub Actions工作流

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=tag
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: 'v1.24.0'

      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig

      - name: Deploy to Kubernetes
        run: |
          export KUBECONFIG=kubeconfig

          # 更新镜像标签
          sed -i "s|image: yyc3/ailp-app:.*|image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.ref_name }}|g" deployment.yaml

          # 应用配置
          kubectl apply -f namespace.yaml
          kubectl apply -f configmap.yaml
          kubectl apply -f secrets.yaml
          kubectl apply -f deployment.yaml
          kubectl apply -f service.yaml
          kubectl apply -f ingress.yaml

          # 等待部署完成
          kubectl rollout status deployment/yyc3-ailp-app -n yyc3-ailp-prod --timeout=300s

          # 验证部署
          kubectl get pods -n yyc3-ailp-prod -l app=yyc3-ailp-app
```

### 5.2 GitLab CI/CD配置

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_REGISTRY: registry.gitlab.com
  IMAGE_NAME: $CI_REGISTRY_IMAGE
  KUBERNETES_NAMESPACE: yyc3-ailp-prod

before_script:
  - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

test:
  stage: test
  image: node:18-alpine
  script:
    - npm ci
    - npm test
    - npm run lint
    - npm run type-check
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker build -t $IMAGE_NAME:$CI_COMMIT_SHA .
    - docker tag $IMAGE_NAME:$CI_COMMIT_SHA $IMAGE_NAME:latest
    - docker push $IMAGE_NAME:$CI_COMMIT_SHA
    - docker push $IMAGE_NAME:latest
  only:
    - main
    - tags

deploy_staging:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context $KUBE_CONTEXT_STAGING
    - sed -i "s|image: yyc3/ailp-app:.*|image: $IMAGE_NAME:$CI_COMMIT_SHA|g" deployment.yaml
    - kubectl apply -f deployment.yaml
    - kubectl rollout status deployment/yyc3-ailp-app -n $KUBERNETES_NAMESPACE_STAGING
  environment:
    name: staging
    url: https://staging.ailp.yyc3.com
  only:
    - main

deploy_production:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context $KUBE_CONTEXT_PROD
    - sed -i "s|image: yyc3/ailp-app:.*|image: $IMAGE_NAME:$CI_COMMIT_TAG|g" deployment.yaml
    - kubectl apply -f deployment.yaml
    - kubectl rollout status deployment/yyc3-ailp-app -n $KUBERNETES_NAMESPACE
  environment:
    name: production
    url: https://ailp.yyc3.com
  when: manual
  only:
    - tags
```

## 6. 监控与日志配置

### 6.1 Prometheus监控配置

```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: yyc3-ailp-monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    rule_files:
      - "yyc3-ailp-rules.yml"

    scrape_configs:
      - job_name: 'yyc3-ailp-app'
        static_configs:
          - targets: ['yyc3-ailp-app-service.yyc3-ailp-prod.svc.cluster.local:3000']
        metrics_path: '/metrics'
        scrape_interval: 30s
        
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
            namespaces:
              names:
                - yyc3-ailp-prod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)

  yyc3-ailp-rules.yml: |
    groups:
    - name: yyc3-ailp-app.rules
      rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
          
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"
          
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Pod is crash looping"
          description: "Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} is crash looping"
```

### 6.2 Grafana仪表板配置

```json
{
  "dashboard": {
    "title": "YYC³ AILP Application Dashboard",
    "tags": ["yyc3", "ailp", "application"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (method, status)",
            "legendFormat": "{{method}} {{status}}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests/sec"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "50th percentile"
          },
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "99th percentile"
          }
        ],
        "yAxes": [
          {
            "label": "Seconds"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"4..\"}[5m])) / sum(rate(http_requests_total[5m]))",
            "legendFormat": "4xx errors"
          },
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))",
            "legendFormat": "5xx errors"
          }
        ],
        "yAxes": [
          {
            "label": "Percentage",
            "max": 1,
            "min": 0
          }
        ]
      },
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(container_cpu_usage_seconds_total{pod=~\"yyc3-ailp-app-.*\"}[5m])) by (pod)",
            "legendFormat": "{{pod}}"
          }
        ],
        "yAxes": [
          {
            "label": "CPU Cores"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(container_memory_usage_bytes{pod=~\"yyc3-ailp-app-.*\"}) by (pod)",
            "legendFormat": "{{pod}}"
          }
        ],
        "yAxes": [
          {
            "label": "Bytes"
          }
        ]
      }
    ]
  }
}
```

### 6.3 日志收集配置

```yaml
# fluentd-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: yyc3-ailp-logging
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*yyc3-ailp-app*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      format json
      time_format %Y-%m-%dT%H:%M:%S.%NZ
    </source>

    <filter kubernetes.**>
      @type kubernetes_metadata
    </filter>

    <filter kubernetes.**>
      @type record_transformer
      <record>
        hostname ${hostname}
        environment #{ENV['ENVIRONMENT'] || 'production'}
      </record>
    </filter>

    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch.logging.svc.cluster.local
      port 9200
      index_name yyc3-ailp-logs
      type_name _doc
      include_tag_key true
      tag_key @log_name
      <buffer>
        @type file
        path /var/log/fluentd-buffers/kubernetes.system.buffer
        flush_mode interval
        retry_type exponential_backoff
        flush_thread_count 2
        flush_interval 5s
        retry_forever
        retry_max_interval 30
        chunk_limit_size 2M
        queue_limit_length 8
        overflow_action block
      </buffer>
    </match>
```

## 7. 安全配置

### 7.1 Pod安全策略

```yaml
# pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: yyc3-ailp-app-psp
  namespace: yyc3-ailp-prod
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
  readOnlyRootFilesystem: true
```

### 7.2 网络安全策略

```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: yyc3-ailp-app-deny-egress
  namespace: yyc3-ailp-prod
spec:
  podSelector:
    matchLabels:
      app: yyc3-ailp-app
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: yyc3-ailp-database
      ports:
        - protocol: TCP
          port: 3306
    - to:
        - namespaceSelector:
            matchLabels:
              name: yyc3-ailp-cache
      ports:
        - protocol: TCP
          port: 6379
    - to: []
      ports:
        - protocol: TCP
          port: 53
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 443
```

## 8. 备份与恢复

### 8.1 数据备份配置

```yaml
# backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: yyc3-ailp-backup
  namespace: yyc3-ailp-prod
spec:
  schedule: '0 2 * * *' # 每天凌晨2点执行
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: mysql:8.0
              command:
                - /bin/bash
                - -c
                - |
                  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
                  BACKUP_FILE="yyc3-ailp-backup-${TIMESTAMP}.sql"

                  # 执行数据库备份
                  mysqldump -h $DATABASE_HOST -u $DATABASE_USER -p$DATABASE_PASSWORD $DATABASE_NAME > /backup/${BACKUP_FILE}

                  # 压缩备份文件
                  gzip /backup/${BACKUP_FILE}

                  # 上传到对象存储
                  aws s3 cp /backup/${BACKUP_FILE}.gz s3://yyc3-ailp-backups/database/

                  # 清理本地文件
                  rm /backup/${BACKUP_FILE}.gz

                  # 清理7天前的备份
                  aws s3 ls s3://yyc3-ailp-backups/database/ | while read -r line; do
                    createDate=$(echo $line | awk '{print $1" "$2}')
                    createDate=$(date -d "$createDate" +%s)
                    olderThan=$(date -d "7 days ago" +%s)
                    if [[ $createDate -lt $olderThan ]]; then
                      fileName=$(echo $line | awk '{print $4}')
                      aws s3 rm s3://yyc3-ailp-backups/database/$fileName
                    fi
                  done
              env:
                - name: DATABASE_HOST
                  valueFrom:
                    secretKeyRef:
                      name: yyc3-ailp-secrets
                      key: database-host
                - name: DATABASE_USER
                  valueFrom:
                    secretKeyRef:
                      name: yyc3-ailp-secrets
                      key: database-user
                - name: DATABASE_PASSWORD
                  valueFrom:
                    secretKeyRef:
                      name: yyc3-ailp-secrets
                      key: database-password
                - name: DATABASE_NAME
                  valueFrom:
                    secretKeyRef:
                      name: yyc3-ailp-secrets
                      key: database-name
                - name: AWS_ACCESS_KEY_ID
                  valueFrom:
                    secretKeyRef:
                      name: yyc3-ailp-secrets
                      key: aws-access-key-id
                - name: AWS_SECRET_ACCESS_KEY
                  valueFrom:
                    secretKeyRef:
                      name: yyc3-ailp-secrets
                      key: aws-secret-access-key
              volumeMounts:
                - name: backup-storage
                  mountPath: /backup
          volumes:
            - name: backup-storage
              emptyDir: {}
          restartPolicy: OnFailure
```

### 8.2 恢复脚本

```bash
#!/bin/bash
# restore.sh - 数据库恢复脚本

set -euo pipefail

# 配置变量
BACKUP_FILE=${1:-}
DATABASE_HOST=${DATABASE_HOST:-"mysql.yyc3-ailp-database.svc.cluster.local"}
DATABASE_USER=${DATABASE_USER:-"yyc3ailp"}
DATABASE_NAME=${DATABASE_NAME:-"yyc3_ailp"}
AWS_S3_BUCKET=${AWS_S3_BUCKET:-"yyc3-ailp-backups"}

# 检查参数
if [ -z "$BACKUP_FILE" ]; then
  echo "错误: 请指定备份文件名"
  echo "用法: $0 <backup-file>"
  echo "示例: $0 yyc3-ailp-backup-20231201_020000.sql.gz"
  exit 1
fi

# 检查环境变量
if [ -z "$DATABASE_PASSWORD" ] || [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "错误: 请设置必要的环境变量"
  echo "需要设置: DATABASE_PASSWORD, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
  exit 1
fi

# 下载备份文件
echo "正在下载备份文件..."
aws s3 cp s3://$AWS_S3_BUCKET/database/$BACKUP_FILE ./

# 解压备份文件
echo "正在解压备份文件..."
gunzip $BACKUP_FILE
UNCOMPRESSED_FILE=${BACKUP_FILE%.gz}

# 确认恢复操作
echo "警告: 即将恢复数据库，这将覆盖现有数据"
read -p "确认继续? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "操作已取消"
  exit 0
fi

# 执行数据库恢复
echo "正在恢复数据库..."
mysql -h $DATABASE_HOST -u $DATABASE_USER -p$DATABASE_PASSWORD $DATABASE_NAME < $UNCOMPRESSED_FILE

# 清理临时文件
rm $UNCOMPRESSED_FILE

echo "数据库恢复完成"
```

## 9. 故障排除指南

### 9.1 常见问题与解决方案

#### 9.1.1 容器启动失败

```bash
# 查看Pod状态
kubectl get pods -n yyc3-ailp-prod -l app=yyc3-ailp-app

# 查看Pod详情
kubectl describe pod <pod-name> -n yyc3-ailp-prod

# 查看Pod日志
kubectl logs <pod-name> -n yyc3-ailp-prod

# 进入容器调试
kubectl exec -it <pod-name> -n yyc3-ailp-prod -- /bin/sh
```

#### 9.1.2 应用无响应

```bash
# 检查服务状态
kubectl get svc -n yyc3-ailp-prod

# 检查端点
kubectl get endpoints -n yyc3-ailp-prod

# 端口转发测试
kubectl port-forward svc/yyc3-ailp-app-service 8080:80 -n yyc3-ailp-prod

# 测试应用健康检查
curl http://localhost:8080/api/health
```

#### 9.1.3 资源使用过高

```bash
# 查看资源使用情况
kubectl top pods -n yyc3-ailp-prod

# 查看资源限制
kubectl describe pod <pod-name> -n yyc3-ailp-prod

# 调整资源限制
kubectl patch deployment yyc3-ailp-app -n yyc3-ailp-prod -p '{"spec":{"template":{"spec":{"containers":[{"name":"yyc3-ailp-app","resources":{"limits":{"memory":"2Gi","cpu":"1000m"},"requests":{"memory":"1Gi","cpu":"500m"}}}]}}}'
```

### 9.2 性能优化建议

1. **容器镜像优化**
   - 使用多阶段构建减少镜像大小
   - 选择合适的基础镜像
   - 利用镜像层缓存优化构建速度

2. **资源配置优化**
   - 根据实际使用情况调整CPU和内存限制
   - 配置合适的HPA策略实现自动扩缩容
   - 使用节点亲和性和反亲和性优化Pod调度

3. **网络优化**
   - 使用Ingress控制器实现负载均衡
   - 配置合适的网络策略
   - 优化服务发现机制

4. **存储优化**
   - 选择合适的存储类
   - 配置适当的存储容量
   - 实施数据备份和恢复策略

## 10. 部署检查清单

### 10.1 部署前检查

- [ ] 容器镜像已构建并推送到镜像仓库
- [ ] Kubernetes配置文件已更新
- [ ] 环境变量和密钥已配置
- [ ] 数据库迁移脚本已准备
- [ ] 回滚计划已确认
- [ ] 监控和告警规则已配置
- [ ] 备份策略已实施

### 10.2 部署后验证

- [ ] 所有Pod正常运行
- [ ] 服务端点可访问
- [ ] 健康检查通过
- [ ] 应用功能正常
- [ ] 性能指标正常
- [ ] 日志收集正常
- [ ] 监控告警正常

### 10.3 部署文档更新

- [ ] 更新部署版本信息
- [ ] 记录部署过程和结果
- [ ] 更新配置变更记录
- [ ] 归档部署相关文档

---

## 📄 文档标尾 (Footer)

> 「**_YanYuCloudCube_**」
> 「**_<admin@0379.email>_**」
> 「**_Words Initiate Quadrants, Language Serves as Core for the Future_**」
> 「**_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**」
> data:
> .dockerconfigjson: eyJhdXRocyI6eyJyZWdpc3RyeS5leGFtcGxlLmNvbSI6eyJ1c2VybmFtZSI6Inl5YzMiLCJwYXNzd29yZCI6InBhc3N3b3JkIiwiYXV0aCI6ImJYbGxZV1J2Y2s1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWFJ2Y2k1dmNHVnlZWF
