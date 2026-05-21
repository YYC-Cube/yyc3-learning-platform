#!/bin/bash
# YYC³ Learning Platform - JMeter Load Testing Script
# Automated load testing for API endpoints

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
JMETER_VERSION="5.6.2"
JMETER_DIR="jmeter"
TEST_PLAN="jmeter/api-load-test.jmx"
RESULTS_DIR="jmeter-results"

# Default parameters
USERS=${USERS:-100}
DURATION=${DURATION:-300}
RAMP_UP=${RAMP_UP:-30}
BASE_URL=${BASE_URL:-"http://localhost:3200"}

# Functions
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if JMeter is installed
check_jmeter() {
    print_info "Checking JMeter installation..."

    if [ ! -d "$JMETER_DIR" ]; then
        print_warning "JMeter not found. Installing..."
        install_jmeter
    else
        print_success "JMeter already installed"
    fi
}

# Install JMeter
install_jmeter() {
    print_info "Installing Apache JMeter ${JMETER_VERSION}..."

    if command -v wget >/dev/null 2>&1; then
        wget -q "https://downloads.apache.org//jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz"
    elif command -v curl >/dev/null 2>&1; then
        curl -s -O "https://downloads.apache.org//jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz"
    else
        print_error "Neither wget nor curl is available"
        exit 1
    fi

    tar -xzf "apache-jmeter-${JMETER_VERSION}.tgz"
    mv "apache-jmeter-${JMETER_VERSION}" "$JMETER_DIR"
    rm -f "apache-jmeter-${JMETER_VERSION}.tgz"

    chmod +x "$JMETER_DIR/bin/jmeter"
    chmod +x "$JMETER_DIR/bin/jmeter-server"

    print_success "JMeter installed successfully"
}

# Create test plan
create_test_plan() {
    print_info "Creating JMeter test plan..."

    mkdir -p "$(dirname "$TEST_PLAN")"

    cat > "$TEST_PLAN" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="API Load Test">
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments">
        <collectionProp name="Arguments.arguments">
          <elementProp name="BASE_URL" elementType="Argument">
            <stringProp name="Argument.name">BASE_URL</stringProp>
            <stringProp name="Argument.value">${BASE_URL}</stringProp>
          </elementProp>
          <elementProp name="USERS" elementType="Argument">
            <stringProp name="Argument.name">USERS</stringProp>
            <stringProp name="Argument.value">${USERS}</stringProp>
          </elementProp>
          <elementProp name="DURATION" elementType="Argument">
            <stringProp name="Argument.name">DURATION</stringProp>
            <stringProp name="Argument.value">${DURATION}</stringProp>
          </elementProp>
          <elementProp name="RAMP_UP" elementType="Argument">
            <stringProp name="Argument.name">RAMP_UP</stringProp>
            <stringProp name="Argument.value">${RAMP_UP}</stringProp>
          </elementProp>
        </collectionProp>
      </elementProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="User Load">
        <stringProp name="ThreadGroup.num_threads">${USERS}</stringProp>
        <stringProp name="ThreadGroup.ramp_time">${RAMP_UP}</stringProp>
        <stringProp name="ThreadGroup.duration">${DURATION}</stringProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="Health Check">
          <stringProp name="HTTPSampler.domain">${BASE_URL}</stringProp>
          <stringProp name="HTTPSampler.path">/api/health</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
        </HTTPSamplerProxy>
        <hashTree/>
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="Get Courses">
          <stringProp name="HTTPSampler.domain">${BASE_URL}</stringProp>
          <stringProp name="HTTPSampler.path">/api/courses</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
        </HTTPSamplerProxy>
        <hashTree/>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
EOF

    print_success "Test plan created"
}

# Run load test
run_load_test() {
    print_info "Running JMeter load test..."

    # Create results directory
    mkdir -p "$RESULTS_DIR"

    # Run JMeter
    "$JMETER_DIR/bin/jmeter" -n -t "$TEST_PLAN" \
        -l "$RESULTS_DIR/results.jtl" \
        -e -o "$RESULTS_DIR/html-report" \
        -JBASE_URL="$BASE_URL" \
        -JUSERS="$USERS" \
        -JDURATION="$DURATION" \
        -JRAMP_UP="$RAMP_UP"

    print_success "Load test completed"
}

