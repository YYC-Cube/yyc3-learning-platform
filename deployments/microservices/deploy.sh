#!/bin/bash

# ============================================================================
# YYC³ AI Platform - Enterprise Microservices Deployment Script
# Production-ready deployment automation
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
NAMESPACE="yyc3-platform"
ENVIRONMENT="${ENVIRONMENT:-production}"
REGION="${REGION:-us-west-2}"
CLUSTER_NAME="${CLUSTER_NAME:-yyc3-cluster}"

log_info "YYC³ AI Platform Microservices Deployment"
log_info "=============================================="
log_info "Script Directory: $SCRIPT_DIR"
log_info "Project Root: $PROJECT_ROOT"
log_info "Environment: $ENVIRONMENT"
log_info "Region: $REGION"
log_info "Namespace: $NAMESPACE"
echo

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    log_success "Docker is installed: $(docker --version)"

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    log_success "Docker Compose is installed: $(docker-compose --version)"

    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    log_success "kubectl is installed: $(kubectl version --client --short 2>/dev/null)"

    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        log_error "Helm is not installed"
        exit 1
    fi
    log_success "Helm is installed: $(helm version --short --template={{.Version}} 2>/dev/null)"

    log_success "All prerequisites are met"
    echo
}

# Function to validate environment variables
validate_environment() {
    log_info "Validating environment variables..."

    local required_vars=(
        "OPENAI_API_KEY"
        "ANTHROPIC_API_KEY"
        "GOOGLE_API_KEY"
    )

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
        log_success "$var is set"
    done

    log_success "Environment validation passed"
    echo
}

# Function to create namespace
create_namespace() {
    log_info "Creating Kubernetes namespace..."

    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_warning "Namespace $NAMESPACE already exists"
    else
        kubectl apply -f "$SCRIPT_DIR/kubernetes/namespace.yaml"
        log_success "Namespace $NAMESPACE created"
    fi
    echo
}

# Function to deploy infrastructure
deploy_infrastructure() {
    log_info "Deploying infrastructure services..."

    # Deploy ConfigMaps and Secrets
    kubectl apply -f "$SCRIPT_DIR/kubernetes/configmap.yaml"
    log_success "ConfigMaps deployed"

    # Deploy secrets (create from environment variables)
    kubectl create secret generic yyc3-secrets \
        --from-literal=openai-api-key="$OPENAI_API_KEY" \
        --from-literal=anthropic-api-key="$ANTHROPIC_API_KEY" \
        --from-literal=google-api-key="$GOOGLE_API_KEY" \
        --from-literal=jwt-secret="$JWT_SECRET" \
        --from-literal=session-secret="$SESSION_SECRET" \
        --from-literal=encryption-key="$ENCRYPTION_KEY" \
        --dry-run=client -o yaml | kubectl apply -f -
    log_success "Secrets deployed"

    # Deploy persistent volumes and storage classes
    if [[ "$ENVIRONMENT" == "production" ]]; then
        kubectl apply -f "$SCRIPT_DIR/kubernetes/storage/"
        log_success "Storage configuration deployed"
    fi

    log_success "Infrastructure deployment completed"
    echo
}

# Function to deploy databases
deploy_databases() {
    log_info "Deploying database services..."

    # MongoDB
    kubectl apply -f "$SCRIPT_DIR/kubernetes/databases/mongodb.yaml"
    log_success "MongoDB deployment started"

    # PostgreSQL
    kubectl apply -f "$SCRIPT_DIR/kubernetes/databases/postgresql.yaml"
    log_success "PostgreSQL deployment started"

    # Redis
    kubectl apply -f "$SCRIPT_DIR/kubernetes/databases/redis.yaml"
    log_success "Redis deployment started"

    # Neo4j
    kubectl apply -f "$SCRIPT_DIR/kubernetes/databases/neo4j.yaml"
    log_success "Neo4j deployment started"

    # InfluxDB
    kubectl apply -f "$SCRIPT_DIR/kubernetes/databases/influxdb.yaml"
    log_success "InfluxDB deployment started"

    # Wait for databases to be ready
    log_info "Waiting for databases to be ready..."
    kubectl wait --for=condition=ready pod -l app=mongodb -n "$NAMESPACE" --timeout=300s
    kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis -n "$NAMESPACE" --timeout=180s
    kubectl wait --for=condition=ready pod -l app=neo4j -n "$NAMESPACE" --timeout=300s
    kubectl wait --for=condition=ready pod -l app=influxdb -n "$NAMESPACE" --timeout=180s

    log_success "All databases are ready"
    echo
}

