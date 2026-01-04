#!/bin/bash

# YYC³ Learning Platform - Monitoring Stack Setup Script
# Sets up Prometheus, Grafana, and AlertManager using Docker Compose

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Setting up YYC³ Monitoring Stack...${NC}"
echo ""

# 1. Create necessary directories
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p monitoring/prometheus/alerts
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/alertmanager
echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# 2. Check if Docker is running
echo -e "${BLUE}🐋 Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# 3. Check if Docker Compose is available
echo -e "${BLUE}🐋 Checking Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker Compose is not installed. Please install Docker Compose and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose is available${NC}"
echo ""

# 4. Stop existing containers if running
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.monitoring.yml down 2>/dev/null || true
echo -e "${GREEN}✅ Existing containers stopped${NC}"
echo ""

# 5. Start monitoring stack
echo -e "${BLUE}🚀 Starting monitoring stack...${NC}"
docker-compose -f docker-compose.monitoring.yml up -d
echo -e "${GREEN}✅ Monitoring stack started${NC}"
echo ""

# 6. Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 10

# 7. Check service status
echo -e "${BLUE}🔍 Checking service status...${NC}"
docker-compose -f docker-compose.monitoring.yml ps
echo ""

# 8. Display access information
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Monitoring Stack Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Access URLs:${NC}"
echo ""
echo -e "  • Prometheus:  ${YELLOW}http://localhost:9090${NC}"
echo -e "  • Grafana:     ${YELLOW}http://localhost:3001${NC}"
echo -e "    - Username:  ${YELLOW}admin${NC}"
echo -e "    - Password:  ${YELLOW}admin${NC}"
echo -e "  • AlertManager: ${YELLOW}http://localhost:9093${NC}"
echo -e "  • Node Exporter: ${YELLOW}http://localhost:9100/metrics${NC}"
echo ""
echo -e "${BLUE}📖 Quick Commands:${NC}"
echo ""
echo -e "  View logs:"
echo -e "    ${YELLOW}docker-compose -f docker-compose.monitoring.yml logs -f${NC}"
echo ""
echo -e "  Stop monitoring:"
echo -e "    ${YELLOW}docker-compose -f docker-compose.monitoring.yml down${NC}"
echo ""
echo -e "  Restart services:"
echo -e "    ${YELLOW}docker-compose -f docker-compose.monitoring.yml restart${NC}"
echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo ""
echo -e "  1. Open Grafana: ${YELLOW}http://localhost:3001${NC}"
echo -e "  2. Login with admin/admin"
echo -e "  3. Explore the pre-configured dashboards"
echo -e "  4. Check Prometheus targets: ${YELLOW}http://localhost:9090/targets${NC}"
echo ""
echo -e "${GREEN}✨ Happy Monitoring!${NC}"
echo ""
