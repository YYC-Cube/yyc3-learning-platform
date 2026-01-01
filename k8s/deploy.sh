#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAMESPACE="yyc3-learning"

echo "=========================================="
echo "YYC³ Learning Platform - Kubernetes 部署脚本"
echo "=========================================="

check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo "❌ 错误: kubectl 未安装"
        echo "请访问 https://kubernetes.io/docs/tasks/tools/ 安装 kubectl"
        exit 1
    fi
    echo "✅ kubectl 已安装"
}

check_cluster() {
    if ! kubectl cluster-info &> /dev/null; then
        echo "❌ 错误: 无法连接到 Kubernetes 集群"
        exit 1
    fi
    echo "✅ Kubernetes 集群连接正常"
}

create_namespace() {
    echo ""
    echo "📦 创建命名空间..."
    kubectl apply -f "${SCRIPT_DIR}/namespace.yaml"
    echo "✅ 命名空间 ${NAMESPACE} 已创建"
}

create_secrets() {
    echo ""
    echo "🔐 创建密钥..."
    
    if [ ! -f "${SCRIPT_DIR}/secret.yaml" ]; then
        echo "❌ 错误: secret.yaml 文件不存在"
        exit 1
    fi
    
    kubectl apply -f "${SCRIPT_DIR}/secret.yaml"
    echo "✅ 密钥已创建"
    echo "⚠️  请确保已更新 secret.yaml 中的敏感信息"
}

create_configmaps() {
    echo ""
    echo "⚙️  创建配置映射..."
    kubectl apply -f "${SCRIPT_DIR}/configmap.yaml"
    echo "✅ 配置映射已创建"
}

create_serviceaccount() {
    echo ""
    echo "👤 创建服务账户..."
    kubectl apply -f "${SCRIPT_DIR}/serviceaccount.yaml"
    echo "✅ 服务账户已创建"
}

deploy_postgres() {
    echo ""
    echo "🐘 部署 PostgreSQL..."
    kubectl apply -f "${SCRIPT_DIR}/postgres.yaml"
    
    echo "⏳ 等待 PostgreSQL 就绪..."
    kubectl wait --for=condition=ready pod -l app=postgres -n ${NAMESPACE} --timeout=300s
    echo "✅ PostgreSQL 已就绪"
}

deploy_redis() {
    echo ""
    echo "🚀 部署 Redis..."
    kubectl apply -f "${SCRIPT_DIR}/redis.yaml"
    
    echo "⏳ 等待 Redis 就绪..."
    kubectl wait --for=condition=ready pod -l app=redis -n ${NAMESPACE} --timeout=300s
    echo "✅ Redis 已就绪"
}

deploy_application() {
    echo ""
    echo "🎯 部署应用..."
    kubectl apply -f "${SCRIPT_DIR}/deployment.yaml"
    
    echo "⏳ 等待应用就绪..."
    kubectl wait --for=condition=ready pod -l app=yyc3-learning -n ${NAMESPACE} --timeout=300s
    echo "✅ 应用已就绪"
}

create_services() {
    echo ""
    echo "🌐 创建服务..."
    kubectl apply -f "${SCRIPT_DIR}/service.yaml"
    echo "✅ 服务已创建"
}

create_ingress() {
    echo ""
    echo "🔗 创建 Ingress..."
    kubectl apply -f "${SCRIPT_DIR}/ingress.yaml"
    echo "✅ Ingress 已创建"
}

create_hpa() {
    echo ""
    echo "📈 创建水平 Pod 自动缩放..."
    kubectl apply -f "${SCRIPT_DIR}/hpa.yaml"
    echo "✅ HPA 已创建"
}