# Function to deploy message queue
deploy_message_queue() {
    log_info "Deploying message queue services..."

    # Zookeeper
    kubectl apply -f "$SCRIPT_DIR/kubernetes/message-queue/zookeeper.yaml"
    log_success "Zookeeper deployment started"

    # Kafka
    kubectl apply -f "$SCRIPT_DIR/kubernetes/message-queue/kafka.yaml"
    log_success "Kafka deployment started"

    # Wait for message queue to be ready
    log_info "Waiting for message queue to be ready..."
    kubectl wait --for=condition=ready pod -l app=zookeeper -n "$NAMESPACE" --timeout=180s
    kubectl wait --for=condition=ready pod -l app=kafka -n "$NAMESPACE" --timeout=300s

    log_success "Message queue is ready"
    echo
}

# Function to deploy monitoring
deploy_monitoring() {
    log_info "Deploying monitoring stack..."

    # Consul
    kubectl apply -f "$SCRIPT_DIR/kubernetes/monitoring/consul.yaml"
    log_success "Consul deployment started"

    # Prometheus
    kubectl apply -f "$SCRIPT_DIR/kubernetes/monitoring/prometheus.yaml"
    log_success "Prometheus deployment started"

    # Grafana
    kubectl apply -f "$SCRIPT_DIR/kubernetes/monitoring/grafana.yaml"
    log_success "Grafana deployment started"

    # Jaeger
    kubectl apply -f "$SCRIPT_DIR/kubernetes/monitoring/jaeger.yaml"
    log_success "Jaeger deployment started"

    # Elasticsearch and Kibana
    kubectl apply -f "$SCRIPT_DIR/kubernetes/monitoring/elasticsearch.yaml"
    kubectl apply -f "$SCRIPT_DIR/kubernetes/monitoring/kibana.yaml"
    log_success "Elasticsearch and Kibana deployment started"

    # Wait for monitoring stack to be ready
    log_info "Waiting for monitoring stack to be ready..."
    kubectl wait --for=condition=ready pod -l app=consul -n "$NAMESPACE" --timeout=180s
    kubectl wait --for=condition=ready pod -l app=prometheus -n "$NAMESPACE" --timeout=180s
    kubectl wait --for=condition=ready pod -l app=grafana -n "$NAMESPACE" --timeout=180s

    log_success "Monitoring stack is ready"
    echo
}

# Function to deploy AI/ML services
deploy_ml_services() {
    log_info "Deploying AI/ML services..."

    # TensorFlow Serving
    kubectl apply -f "$SCRIPT_DIR/kubernetes/ml/tensorflow-serving.yaml"
    log_success "TensorFlow Serving deployment started"

    # Wait for ML services to be ready
    log_info "Waiting for ML services to be ready..."
    kubectl wait --for=condition=ready pod -l app=tensorflow-serving -n "$NAMESPACE" --timeout=300s

    log_success "AI/ML services are ready"
    echo
}

# Function to deploy application services
deploy_application_services() {
    log_info "Deploying application services..."

    # Autonomous AI Engine
    kubectl apply -f "$SCRIPT_DIR/kubernetes/services/autonomous-engine.yaml"
    log_success "Autonomous AI Engine deployment started"

    # Model Adapter
    kubectl apply -f "$SCRIPT_DIR/kubernetes/services/model-adapter.yaml"
    log_success "Model Adapter deployment started"

    # Learning System
    kubectl apply -f "$SCRIPT_DIR/kubernetes/services/learning-system.yaml"
    log_success "Learning System deployment started"

    # Five Dimensional Management
    kubectl apply -f "$SCRIPT_DIR/kubernetes/services/five-dimensional-management.yaml"
    log_success "Five Dimensional Management deployment started"

    # Enterprise AI Widget
    kubectl apply -f "$SCRIPT_DIR/kubernetes/services/enterprise-ai-widget.yaml"
    log_success "Enterprise AI Widget deployment started"

    # API Gateway
    kubectl apply -f "$SCRIPT_DIR/kubernetes/services/api-gateway.yaml"
    log_success "API Gateway deployment started"

    # Wait for application services to be ready
    log_info "Waiting for application services to be ready..."
    kubectl wait --for=condition=available deployment/autonomous-engine -n "$NAMESPACE" --timeout=600s
    kubectl wait --for=condition=available deployment/model-adapter -n "$NAMESPACE" --timeout=600s
    kubectl wait --for=condition=available deployment/learning-system -n "$NAMESPACE" --timeout=600s
    kubectl wait --for=condition=available deployment/five-dimensional-management -n "$NAMESPACE" --timeout=600s
    kubectl wait --for=condition=available deployment/enterprise-ai-widget -n "$NAMESPACE" --timeout=600s
    kubectl wait --for=condition=available deployment/api-gateway -n "$NAMESPACE" --timeout=600s

    log_success "All application services are ready"
    echo
}

