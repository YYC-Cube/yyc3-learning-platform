#!/bin/bash
# YYC³ Learning Platform - Performance Reporting Script
# Generates performance reports from historical data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PERFORMANCE_DIR=".github/performance-data"
OUTPUT_DIR="performance-reports"

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

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Generate performance summary
generate_summary() {
    print_info "Generating performance summary..."

    if [ ! -d "$PERFORMANCE_DIR" ] || [ -z "$(ls -A $PERFORMANCE_DIR)" ]; then
        print_warning "No performance data found"
        return
    fi

    echo "## Performance Summary Report" > "$OUTPUT_DIR/summary.md"
    echo "Generated: $(date)" >> "$OUTPUT_DIR/summary.md"
    echo "" >> "$OUTPUT_DIR/summary.md"

    # Get latest metrics
    LATEST_FILE=$(ls -t "$PERFORMANCE_DIR"/*.json 2>/dev/null | head -1)

    if [ -n "$LATEST_FILE" ]; then
        echo "### Latest Performance Metrics" >> "$OUTPUT_DIR/summary.md"
        echo "" >> "$OUTPUT_DIR/summary.md"
        cat "$LATEST_FILE" | jq -r '
            "#### Date: \(.timestamp)",
            "",
            "| Endpoint | P50 (ms) | P95 (ms) | P99 (ms) |",
            "|----------|----------|----------|----------|",
            "| Health Check | \(.metrics.health_p50 // "N/A") | \(.metrics.health_p95 // "N/A") | \(.metrics.health_p99 // "N/A") |",
            "| Courses List | \(.metrics.courses_p50 // "N/A") | \(.metrics.courses_p95 // "N/A") | \(.metrics.courses_p99 // "N/A") |"
        ' >> "$OUTPUT_DIR/summary.md"
    fi

    print_success "Summary report generated: $OUTPUT_DIR/summary.md"
}

# Compare performance over time
compare_periods() {
    print_info "Comparing performance over time..."

    local DAYS=${1:-7}
    local CUTOFF_DATE=$(date -v-${DAYS}d +%Y-%m-%d 2>/dev/null || date -d "-${DAYS} days" +%Y-%m-%d)

    echo "## Performance Comparison (Last $DAYS Days)" > "$OUTPUT_DIR/comparison.md"
    echo "Generated: $(date)" >> "$OUTPUT_DIR/comparison.md"
    echo "" >> "$OUTPUT_DIR/comparison.md"

    # Filter files within date range
    local FILES=$(find "$PERFORMANCE_DIR" -name "*.json" -newermt "$CUTOFF_DATE" 2>/dev/null | sort)

    if [ -z "$FILES" ]; then
        print_warning "No performance data found for the last $DAYS days"
        return
    fi

    echo "### Performance Trend" >> "$OUTPUT_DIR/comparison.md"
    echo "" >> "$OUTPUT_DIR/comparison.md"
    echo "| Date | Health P95 | Courses P95 | Change |" >> "$OUTPUT_DIR/comparison.md"
    echo "|------|------------|-------------|--------|" >> "$OUTPUT_DIR/comparison.md"

    local PREV_P95=0
    for FILE in $FILES; do
        local DATE=$(jq -r '.timestamp' "$FILE" | cut -d'T' -f1)
        local HEALTH_P95=$(jq -r '.metrics.health_p95 // "N/A"' "$FILE")
        local COURSES_P95=$(jq -r '.metrics.courses_p95 // "N/A"' "$FILE")

        local CHANGE=""
        if [ "$PREV_P95" != "0" ] && [ "$HEALTH_P95" != "N/A" ]; then
            local DIFF=$((HEALTH_P95 - PREV_P95))
            if [ $DIFF -lt 0 ]; then
                CHANGE="🟢 ${DIFF}ms"
            elif [ $DIFF -gt 0 ]; then
                CHANGE="🔴 +${DIFF}ms"
            else
                CHANGE="⚪ 0ms"
            fi
        fi

        echo "| $DATE | $HEALTH_P95 | $COURSES_P95 | $CHANGE |" >> "$OUTPUT_DIR/comparison.md"
        PREV_P95=$HEALTH_P95
    done

    print_success "Comparison report generated: $OUTPUT_DIR/comparison.md"
}

# Detect performance anomalies
detect_anomalies() {
    print_info "Detecting performance anomalies..."

    echo "## Performance Anomaly Detection" > "$OUTPUT_DIR/anomalies.md"
    echo "Generated: $(date)" >> "$OUTPUT_DIR/anomalies.md"
    echo "" >> "$OUTPUT_DIR/anomalies.md"

    local FILES=($(ls -t "$PERFORMANCE_DIR"/*.json 2>/dev/null))
    local ANOMALIES_FOUND=false

    if [ ${#FILES[@]} -lt 2 ]; then
        print_warning "Insufficient data for anomaly detection"
        return
    fi

    # Compare last 10 runs
    local RECENT_FILES=("${FILES[@]:0:10}")

    for FILE in "${RECENT_FILES[@]}"; do
        local P95=$(jq -r '.metrics.health_p95 // 0' "$FILE")

        # Check if P95 exceeds threshold (e.g., 2x average)
        if [ "$P95" -gt 200 ]; then
            echo "⚠️ **High latency detected**" >> "$OUTPUT_DIR/anomalies.md"
            echo "- File: $(basename "$FILE")" >> "$OUTPUT_DIR/anomalies.md"
            echo "- Health P95: ${P95}ms (threshold: 200ms)" >> "$OUTPUT_DIR/anomalies.md"
            echo "" >> "$OUTPUT_DIR/anomalies.md"
            ANOMALIES_FOUND=true
        fi
    done

    if [ "$ANOMALIES_FOUND" = false ]; then
        echo "✅ No performance anomalies detected" >> "$OUTPUT_DIR/anomalies.md"
    fi

    print_success "Anomaly detection report generated: $OUTPUT_DIR/anomalies.md"
}

# Generate performance scorecard
generate_scorecard() {
    print_info "Generating performance scorecard..."

    echo "## Performance Scorecard" > "$OUTPUT_DIR/scorecard.md"
    echo "Generated: $(date)" >> "$OUTPUT_DIR/scorecard.md"
    echo "" >> "$OUTPUT_DIR/scorecard.md"

    local LATEST_FILE=$(ls -t "$PERFORMANCE_DIR"/*.json 2>/dev/null | head -1)

    if [ -z "$LATEST_FILE" ]; then
        print_warning "No recent performance data available"
        return
    fi

    echo "### Overall Performance Grade" >> "$OUTPUT_DIR/scorecard.md"
    echo "" >> "$OUTPUT_DIR/scorecard.md"

    local HEALTH_P95=$(jq -r '.metrics.health_p95 // 0' "$LATEST_FILE")
    local COURSES_P95=$(jq -r '.metrics.courses_p95 // 0' "$LATEST_FILE")

    # Calculate performance score
    local SCORE=100
    local GRADE="A"

    if [ "$HEALTH_P95" -gt 100 ]; then
        SCORE=$((SCORE - 10))
    fi
    if [ "$HEALTH_P95" -gt 200 ]; then
        SCORE=$((SCORE - 20))
    fi
    if [ "$COURSES_P95" -gt 500 ]; then
        SCORE=$((SCORE - 10))
    fi
    if [ "$COURSES_P95" -gt 1000 ]; then
        SCORE=$((SCORE - 20))
    fi

    # Assign grade
    if [ $SCORE -ge 90 ]; then
        GRADE="A"
    elif [ $SCORE -ge 80 ]; then
        GRADE="B"
    elif [ $SCORE -ge 70 ]; then
        GRADE="C"
    else
        GRADE="D"
    fi

    echo "#### Grade: $GRADE (Score: $SCORE/100)" >> "$OUTPUT_DIR/scorecard.md"
    echo "" >> "$OUTPUT_DIR/scorecard.md"
    echo "### Performance Metrics" >> "$OUTPUT_DIR/scorecard.md"
    echo "" >> "$OUTPUT_DIR/scorecard.md"
    echo "| Metric | Value | Status |" >> "$OUTPUT_DIR/scorecard.md"
    echo "|--------|-------|--------|" >> "$OUTPUT_DIR/scorecard.md"

    # Health check status
    local HEALTH_STATUS="✅ Excellent"
    if [ "$HEALTH_P95" -gt 100 ]; then
        HEALTH_STATUS="⚠️ Good"
    fi
    if [ "$HEALTH_P95" -gt 200 ]; then
        HEALTH_STATUS="❌ Needs Improvement"
    fi
    echo "| Health Check P95 | ${HEALTH_P95}ms | $HEALTH_STATUS |" >> "$OUTPUT_DIR/scorecard.md"

    # Courses status
    local COURSES_STATUS="✅ Excellent"
    if [ "$COURSES_P95" -gt 500 ]; then
        COURSES_STATUS="⚠️ Good"
    fi
    if [ "$COURSES_P95" -gt 1000 ]; then
        COURSES_STATUS="❌ Needs Improvement"
    fi
    echo "| Courses List P95 | ${COURSES_P95}ms | $COURSES_STATUS |" >> "$OUTPUT_DIR/scorecard.md"

    print_success "Scorecard generated: $OUTPUT_DIR/scorecard.md"
}

# Display help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --summary           Generate performance summary"
    echo "  --compare [DAYS]    Compare performance over last N days (default: 7)"
    echo "  --anomalies         Detect performance anomalies"
    echo "  --scorecard         Generate performance scorecard"
    echo "  --all               Generate all reports"
    echo "  --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --summary"
    echo "  $0 --compare 30"
    echo "  $0 --all"
}

# Main execution
main() {
    echo "=========================================="
    echo "📊 YYC³ Performance Reporting Tool"
    echo "=========================================="
    echo ""

    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi

    while [[ $# -gt 0 ]]; do
        case $1 in
            --summary)
                generate_summary
                shift
                ;;
            --compare)
                if [[ $2 =~ ^[0-9]+$ ]]; then
                    compare_periods "$2"
                    shift 2
                else
                    compare_periods 7
                    shift
                fi
                ;;
            --anomalies)
                detect_anomalies
                shift
                ;;
            --scorecard)
                generate_scorecard
                shift
                ;;
            --all)
                generate_summary
                compare_periods 7
                detect_anomalies
                generate_scorecard
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    echo ""
    echo "=========================================="
    echo "✅ Performance reporting completed!"
    echo "=========================================="
    echo ""
    echo "📁 Reports saved to: $OUTPUT_DIR"
    echo ""
    echo "Generated reports:"
    ls -1 "$OUTPUT_DIR"/*.md 2>/dev/null | while read -r report; do
        echo "  📄 $(basename "$report")"
    done
    echo ""
}

# Run main function
main "$@"
