# 快速开始指南

## 1. 验证环境

```bash
# 检查 Docker
docker --version

# 检查 Docker Compose
docker-compose --version

# 检查 Node.js
node --version

# 检查 pnpm
pnpm --version
```

## 2. 一键部署

```bash
cd /Users/yanyu/learning-platform
./scripts/deploy.sh
```

## 3. 验证服务

打开浏览器访问:

- <http://localhost:3000> - Web应用
- <http://localhost:4000/health> - API健康检查

## 4. 使用AI助手

1. 在任意页面，右下角会看到AI助手窗口
2. 点击输入框输入问题
3. 按Enter发送消息
4. 可以拖拽移动窗口位置
5. 使用 Ctrl+K 快捷键显示/隐藏

## 5. 常用命令

```bash
# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 清理并重启
docker-compose down -v && docker-compose up -d --build
```

## 故障排除

如遇到问题，请查看完整文档:
📖 docs/AI-SYSTEM-IMPLEMENTATION.md
