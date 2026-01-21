# GitHub Actions Secrets 配置指南

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***

## 📋 概述

本文档说明 YYC³ Learning Platform 项目在 GitHub Actions 中使用的 secrets 配置要求。这些配置需要在 GitHub 仓库的 Settings → Secrets and variables → Actions 中进行设置。

---

## 🔐 第三方服务集成令牌

### CODECOV_TOKEN

- **用途**: 上传代码覆盖率报告到 Codecov
- **配置位置**: `ci.yml` - 代码覆盖率报告步骤
- **获取方式**: 登录 Codecov 账户，在项目设置中获取 token

### SNYK_TOKEN

- **用途**: Snyk 安全漏洞扫描
- **配置位置**: `ci.yml` - 安全扫描步骤
- **获取方式**: 登录 Snyk 账户，在设置中获取 API token

### LHCI_GITHUB_APP_TOKEN

- **用途**: Lighthouse CI 性能测试
- **配置位置**: `ci.yml` - Lighthouse CI 步骤
- **获取方式**: 创建 GitHub App 并配置 Lighthouse CI

---

## 🚀 部署平台配置

### VERCEL_TOKEN

- **用途**: Vercel 平台部署
- **配置位置**: `ci.yml` - Vercel 部署步骤
- **获取方式**: Vercel 账户设置中获取 token

### ORG_ID / PROJECT_ID

- **用途**: 组织/项目标识
- **配置位置**: `ci.yml` - 部署配置
- **获取方式**: 部署平台的项目设置中获取

---

## ☁️ 云服务配置

### AWS 相关配置

- **AWS_ACCESS_KEY_ID**: AWS 访问密钥 ID
- **AWS_SECRET_ACCESS_KEY**: AWS 秘密访问密钥
- **AWS_REGION**: AWS 区域
- **AWS_S3_BUCKET**: S3 存储桶名称
- **用途**: AWS 云服务集成
- **配置位置**: `ci.yml` - AWS 部署步骤

### KUBE_CONFIG

- **用途**: Kubernetes 集群配置
- **配置位置**: `ci.yml` - Kubernetes 部署步骤
- **获取方式**: 从 Kubernetes 集群获取 kubeconfig 文件内容

---

## 🗄️ 数据库配置

### DB_PASSWORD

- **用途**: 数据库连接密码
- **配置位置**: `ci.yml` - 数据库相关步骤

### DB_HOST / DB_PORT / DB_USER / DB_NAME

- **用途**: 数据库连接配置
- **配置位置**: `ci.yml` - 数据库相关步骤

---

## 🔔 通知服务

### DINGTALK_WEBHOOK

- **用途**: 钉钉群机器人通知
- **配置位置**: `ci.yml` - 通知步骤
- **获取方式**: 钉钉群机器人设置中获取 webhook URL

### ALERT_WEBHOOK

- **用途**: 通用告警通知
- **配置位置**: `ci.yml` - 告警步骤

---

## 🌐 API 配置

### PRODUCTION_API_URL

- **用途**: 生产环境 API 地址
- **配置位置**: `ci.yml` - 生产环境构建

### PREVIEW_API_URL

- **用途**: 预览环境 API 地址
- **配置位置**: `ci.yml` - 预览环境构建

---

## 🔧 高可用性配置

### PRIMARY_KUBE_CONFIG / SECONDARY_KUBE_CONFIG

- **用途**: 主/备 Kubernetes 集群配置
- **配置位置**: `high-availability.yml` - 高可用部署

---

## ⚙️ 配置说明

### 配置步骤

1. 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 输入 Name（对应上述变量名）和 Value（对应的实际值）
4. 点击 "Add secret" 保存

### 安全建议

- 定期轮换敏感令牌（如 AWS 密钥、数据库密码等）
- 使用最小权限原则配置访问权限
- 避免在代码中硬编码敏感信息

---

## 📞 支持与反馈

如有配置问题，请联系：

- **技术支持**: <admin@0379.email>
- **问题反馈**: GitHub Issues

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