show_status() {
    echo ""
    echo "=========================================="
    echo "📊 部署状态"
    echo "=========================================="
    
    echo ""
    echo "📦 命名空间:"
    kubectl get namespace ${NAMESPACE}
    
    echo ""
    echo "👤 服务账户:"
    kubectl get serviceaccount -n ${NAMESPACE}
    
    echo ""
    echo "🔐 密钥:"
    kubectl get secrets -n ${NAMESPACE}
    
    echo ""
    echo "⚙️  配置映射:"
    kubectl get configmaps -n ${NAMESPACE}
    
    echo ""
    echo "🐘 PostgreSQL:"
    kubectl get pods -l app=postgres -n ${NAMESPACE}
    kubectl get pvc -n ${NAMESPACE} | grep postgres
    
    echo ""
    echo "🚀 Redis:"
    kubectl get pods -l app=redis -n ${NAMESPACE}
    kubectl get pvc -n ${NAMESPACE} | grep redis
    
    echo ""
    echo "🎯 应用:"
    kubectl get pods -l app=yyc3-learning -n ${NAMESPACE}
    kubectl get deployments -n ${NAMESPACE}
    
    echo ""
    echo "🌐 服务:"
    kubectl get services -n ${NAMESPACE}
    
    echo ""
    echo "🔗 Ingress:"
    kubectl get ingress -n ${NAMESPACE}
    
    echo ""
    echo "📈 HPA:"
    kubectl get hpa -n ${NAMESPACE}
}

show_logs() {
    echo ""
    echo "=========================================="
    echo "📝 应用日志 (最近 50 行)"
    echo "=========================================="
    kubectl logs -l app=yyc3-learning -n ${NAMESPACE} --tail=50 --all-containers=true
}

cleanup() {
    echo ""
    echo "=========================================="
    echo "🧹 清理部署"
    echo "=========================================="
    
    read -p "确定要删除所有资源吗？(yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "取消清理"
        exit 0
    fi
    
    echo ""
    echo "删除 Ingress..."
    kubectl delete -f "${SCRIPT_DIR}/ingress.yaml" --ignore-not-found=true
    
    echo "删除 HPA..."
    kubectl delete -f "${SCRIPT_DIR}/hpa.yaml" --ignore-not-found=true
    
    echo "删除应用..."
    kubectl delete -f "${SCRIPT_DIR}/deployment.yaml" --ignore-not-found=true
    
    echo "删除服务..."
    kubectl delete -f "${SCRIPT_DIR}/service.yaml" --ignore-not-found=true
    
    echo "删除 Redis..."
    kubectl delete -f "${SCRIPT_DIR}/redis.yaml" --ignore-not-found=true
    
    echo "删除 PostgreSQL..."
    kubectl delete -f "${SCRIPT_DIR}/postgres.yaml" --ignore-not-found=true
    
    echo "删除服务账户..."
    kubectl delete -f "${SCRIPT_DIR}/serviceaccount.yaml" --ignore-not-found=true
    
    echo "删除配置映射..."
    kubectl delete -f "${SCRIPT_DIR}/configmap.yaml" --ignore-not-found=true
    
    echo "删除密钥..."
    kubectl delete -f "${SCRIPT_DIR}/secret.yaml" --ignore-not-found=true
    
    echo "删除命名空间..."
    kubectl delete -f "${SCRIPT_DIR}/namespace.yaml" --ignore-not-found=true
    
    echo ""
    echo "✅ 清理完成"
}

main() {
    check_kubectl
    check_cluster
    
    case "${1:-deploy}" in
        deploy)
            create_namespace
            create_secrets
            create_configmaps
            create_serviceaccount
            deploy_postgres
            deploy_redis
            deploy_application
            create_services
            create_ingress
            create_hpa
            show_status
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        cleanup)
            cleanup
            ;;
        *)
            echo "用法: $0 {deploy|status|logs|cleanup}"
            echo ""
            echo "命令:"
            echo "  deploy   - 部署所有资源"
            echo "  status   - 显示部署状态"
            echo "  logs     - 显示应用日志"
            echo "  cleanup  - 清理所有资源"
            exit 1
            ;;
    esac
}

main "$@"