# Analyze results
analyze_results() {
    print_info "Analyzing load test results..."

    if [ -f "$RESULTS_DIR/results.jtl" ]; then
        total=$(grep -c '<httpSample' "$RESULTS_DIR/results.jtl" || echo "0")
        failed=$(grep -c 's="false"' "$RESULTS_DIR/results.jtl" || echo "0")
        success_rate=$(echo "scale=2; ($total - $failed) * 100 / $total" | bc)

        echo ""
        echo "📊 Load Test Results:"
        echo "  Total Requests: $total"
        echo "  Failed Requests: $failed"
        echo "  Success Rate: ${success_rate}%"
        echo ""

        # Extract response times
        if [ "$total" -gt 0 ]; then
            avg_time=$(grep -oP 't="\d+"' "$RESULTS_DIR/results.jtl" | awk -F'=' '{sum+=$2; count++} END {printf "%.0f", sum/count}')
            max_time=$(grep -oP 't="\d+"' "$RESULTS_DIR/results.jtl" | awk -F'=' '{print $2}' | sort -rn | head -1)
            min_time=$(grep -oP 't="\d+"' "$RESULTS_DIR/results.jtl" | awk -F'=' '{print $2}' | sort -n | head -1)

            echo "  Average Response Time: ${avg_time}ms"
            echo "  Max Response Time: ${max_time}ms"
            echo "  Min Response Time: ${min_time}ms"
        fi

        # Determine performance grade
        if (( $(echo "$avg_time < 1000" | bc -l) )) && (( $(echo "$success_rate > 99" | bc -l) )); then
            grade="A"
            status="Excellent"
        elif (( $(echo "$avg_time < 2000" | bc -l) )) && (( $(echo "$success_rate > 95" | bc -l) )); then
            grade="B"
            status="Good"
        elif (( $(echo "$avg_time < 5000" | bc -l) )) && (( $(echo "$success_rate > 90" | bc -l) )); then
            grade="C"
            status="Acceptable"
        else
            grade="D"
            status="Poor"
        fi

        echo ""
        echo "🏆 Performance Grade: $grade ($status)"

        # Check if performance is acceptable
        if [ "$grade" = "D" ]; then
            print_warning "Performance degradation detected!"
            print_warning "Consider optimization before deploying to production."
        else
            print_success "Performance is within acceptable limits."
        fi

    else
        print_error "No results found. Test may have failed."
    fi
}

# Clean up
cleanup() {
    print_info "Cleaning up temporary files..."
    # Keep results for analysis
    print_success "Cleanup completed"
}

# Main execution
main() {
    echo "=========================================="
    echo "🔥 YYC³ Learning Platform - Load Testing"
    echo "=========================================="
    echo ""

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --users)
                USERS="$2"
                shift 2
                ;;
            --duration)
                DURATION="$2"
                shift 2
                ;;
            --ramp-up)
                RAMP_UP="$2"
                shift 2
                ;;
            --url)
                BASE_URL="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --users N          Number of concurrent users (default: 100)"
                echo "  --duration N       Test duration in seconds (default: 300)"
                echo "  --ramp-up N       Ramp-up time in seconds (default: 30)"
                echo "  --url URL          Target URL for testing (default: http://localhost:3200)"
                echo "  --help             Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Display configuration
    echo "📋 Test Configuration:"
    echo "  Users: $USERS"
    echo "  Duration: ${DURATION}s"
    echo "  Ramp-up: ${RAMP_UP}s"
    echo "  Target URL: $BASE_URL"
    echo ""

    # Execute test steps
    check_jmeter
    create_test_plan
    run_load_test
    analyze_results
    cleanup

    echo ""
    echo "=========================================="
    echo "✅ Load testing completed!"
    echo "=========================================="
    echo ""
    echo "📁 Results saved to: $RESULTS_DIR"
    echo "📊 HTML Report: $RESULTS_DIR/html-report/index.html"
    echo ""
}

# Run main function
main "$@"