# Function to setup networking
setup_networking() {
    log_info "Setting up networking..."

    # Ingress
    kubectl apply -f "$SCRIPT_DIR/kubernetes/networking/ingress.yaml"
    log_success "Ingress configuration applied"

    # Load balancer services
    kubectl apply -f "$SCRIPT_DIR/kubernetes/networking/loadbalancer.yaml"
    log_success "Load balancer services applied"

    # Network policies
    kubectl apply -f "$SCRIPT_DIR/kubernetes/networking/network-policies.yaml"
    log_success "Network policies applied"

    log_success "Networking setup completed"
    echo
}

# Function to run health checks
run_health_checks() {
    log_info "Running health checks..."

    # Check all deployments
    local deployments=(
        "mongodb"
        "postgres"
        "redis"
        "neo4j"
        "influxdb"
        "kafka"
        "zookeeper"
        "consul"
        "prometheus"
        "grafana"
        "tensorflow-serving"
        "autonomous-engine"
        "model-adapter"
        "learning-system"
        "five-dimensional-management"
        "enterprise-ai-widget"
        "api-gateway"
    )

    for deployment in "${deployments[@]}"; do
        if kubectl get deployment "$deployment" -n "$NAMESPACE" &> /dev/null; then
            local status=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}')
            local replicas=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')

            if [[ "$status" == "$replicas" ]]; then
                log_success "$deployment: $status/$replicas replicas ready"
            else
                log_warning "$deployment: $status/$replicas replicas ready"
            fi
        else
            log_warning "$deployment: deployment not found"
        fi
    done

    log_success "Health checks completed"
    echo
}

# Function to display deployment information
display_deployment_info() {
    log_info "Deployment Information"
    log_info "======================="

    # Get cluster info
    log_info "Cluster: $CLUSTER_NAME"
    log_info "Region: $REGION"
    log_info "Namespace: $NAMESPACE"

    # Get external URLs
    log_info "External URLs:"
    log_info "  - API Gateway: https://api.yyc3.0379.email"
    log_info "  - Grafana: https://grafana.yyc3.0379.email"
    log_info "  - Kibana: https://kibana.yyc3.0379.email"
    log_info "  - Jaeger: https://jaeger.yyc3.0379.email"

    # Get internal service URLs
    log_info "Internal Service URLs:"
    kubectl get svc -n "$NAMESPACE" -o wide

    echo
    log_info "To check deployment status:"
    log_info "  kubectl get pods -n $NAMESPACE"
    log_info "  kubectl get services -n $NAMESPACE"
    log_info "  kubectl get ingress -n $NAMESPACE"

    echo
    log_info "To scale services:"
    log_info "  kubectl scale deployment autonomous-engine --replicas=3 -n $NAMESPACE"

    echo
    log_info "To view logs:"
    log_info "  kubectl logs -f deployment/autonomous-engine -n $NAMESPACE"

    echo
}

# Function to cleanup (optional)
cleanup() {
    if [[ "${CLEANUP:-false}" == "true" ]]; then
        log_info "Cleaning up deployment..."

        kubectl delete namespace "$NAMESPACE" --ignore-not-found=true

        # Remove Docker resources
        cd "$SCRIPT_DIR"
        docker-compose down -v --remove-orphans

        # Clean up unused Docker resources
        docker system prune -f

        log_success "Cleanup completed"
    fi
}

# Main deployment function
main() {
    log_info "Starting YYC³ AI Platform deployment..."
    echo

    # Check if cleanup is requested
    if [[ "${1:-}" == "cleanup" ]]; then
        CLEANUP=true
        cleanup
        exit 0
    fi

    # Execute deployment steps
    check_prerequisites
    validate_environment
    create_namespace
    deploy_infrastructure
    deploy_databases
    deploy_message_queue
    deploy_monitoring
    deploy_ml_services
    deploy_application_services
    setup_networking
    run_health_checks
    display_deployment_info

    log_success "🎉 YYC³ AI Platform deployment completed successfully!"
    log_info "The platform is now ready for use."
    echo
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Execute main function
main "$@"