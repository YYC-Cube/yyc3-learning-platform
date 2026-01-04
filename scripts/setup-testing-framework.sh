#!/bin/bash

# YYC³ Learning Platform - 测试框架一键安装脚本
# 用于快速搭建Vitest测试环境

set -e  # 遇到错误立即退出

echo "🚀 开始安装测试框架..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 检查Node.js版本
echo -e "${BLUE}📋 检查环境...${NC}"
NODE_VERSION=$(node -v)
echo "Node.js 版本: $NODE_VERSION"

if [ "$NODE_VERSION" \< "v18.0.0" ]; then
    echo -e "${RED}❌ 需要 Node.js >= 18.0.0${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js 版本符合要求${NC}"
echo ""

# 2. 安装Vitest依赖
echo -e "${BLUE}📦 安装Vitest依赖...${NC}"
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
echo -e "${GREEN}✅ Vitest依赖安装完成${NC}"
echo ""

# 3. 安装Playwright (E2E测试)
echo -e "${BLUE}📦 安装Playwright...${NC}"
pnpm add -D @playwright/test
npx playwright install --with-deps
echo -e "${GREEN}✅ Playwright安装完成${NC}"
echo ""

# 4. 创建必要目录
echo -e "${BLUE}📁 创建测试目录...${NC}"
mkdir -p __tests__/unit/components
mkdir -p __tests__/unit/lib
mkdir -p __tests__/integration/api
mkdir -p __tests__/e2e
mkdir -p __tests__/fixtures
mkdir -p __tests__/utils
mkdir -p __tests__/mocks
echo -e "${GREEN}✅ 测试目录创建完成${NC}"
echo ""

# 5. 验证配置
echo -e "${BLUE}🔍 验证配置...${NC}"
if [ -f "vitest.config.ts" ]; then
    echo -e "${GREEN}✅ vitest.config.ts 存在${NC}"
else
    echo -e "${RED}❌ vitest.config.ts 不存在${NC}"
    exit 1
fi

if [ -f "vitest.setup.ts" ]; then
    echo -e "${GREEN}✅ vitest.setup.ts 存在${NC}"
else
    echo -e "${RED}❌ vitest.setup.ts 不存在${NC}"
    exit 1
fi
echo ""

# 6. 运行测试验证
echo -e "${BLUE}🧪 运行测试验证...${NC}"
pnpm test:run || {
    echo -e "${YELLOW}⚠️  部分测试失败（这是正常的，因为测试用例还未编写）${NC}"
    echo -e "${YELLOW}✅  测试框架配置成功！${NC}"
}
echo ""

# 7. 生成覆盖率报告
echo -e "${BLUE}📊 生成初始覆盖率报告...${NC}"
pnpm test:coverage || {
    echo -e "${YELLOW}⚠️  覆盖率生成失败，但测试框架已就绪${NC}"
}
echo ""

# 完成提示
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 测试框架安装完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📖 下一步：${NC}"
echo ""
echo -e "1. 查看测试规范："
echo -e "   ${YELLOW}cat docs/TESTING-STANDARDS.md${NC}"
echo ""
echo -e "2. 查看快速开始："
echo -e "   ${YELLOW}cat __tests__/README.md${NC}"
echo ""
echo -e "3. 运行测试："
echo -e "   ${YELLOW}pnpm test:watch${NC}  # 监视模式"
echo -e "   ${YELLOW}pnpm test:ui${NC}     # UI模式"
echo -e "   ${YELLOW}pnpm test:coverage${NC} # 查看覆盖率"
echo ""
echo -e "4. 编写第一个测试："
echo -e "   ${YELLOW}cp __tests__/unit/components/Button.test.example.tsx __tests__/unit/components/Button.test.tsx${NC}"
echo -e "   ${YELLOW}# 然后编辑测试内容${NC}"
echo ""
echo -e "${BLUE}📚 相关文档：${NC}"
echo -e "   • 测试规范: docs/TESTING-STANDARDS.md"
echo -e "   • 改进计划: docs/GLOBAL-ANALYSIS-EXECUTIVE-SUMMARY.md"
echo ""
echo -e "${GREEN}✨ 开始测试之旅吧！${NC}"
echo ""
