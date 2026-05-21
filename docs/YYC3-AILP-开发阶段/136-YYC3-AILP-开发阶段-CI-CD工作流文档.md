# 🔖 YYC³ (Header)

> **_YanYuCloudCube_**
> **标语**：言启象限 | 语枢未来
> **_Words Initiate Quadrants, Language Serves as Core for the Future_**
> **标语**：万象归元于云枢 | 深栈智启新纪元
> **_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**

---

# YYC³ AILP - CI/CD 工作流文档

## 📋 文档信息

| 属性         | 内容                                      |
| ------------ | ----------------------------------------- |
| **文档标题** | YYC³ AILP - CI/CD 工作流文档              |
| **文档版本** | v1.0.0                                    |
| **创建时间** | 2026-01-02                                |
| **最后更新** | 2026-01-02                                |
| **文档编号** | 136-YYC3-AILP-开发阶段-CI-CD工作流文档.md |
| **适用范围** | YYC³ AILP 项目的持续集成与持续部署流程    |
| **维护团队** | YYC³ 开发团队                             |

---

## 📄 目录

- [1. 概述](#1-概述)
- [2. 工作流架构](#2-工作流架构)
- [3. 环境配置](#3-环境配置)
- [4. 作业详解](#4-作业详解)
- [5. 部署流程](#5-部署流程)
- [6. 监控与告警](#6-监控与告警)
- [7. 维护指南](#7-维护指南)
- [8. 故障排查](#8-故障排查)

---

## 1. 概述

### 1.1 CI/CD 策略

YYC³ AILP 采用现代化的 CI/CD 策略，确保代码质量、安全性和部署可靠性：

- **持续集成 (CI)**：每次代码提交自动执行代码质量检查、测试和安全扫描
- **持续部署 (CD)**：通过蓝绿部署策略实现零停机部署
- **高可用性**：多环境支持、自动回滚、健康检查
- **安全优先**：全面的安全扫描、依赖审计、敏感信息检测

### 1.2 工作流触发条件

| 触发条件                  | 触发的作业                                 |
| ------------------------- | ------------------------------------------ |
| Pull Request 创建/更新    | 代码质量检查、单元测试、集成测试、安全扫描 |
| Push 到 main 分支         | 所有作业 + Docker 构建 + Kubernetes 部署   |
| Push 到其他分支           | 代码质量检查、单元测试                     |
| 手动触发                  | 性能测试、数据库备份、基础设施更新         |
| 定时触发（每天 UTC 2:00） | 数据库备份、依赖更新检查                   |

---

## 2. 工作流架构

### 2.1 工作流结构

```
.github/workflows/
└── ci.yml                    # 主 CI/CD 工作流文件
```

### 2.2 作业依赖关系

```mermaid
graph TD
    A[代码质量检查] --> B[单元测试]
    A --> C[集成测试]
    A --> D[安全扫描]
    B --> E[Docker 构建]
    C --> E
    D --> E
    E --> F[Kubernetes 部署]
    F --> G[健康检查]
    G --> H[清理旧版本]
```

### 2.3 环境变量

| 变量名                  | 说明                | 默认值          |
| ----------------------- | ------------------- | --------------- |
| `NODE_VERSION`          | Node.js 版本        | `18.x`          |
| `PNPM_VERSION`          | pnpm 版本           | `8.x`           |
| `REGISTRY`              | Docker 镜像仓库     | `ghcr.io`       |
| `IMAGE_NAME`            | Docker 镜像名称     | `yyc3-learning` |
| `KUBE_NAMESPACE`        | Kubernetes 命名空间 | `yyc3-learning` |
| `BACKUP_RETENTION_DAYS` | 数据库备份保留天数  | `30`            |

---

## 3. 环境配置

### 3.1 GitHub Secrets 配置

在 GitHub 仓库设置中配置以下 Secrets：

| Secret 名称                 | 说明                           | 获取方式            |
| --------------------------- | ------------------------------ | ------------------- | ------- |
| `GITHUB_TOKEN`              | GitHub 访问令牌                | GitHub 自动提供     |
| `KUBE_CONFIG`               | Kubernetes 配置（Base64 编码） | `cat ~/.kube/config | base64` |
| `CODECOV_TOKEN`             | Codecov 上传令牌               | Codecov 账户设置    |
| `SNYK_TOKEN`                | Snyk 安全扫描令牌              | Snyk 账户设置       |
| `SLACK_WEBHOOK_URL`         | Slack 通知 Webhook             | Slack 应用设置      |
| `DATABASE_BACKUP_S3_BUCKET` | 数据库备份 S3 存储桶           | AWS S3 设置         |
| `AWS_ACCESS_KEY_ID`         | AWS 访问密钥 ID                | AWS IAM 设置        |
| `AWS_SECRET_ACCESS_KEY`     | AWS 访问密钥                   | AWS IAM 设置        |

### 3.2 环境配置

#### Production 环境

```yaml
environment:
  name: production
  url: https://yyc3-learning.yyc3.0379.email
```

#### Preview 环境

```yaml
environment:
  name: preview
  url: https://preview.yyc3-learning.yyc3.0379.email
```

---

## 4. 作业详解

### 4.1 代码质量检查 (lint-and-format)

**目的**：确保代码符合团队规范和最佳实践

**执行步骤**：

1. **检出代码**

   ```yaml
   - name: 检出代码
     uses: actions/checkout@v4
   ```

2. **设置 Node.js**

   ```yaml
   - name: 设置 Node.js
     uses: actions/setup-node@v4
     with:
       node-version: ${{ env.NODE_VERSION }}
   ```

3. **安装 pnpm**

   ```yaml
   - name: 安装 pnpm
     uses: pnpm/action-setup@v2
     with:
       version: ${{ env.PNPM_VERSION }}
   ```

4. **安装依赖**

   ```yaml
   - name: 安装依赖
     run: pnpm install --frozen-lockfile
   ```

5. **TypeScript 类型检查**

   ```yaml
   - name: TypeScript 类型检查
     run: pnpm run type-check
   ```

6. **ESLint 代码检查**

   ```yaml
   - name: ESLint 代码检查
     run: pnpm run lint
   ```

7. **Prettier 格式检查**

   ```yaml
   - name: Prettier 格式检查
     run: pnpm run format:check
   ```

8. **Stylelint CSS 检查**
   ```yaml
   - name: Stylelint CSS 检查
     run: pnpm run lint:css
   ```

**通过条件**：所有检查步骤均通过，无错误和警告

---

### 4.2 单元测试 (unit-tests)

**目的**：验证代码单元的正确性

**执行步骤**：

1. **检出代码**

   ```yaml
   - name: 检出代码
     uses: actions/checkout@v4
   ```

2. **设置 Node.js**

   ```yaml
   - name: 设置 Node.js
     uses: actions/setup-node@v4
     with:
       node-version: ${{ env.NODE_VERSION }}
   ```

3. **安装依赖**

   ```yaml
   - name: 安装依赖
     run: pnpm install --frozen-lockfile
   ```

4. **运行单元测试**

   ```yaml
   - name: 运行单元测试
     run: pnpm run test:unit
   ```

5. **生成测试覆盖率报告**

   ```yaml
   - name: 生成测试覆盖率报告
     run: pnpm run test:coverage
   ```

6. **上传覆盖率报告到 Codecov**
   ```yaml
   - name: 上传覆盖率报告到 Codecov
     uses: codecov/codecov-action@v3
     with:
       token: ${{ secrets.CODECOV_TOKEN }}
       files: ./coverage/coverage-final.json
       flags: unittests
       name: codecov-umbrella
   ```

**通过条件**：所有测试通过，测试覆盖率不低于 80%

---

### 4.3 集成测试 (integration-tests)

**目的**：验证系统各组件之间的集成

**执行步骤**：

1. **检出代码**

   ```yaml
   - name: 检出代码
     uses: actions/checkout@v4
   ```

2. **启动测试环境**

   ```yaml
   - name: 启动测试环境
     run: docker-compose -f docker-compose.test.yml up -d
   ```

3. **等待服务就绪**

   ```yaml
   - name: 等待服务就绪
     run: |
       timeout 120 bash -c 'until curl -f http://localhost:3000/health; do sleep 2; done'
   ```

4. **运行集成测试**

   ```yaml
   - name: 运行集成测试
     run: pnpm run test:integration
     env:
       DATABASE_URL: postgresql://test:test@localhost:5432/test
       REDIS_URL: redis://localhost:6379
   ```

5. **上传测试结果**

   ```yaml
   - name: 上传测试结果
     uses: actions/upload-artifact@v3
     with:
       name: integration-test-results
       path: test-results/
   ```

6. **清理测试环境**
   ```yaml
   - name: 清理测试环境
     if: always()
     run: docker-compose -f docker-compose.test.yml down -v
   ```

**通过条件**：所有集成测试通过

---

### 4.4 安全扫描 (security-scan)

**目的**：检测代码和依赖中的安全漏洞

**执行步骤**：

1. **检出代码**

   ```yaml
   - name: 检出代码
     uses: actions/checkout@v4
   ```

2. **Trivy 容器镜像扫描**

   ```yaml
   - name: Trivy 容器镜像扫描
     uses: aquasecurity/trivy-action@master
     with:
       image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
       format: 'sarif'
       output: 'trivy-results.sarif'
   ```

3. **上传 Trivy 扫描结果**

   ```yaml
   - name: 上传 Trivy 扫描结果
     uses: github/codeql-action/upload-sarif@v2
     with:
       sarif_file: 'trivy-results.sarif'
   ```

4. **Snyk 安全扫描**

   ```yaml
   - name: Snyk 安全扫描
     uses: snyk/actions/node@master
     env:
       SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
     with:
       args: --severity-threshold=high
   ```

5. **依赖审计**

   ```yaml
   - name: 依赖审计
     run: pnpm audit --audit-level=moderate
   ```

6. **敏感信息检测**
   ```yaml
   - name: 敏感信息检测
     uses: trufflesecurity/trufflehog@main
     with:
       path: ./
       base: ${{ github.event.repository.default_branch }}
       head: HEAD
   ```

**通过条件**：无高危安全漏洞，依赖审计通过

---

### 4.5 Docker 镜像构建和推送 (docker-build-push)

**目的**：构建并推送 Docker 镜像到容器仓库

**执行步骤**：

1. **检出代码**

   ```yaml
   - name: 检出代码
     uses: actions/checkout@v4
   ```

2. **设置 Docker Buildx**

   ```yaml
   - name: 设置 Docker Buildx
     uses: docker/setup-buildx-action@v3
   ```

3. **登录到 GitHub Container Registry**

   ```yaml
   - name: 登录到 GitHub Container Registry
     uses: docker/login-action@v3
     with:
       registry: ${{ env.REGISTRY }}
       username: ${{ github.actor }}
       password: ${{ secrets.GITHUB_TOKEN }}
   ```

4. **提取 Docker 元数据**

   ```yaml
   - name: 提取 Docker 元数据
     id: meta
     uses: docker/metadata-action@v5
     with:
       images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
       tags: |
         type=ref,event=branch
         type=ref,event=pr
         type=semver,pattern={{version}}
         type=semver,pattern={{major}}.{{minor}}
         type=sha,prefix={{branch}}-
   ```

5. **构建并推送 Docker 镜像**

   ```yaml
   - name: 构建并推送 Docker 镜像
     id: build
     uses: docker/build-push-action@v5
     with:
       context: .
       push: true
       tags: ${{ steps.meta.outputs.tags }}
       labels: ${{ steps.meta.outputs.labels }}
       cache-from: type=gha
       cache-to: type=gha,mode=max
       platforms: linux/amd64,linux/arm64
       build-args: |
         BUILD_DATE=${{ github.event.repository.updated_at }}
         VCS_REF=${{ github.sha }}
   ```

6. **生成镜像清单**
   ```yaml
   - name: 生成镜像清单
     run: |
       echo "镜像标签: ${{ steps.meta.outputs.tags }}"
       echo "镜像摘要: ${{ steps.build.outputs.digest }}"
   ```

**通过条件**：镜像构建成功，推送到仓库

---

### 4.6 Kubernetes 蓝绿部署 (kubernetes-deploy)

**目的**：使用蓝绿部署策略实现零停机部署

**执行步骤**：

1. **检出代码**

   ```yaml
   - name: 检出代码
     uses: actions/checkout@v4
   ```

2. **设置 kubectl**

   ```yaml
   - name: 设置 kubectl
     uses: azure/setup-kubectl@v3
   ```

3. **配置 kubeconfig**

   ```yaml
   - name: 配置 kubeconfig
     run: |
       mkdir -p $HOME/.kube
       echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > $HOME/.kube/config
       chmod 600 $HOME/.kube/config
   ```

4. **蓝绿部署 - 创建新版本**

   ```yaml
   - name: 蓝绿部署 - 创建新版本
     run: |
       CURRENT_COLOR=$(kubectl get deployment yyc3-learning -n yyc3-learning -o jsonpath='{.spec.template.metadata.labels.color}' 2>/dev/null || echo "blue")
       NEW_COLOR=$([ "$CURRENT_COLOR" = "blue" ] && echo "green" || echo "blue")
       sed -i "s|COLOR|$NEW_COLOR|g" k8s/deployment.yaml
       kubectl apply -f k8s/deployment.yaml -n yyc3-learning
   ```

5. **等待新版本就绪**

   ```yaml
   - name: 等待新版本就绪
     run: |
       kubectl rollout status deployment/yyc3-learning -n yyc3-learning --timeout=5m
   ```

6. **切换流量到新版本**

   ```yaml
   - name: 切换流量到新版本
     run: |
       kubectl patch service yyc3-learning -n yyc3-learning -p '{"spec":{"selector":{"color":"'$NEW_COLOR'"}}}'
   ```

7. **健康检查**

   ```yaml
   - name: 健康检查
     run: |
       sleep 10
       curl -f https://yyc3-learning.yyc3.0379.email/health || exit 1
   ```

8. **清理旧版本**
   ```yaml
   - name: 清理旧版本
     run: |
       OLD_COLOR=$([ "$NEW_COLOR" = "blue" ] && echo "green" || echo "blue")
       kubectl scale deployment yyc3-learning -n yyc3-learning --replicas=0 || true
   ```

**通过条件**：新版本成功部署，健康检查通过

---

### 4.7 数据库备份 (database-backup)

**目的**：定期备份数据库到 S3 存储

**执行步骤**：

1. **检出代码**

   ```yaml
   - name: 检出代码
     uses: actions/checkout@v4
   ```

2. **配置 AWS 凭证**

   ```yaml
   - name: 配置 AWS 凭证
     uses: aws-actions/configure-aws-credentials@v2
     with:
       aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
       aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
       aws-region: us-east-1
   ```

3. **执行数据库备份**

   ```yaml
   - name: 执行数据库备份
     run: |
       TIMESTAMP=$(date +%Y%m%d_%H%M%S)
       BACKUP_FILE="backup_${TIMESTAMP}.sql.gz"
       kubectl exec -n yyc3-learning deployment/postgres -- pg_dump -U postgres yyc3_learning | gzip > $BACKUP_FILE
       aws s3 cp $BACKUP_FILE s3://${{ secrets.DATABASE_BACKUP_S3_BUCKET }}/backups/$BACKUP_FILE
   ```

4. **清理旧备份**
   ```yaml
   - name: 清理旧备份
     run: |
       aws s3 ls s3://${{ secrets.DATABASE_BACKUP_S3_BUCKET }}/backups/ | \
       awk '{print $2}' | \
       head -n -$BACKUP_RETENTION_DAYS | \
       xargs -I {} aws s3 rm s3://${{ secrets.DATABASE_BACKUP_S3_BUCKET }}/backups/{}
   ```

**通过条件**：备份成功上传到 S3

---

### 4.8 性能测试 (performance-test)

**目的**：验证应用性能指标

**执行步骤**：

1. **检出代码**

   ```yaml
   - name: 检出代码
     uses: actions/checkout@v4
   ```

2. **部署到测试环境**

   ```yaml
   - name: 部署到测试环境
     run: |
       kubectl apply -f k8s/deployment-test.yaml -n yyc3-learning-test
   ```

3. **运行 Lighthouse CI**

   ```yaml
   - name: 运行 Lighthouse CI
     uses: treosh/lighthouse-ci-action@v9
     with:
       urls: |
         https://test.yyc3-learning.yyc3.0379.email
       uploadArtifacts: true
       temporaryPublicStorage: true
   ```

4. **生成性能报告**

   ```yaml
   - name: 生成性能报告
     run: |
       pnpm run lighthouse:report
   ```

5. **上传性能报告**
   ```yaml
   - name: 上传性能报告
     uses: actions/upload-artifact@v3
     with:
       name: performance-report
       path: lighthouse-report/
   ```

**通过条件**：性能评分不低于 90 分

---

### 4.9 通知 (notification)

**目的**：发送部署状态通知

**执行步骤**：

1. **发送 Slack 通知**
   ```yaml
   - name: 发送 Slack 通知
     uses: slackapi/slack-github-action@v1
     with:
       payload: |
         {
           "text": "部署状态: ${{ job.status }}",
           "blocks": [
             {
               "type": "section",
               "text": {
                 "type": "mrkdwn",
                 "text": "*部署状态*: ${{ job.status }}\n*分支*: ${{ github.ref }}\n*提交*: ${{ github.sha }}"
               }
             }
           ]
         }
     env:
       SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
   ```

---

## 5. 部署流程

### 5.1 蓝绿部署策略

蓝绿部署通过维护两个相同的生产环境（蓝色和绿色）来实现零停机部署：

```
┌─────────────┐         ┌─────────────┐
│   蓝色环境   │  流量   │   绿色环境   │
│  (当前版本)  │ ──────> │  (新版本)    │
└─────────────┘         └─────────────┘
       │                       │
       └───────────┬───────────┘
                   │
            切换流量
```

**部署步骤**：

1. **准备新版本**
   - 在非活跃环境（绿色）部署新版本
   - 等待所有 Pod 就绪

2. **健康检查**
   - 验证新版本的健康状态
   - 执行冒烟测试

3. **切换流量**
   - 更新 Service selector 指向新版本
   - 监控新版本运行状态

4. **清理旧版本**
   - 确认新版本稳定后
   - 缩容旧版本到 0 副本

### 5.2 回滚策略

**自动回滚条件**：

- 健康检查失败超过 3 次
- 错误率超过 5%
- 响应时间超过 2 秒

**手动回滚步骤**：

```bash
# 查看部署历史
kubectl rollout history deployment/yyc3-learning -n yyc3-learning

# 回滚到上一个版本
kubectl rollout undo deployment/yyc3-learning -n yyc3-learning

# 回滚到指定版本
kubectl rollout undo deployment/yyc3-learning -n yyc3-learning --to-revision=2
```

### 5.3 环境管理

| 环境       | 用途       | 触发条件          | URL                                           |
| ---------- | ---------- | ----------------- | --------------------------------------------- |
| Production | 生产环境   | Push 到 main 分支 | https://yyc3-learning.yyc3.0379.email         |
| Preview    | 预览环境   | Pull Request 创建 | https://preview.yyc3-learning.yyc3.0379.email |
| Staging    | 预发布环境 | 手动触发          | https://staging.yyc3-learning.yyc3.0379.email |

---

## 6. 监控与告警

### 6.1 监控指标

**应用指标**：

- **健康状态**：`/health` 端点响应
- **响应时间**：P50, P95, P99 延迟
- **错误率**：HTTP 4xx, 5xx 错误率
- **吞吐量**：每秒请求数 (RPS)
- **资源使用**：CPU、内存、磁盘使用率

**基础设施指标**：

- **Pod 状态**：运行中、就绪、重启次数
- **节点状态**：CPU、内存、磁盘使用率
- **网络指标**：入站/出站流量、连接数
- **存储指标**：PVC 使用率、IOPS

### 6.2 告警规则

| 告警名称         | 条件                          | 严重级别 | 通知方式          |
| ---------------- | ----------------------------- | -------- | ----------------- |
| 应用健康检查失败 | 连续 3 次失败                 | Critical | Slack + PagerDuty |
| 错误率过高       | 5xx 错误率 > 5%               | High     | Slack             |
| 响应时间过长     | P95 响应时间 > 2s             | High     | Slack             |
| Pod 重启次数过多 | 5 分钟内重启 > 3 次           | Medium   | Slack             |
| 资源使用率过高   | CPU/内存使用率 > 80%          | Medium   | Slack             |
| 磁盘空间不足     | 磁盘使用率 > 85%              | Warning  | Slack             |
| 数据库连接池耗尽 | 活跃连接数 > 最大连接数的 90% | High     | Slack + PagerDuty |

### 6.3 日志管理

**日志收集**：

```yaml
# Fluentd 配置
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: yyc3-learning
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      read_from_head true
      <parse>
        @type json
        time_format %Y-%m-%dT%H:%M:%S.%NZ
      </parse>
    </source>

    <match **>
      @type elasticsearch
      host elasticsearch.logging
      port 9200
      logstash_format true
      logstash_prefix yyc3-learning
      <buffer>
        @type file
        path /var/log/fluentd-buffers/kubernetes.system.buffer
        flush_mode interval
        flush_interval 5s
      </buffer>
    </match>
```

**日志查询示例**：

```bash
# 查询错误日志
kubectl logs -n yyc3-learning deployment/yyc3-learning --tail=100 | grep ERROR

# 查询特定时间段的日志
kubectl logs -n yyc3-learning deployment/yyc3-learning --since-time=2026-01-02T00:00:00Z

# 查询所有 Pod 的日志
kubectl logs -n yyc3-learning -l app=yyc3-learning --all-containers=true
```

---

## 7. 维护指南

### 7.1 日常维护任务

**每日任务**：

- [ ] 检查 CI/CD 工作流执行状态
- [ ] 查看告警通知
- [ ] 验证应用健康状态
- [ ] 检查日志中的错误和警告

**每周任务**：

- [ ] 审查安全扫描结果
- [ ] 检查依赖更新
- [ ] 分析性能趋势
- [ ] 清理旧备份和日志

**每月任务**：

- [ ] 审查和优化 CI/CD 流程
- [ ] 更新依赖版本
- [ ] 执行容量规划
- [ ] 审查和更新文档

### 7.2 依赖管理

**更新依赖**：

```bash
# 检查过时的依赖
pnpm outdated

# 更新所有依赖
pnpm update

# 更新特定依赖
pnpm update package-name

# 交互式更新
pnpm update -i
```

**安全更新**：

```bash
# 审计依赖
pnpm audit

# 自动修复安全漏洞
pnpm audit fix

# 强制修复（可能破坏性更改）
pnpm audit fix --force
```

### 7.3 配置管理

**更新环境变量**：

1. 修改 `.env.example` 文件
2. 更新 GitHub Secrets
3. 更新 Kubernetes ConfigMap/Secret
4. 重启相关服务

**更新 Kubernetes 配置**：

```bash
# 应用配置更改
kubectl apply -f k8s/configmap.yaml -n yyc3-learning
kubectl apply -f k8s/secret.yaml -n yyc3-learning

# 重启服务以应用新配置
kubectl rollout restart deployment/yyc3-learning -n yyc3-learning
```

### 7.4 备份与恢复

**数据库备份**：

```bash
# 手动备份
kubectl exec -n yyc3-learning deployment/postgres -- pg_dump -U postgres yyc3_learning | gzip > backup.sql.gz

# 从备份恢复
gunzip -c backup.sql.gz | kubectl exec -i -n yyc3-learning deployment/postgres -- psql -U postgres yyc3_learning
```

**配置备份**：

```bash
# 备份 Kubernetes 配置
kubectl get all,configmaps,secrets -n yyc3-learning -o yaml > k8s-backup.yaml

# 恢复 Kubernetes 配置
kubectl apply -f k8s-backup.yaml -n yyc3-learning
```

---

## 8. 故障排查

### 8.1 常见问题

#### 问题 1：CI/CD 工作流失败

**症状**：GitHub Actions 工作流执行失败

**排查步骤**：

1. 查看工作流日志

   ```bash
   # 在 GitHub Actions 页面查看详细日志
   ```

2. 检查依赖安装

   ```bash
   # 本地测试依赖安装
   pnpm install
   ```

3. 验证测试通过

   ```bash
   # 本地运行测试
   pnpm run test
   ```

4. 检查环境变量配置
   ```bash
   # 验证 GitHub Secrets 配置正确
   ```

#### 问题 2：Docker 镜像构建失败

**症状**：Docker 构建步骤失败

**排查步骤**：

1. 检查 Dockerfile 语法

   ```bash
   docker build -t test .
   ```

2. 验证依赖文件

   ```bash
   # 确保 package.json 和 pnpm-lock.yaml 存在
   ```

3. 检查构建缓存

   ```bash
   # 清理 Docker 缓存
   docker system prune -a
   ```

4. 验证镜像仓库访问
   ```bash
   # 测试登录到镜像仓库
   docker login ghcr.io
   ```

#### 问题 3：Kubernetes 部署失败

**症状**：Pod 无法启动或健康检查失败

**排查步骤**：

1. 查看 Pod 状态

   ```bash
   kubectl get pods -n yyc3-learning
   ```

2. 查看 Pod 日志

   ```bash
   kubectl logs -n yyc3-learning deployment/yyc3-learning
   ```

3. 查看 Pod 事件

   ```bash
   kubectl describe pod -n yyc3-learning <pod-name>
   ```

4. 检查资源限制
   ```bash
   # 验证 CPU 和内存限制是否合理
   kubectl describe deployment yyc3-learning -n yyc3-learning
   ```

#### 问题 4：健康检查失败

**症状**：健康检查端点返回错误

**排查步骤**：

1. 测试健康检查端点

   ```bash
   curl https://yyc3-learning.yyc3.0379.email/health
   ```

2. 检查应用日志

   ```bash
   kubectl logs -n yyc3-learning deployment/yyc3-learning --tail=100
   ```

3. 验证数据库连接

   ```bash
   kubectl exec -n yyc3-learning deployment/yyc3-learning -- env | grep DATABASE_URL
   ```

4. 检查依赖服务
   ```bash
   # 验证数据库、Redis 等依赖服务是否正常运行
   kubectl get pods -n yyc3-learning
   ```

### 8.2 调试技巧

**启用调试日志**：

```yaml
# 在 CI/CD 工作流中添加调试步骤
- name: 启用调试日志
  run: |
    echo "::debug::启用调试日志"
    set -x
```

**本地模拟 CI 环境**：

```bash
# 使用 act 本地运行 GitHub Actions
act push

# 运行特定作业
act -j lint-and-format
```

**查看 Kubernetes 资源**：

```bash
# 查看所有资源
kubectl get all -n yyc3-learning

# 查看 ConfigMap 和 Secret
kubectl get configmaps,secrets -n yyc3-learning

# 查看 Ingress
kubectl get ingress -n yyc3-learning
```

### 8.3 紧急恢复流程

**应用崩溃**：

1. 立即回滚到上一个稳定版本

   ```bash
   kubectl rollout undo deployment/yyc3-learning -n yyc3-learning
   ```

2. 检查日志和错误信息

   ```bash
   kubectl logs -n yyc3-learning deployment/yyc3-learning --previous
   ```

3. 通知相关团队
   - 发送 Slack 告警
   - 创建故障工单

4. 记录故障详情
   - 故障时间
   - 影响范围
   - 根本原因
   - 解决方案

**数据库故障**：

1. 切换到备用数据库

   ```bash
   # 更新数据库连接配置
   kubectl patch configmap yyc3-learning-config -n yyc3-learning --patch '{"data":{"DATABASE_URL":"postgresql://postgres:password@backup-db:5432/yyc3_learning"}}'
   ```

2. 重启应用

   ```bash
   kubectl rollout restart deployment/yyc3-learning -n yyc3-learning
   ```

3. 恢复主数据库
   ```bash
   # 从备份恢复主数据库
   gunzip -c backup.sql.gz | psql -U postgres -h primary-db yyc3_learning
   ```

---

## 📌 附录

### A. 参考资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Docker 官方文档](https://docs.docker.com/)
- [Kubernetes 文档](https://kubernetes.io/docs/)
- [Trivy 安全扫描](https://aquasecurity.github.io/trivy/)
- [Snyk 安全扫描](https://snyk.io/)

### B. 联系方式

- **技术支持**：<admin@0379.email>
- **GitHub Issues**：[https://github.com/YY-Nexus/yyc3-learning-platform/issues](https://github.com/YY-Nexus/yyc3-learning-platform/issues)
- **Slack 频道**：#yyc3-learning-platform

### C. 变更历史

| 版本  | 日期       | 作者      | 变更内容                        |
| ----- | ---------- | --------- | ------------------------------- |
| 1.0.0 | 2026-01-02 | YYC³ 团队 | 初始版本，创建 CI/CD 工作流文档 |

---

## 📄 文档标尾 (Footer)

> 「**_YanYuCloudCube_**」
> 「**_<admin@0379.email>_**」
> 「**_Words Initiate Quadrants, Language Serves as Core for the Future_**」
> 「**_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**」
