#!/bin/bash

# 智能AI系统集成测试脚本

echo "======================================"
echo "  YYC³ AI系统集成测试"
echo "======================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 测试计数
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_component() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    local test_name=$1
    local test_command=$2
    
    echo -n "测试 $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ 失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 测试文件是否存在
test_file_exists() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    local file_path=$1
    local description=$2
    
    echo -n "检查 $description... "
    
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✓ 存在${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ 缺失${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "=== 1. 检查核心文件 ==="
test_file_exists "/Users/yanyu/learning-platform/packages/autonomous-engine/src/core/AgenticCore.ts" "自主智能引擎"
test_file_exists "/Users/yanyu/learning-platform/components/intelligent-ai-widget/intelligent-ai-widget.tsx" "智能AI组件"
test_file_exists "/Users/yanyu/learning-platform/packages/tool-registry/src/ToolRegistry.ts" "工具注册系统"
test_file_exists "/Users/yanyu/learning-platform/packages/knowledge-base/src/VectorKnowledgeBase.ts" "向量知识库"
test_file_exists "/Users/yanyu/learning-platform/packages/learning-system/src/MetaLearningLayer.ts" "元学习层"
test_file_exists "/Users/yanyu/learning-platform/services/api-gateway/src/index.ts" "API网关"
echo ""

echo "=== 2. 检查配置文件 ==="
test_file_exists "/Users/yanyu/learning-platform/services/api-gateway/package.json" "API网关package.json"
test_file_exists "/Users/yanyu/learning-platform/services/api-gateway/Dockerfile" "API网关Dockerfile"
test_file_exists "/Users/yanyu/learning-platform/services/api-gateway/tsconfig.json" "API网关TypeScript配置"
test_file_exists "/Users/yanyu/learning-platform/scripts/deploy.sh" "部署脚本"
echo ""

echo "=== 3. 检查集成文件 ==="
test_file_exists "/Users/yanyu/learning-platform/app/providers/AIAssistantProvider.tsx" "AI助手Provider"
test_file_exists "/Users/yanyu/learning-platform/docs/AI-SYSTEM-IMPLEMENTATION.md" "实施文档"
test_file_exists "/Users/yanyu/learning-platform/QUICKSTART.md" "快速开始指南"
echo ""

echo "=== 4. 检查Next.js集成 ==="
if grep -q "AIAssistantProvider" "/Users/yanyu/learning-platform/app/layout.tsx"; then
    echo -e "检查 layout.tsx集成... ${GREEN}✓ 已集成${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "检查 layout.tsx集成... ${RED}✗ 未集成${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

echo "=== 5. 代码质量检查 ==="
test_component "TypeScript语法" "cd /Users/yanyu/learning-platform && npx tsc --noEmit --skipLibCheck 2>&1 | grep -q 'error' && exit 1 || exit 0"
echo ""

echo "======================================"
echo "  测试结果汇总"
echo "======================================"
echo ""
echo "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ 所有测试通过！系统就绪！${NC}"
    echo ""
    echo "可以通过以下方式启动系统:"
    echo "  1. 自动部署: ./scripts/deploy.sh"
    echo "  2. 开发模式: pnpm dev"
    echo "  3. 访问地址: http://localhost:3000"
    exit 0
else
    echo -e "${YELLOW}⚠ 部分测试失败，请检查上述错误${NC}"
    exit 1
fi
