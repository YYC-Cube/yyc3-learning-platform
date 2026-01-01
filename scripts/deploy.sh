#!/bin/bash

# YYC³ 智能AI系统部署脚本

set -e

echo "======================================"
echo "  YYC³ 智能AI系统 - 自动化部署"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查依赖
check_dependencies() {
    echo -e "${YELLOW}[1/7] 检查依赖...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: Docker 未安装${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}错误: Docker Compose 未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ 依赖检查通过${NC}"
}

# 环境配置
setup_environment() {
    echo -e "${YELLOW}[2/7] 配置环境...${NC}"
    
    if [ ! -f .env ]; then
        echo "创建 .env 文件..."
        cp .env.example .env
        echo -e "${GREEN}✓ 已创建 .env 文件，请根据需要修改配置${NC}"
    else
        echo -e "${GREEN}✓ .env 文件已存在${NC}"
    fi
}

# 安装依赖
install_dependencies() {
    echo -e "${YELLOW}[3/7] 安装项目依赖...${NC}"
    
    # 安装主项目依赖
    pnpm install
    
    # 安装 API 网关依赖
    cd services/api-gateway
    npm install
    cd ../..
    
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
}

# 构建项目
build_project() {
    echo -e "${YELLOW}[4/7] 构建项目...${NC}"
    
    # 构建 TypeScript packages
    echo "构建 autonomous-engine..."
    cd packages/autonomous-engine && npm run build 2>/dev/null || echo "跳过构建"
    cd ../..
    
    # 构建 API 网关
    echo "构建 api-gateway..."
    cd services/api-gateway && npm run build
    cd ../..
    
    # 构建 Next.js
    echo "构建 Next.js 应用..."
    pnpm build
    
    echo -e "${GREEN}✓ 项目构建完成${NC}"
}

# 启动 Docker 容器
start_docker() {
    echo -e "${YELLOW}[5/7] 启动 Docker 容器...${NC}"
    
    # 停止现有容器
    docker-compose down 2>/dev/null || true
    
    # 构建并启动
    docker-compose up -d --build
    
    echo -e "${GREEN}✓ Docker 容器已启动${NC}"
}

# 健康检查
health_check() {
    echo -e "${YELLOW}[6/7] 执行健康检查...${NC}"
    
    echo "等待服务启动..."
    sleep 10
    
    # 检查 AI Gateway
    if curl -f http://localhost:4000/health &> /dev/null; then
        echo -e "${GREEN}✓ AI Gateway 运行正常${NC}"
    else
        echo -e "${RED}✗ AI Gateway 启动失败${NC}"
    fi
    
    # 检查 Next.js
    if curl -f http://localhost:3000 &> /dev/null; then
        echo -e "${GREEN}✓ Next.js 应用运行正常${NC}"
    else
        echo -e "${YELLOW}⚠ Next.js 应用启动中...${NC}"
    fi
    
    # 检查 PostgreSQL
    if docker exec yyc3-postgres pg_isready -U yyc3_user &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL 运行正常${NC}"
    else
        echo -e "${RED}✗ PostgreSQL 启动失败${NC}"
    fi
    
    # 检查 Redis
    if docker exec yyc3-redis redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓ Redis 运行正常${NC}"
    else
        echo -e "${RED}✗ Redis 启动失败${NC}"
    fi
}

# 显示结果
show_results() {
    echo ""
    echo -e "${YELLOW}[7/7] 部署完成！${NC}"
    echo ""
    echo "======================================"
    echo -e "${GREEN}  服务访问地址  ${NC}"
    echo "======================================"
    echo ""
    echo "  🌐 Web 应用:        http://localhost:3000"
    echo "  🤖 AI Gateway:      http://localhost:4000"
    echo "  📚 API 文档:        http://localhost:4000/api-docs"
    echo "  💾 PostgreSQL:      localhost:5432"
    echo "  🔴 Redis:           localhost:6379"
    echo ""
    echo "======================================"
    echo -e "${GREEN}  常用命令  ${NC}"
    echo "======================================"
    echo ""
    echo "  查看日志:           docker-compose logs -f"
    echo "  停止服务:           docker-compose down"
    echo "  重启服务:           docker-compose restart"
    echo "  查看状态:           docker-compose ps"
    echo ""
    echo "======================================"
}

# 主函数
main() {
    check_dependencies
    setup_environment
    install_dependencies
    build_project
    start_docker
    health_check
    show_results
}

# 执行部署
main
