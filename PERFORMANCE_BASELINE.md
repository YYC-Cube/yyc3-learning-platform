# API Performance Baseline System

## Overview

The YYC³ Learning Platform includes a comprehensive API performance baseline system designed to:
- Establish performance benchmarks for all API endpoints
- Detect performance regressions automatically
- Track performance trends over time
- Ensure consistent user experience across deployments

## Architecture

### Components

1. **Performance Baseline Tests** (`e2e/performance-baseline.spec.ts`)
   - Automated performance measurement for all API endpoints
   - Statistical analysis (P50, P95, P99 percentiles)
   - Regression detection with configurable thresholds

2. **GitHub Actions Workflow** (`.github/workflows/performance-baseline.yml`)
   - Scheduled daily baseline testing
   - PR performance comparisons
   - Automatic trend tracking
   - Team notifications

3. **Performance Metrics Storage**
   - Historical performance data in `.github/performance-data/`
   - JSON-based metric storage with timestamps
   - Version-controlled baseline history

### Performance Thresholds

Current baseline thresholds (in milliseconds):

```typescript
const BASELINE_THRESHOLDS = {
  // Health endpoints
  health: { p50: 50, p95: 100, p99: 200 },

  // Course endpoints
  coursesList: { p50: 200, p95: 500, p99: 1000 },
  courseDetail: { p50: 150, p95: 400, p99: 800 },
  courseCreate: { p50: 300, p95: 700, p99: 1500 },

  // Exam endpoints
  examList: { p50: 200, p95: 500, p99: 1000 },
  examDetail: { p50: 150, p95: 400, p99: 800 },
  examSubmit: { p50: 500, p95: 1200, p99: 2500 },

  // User endpoints
  userProfile: { p50: 150, p95: 400, p99: 800 },
  userLogin: { p50: 300, p95: 800, p99: 1500 },
  userUpdate: { p50: 250, p95: 600, p99: 1200 },

  // Statistics endpoints
  statsOverview: { p50: 300, p95: 700, p99: 1400 },
  statsDetailed: { p50: 500, p95: 1200, p99: 2500 },
};
```

## Usage

### Running Performance Tests Locally

```bash
# Run all performance baseline tests
pnpm run test:performance

# Run only baseline establishment tests
pnpm run test:baseline

# Run only regression detection tests
pnpm run test:regression

# Run specific test suite
pnpm run test:e2e e2e/performance-baseline.spec.ts
```

### GitHub Actions Triggers

The performance baseline workflow runs automatically:

1. **Daily Scheduled**: Runs at 2 AM UTC every day
2. **Pull Requests**: Runs when API code changes
3. **Manual Dispatch**: Can be triggered manually from GitHub Actions UI

#### Manual Workflow Dispatch

From GitHub Actions UI:
- Navigate to "API Performance Baseline Testing" workflow
- Click "Run workflow"
- Optionally select "Create new performance baseline"

## Understanding Performance Metrics

### Percentiles Explained

- **P50 (Median)**: 50% of requests complete within this time
- **P95**: 95% of requests complete within this time (SLA target)
- **P99**: 99% of requests complete within this time (critical path)

### Example Results

```
📍 Courses List Baseline: {
  p50: 180ms,  // Half of all requests complete in 180ms
  p95: 450ms,  // 95% of requests complete in 450ms
  p99: 850ms,  // 99% of requests complete in 850ms
  avg: 220ms,  // Average response time
  min: 120ms,  // Fastest request
  max: 920ms   // Slowest request
}
```

### Performance Grades

The system assigns performance grades based on response times and success rates:

- **Grade A**: Excellent (P95 < 1000ms, Success Rate > 99%)
- **Grade B**: Good (P95 < 2000ms, Success Rate > 95%)
- **Grade C**: Acceptable (P95 < 5000ms, Success Rate > 90%)
- **Grade D**: Poor (below acceptable thresholds)

## Regression Detection

### Automatic Regression Detection

The system automatically detects performance regressions:

```typescript
// Regression tolerance: 10%
const REGRESSION_TOLERANCE = 10;

// Critical regression threshold: 20%
const CRITICAL_TOLERANCE = 20;
```

### Regression Response

- **Warning**: Performance degraded by > 10% but < 20%
  - Logged in test output
  - Added to GitHub summary
  - No test failure

- **Critical**: Performance degraded by > 20%
  - Test fails
  - GitHub issue automatically created
  - Team notification sent

## Performance Trends

### Trend Tracking

Performance data is collected over time:

```json
{
  "timestamp": "2026-05-22T02:00:00Z",
  "run_number": "123",
  "sha": "abc123...",
  "metrics": {
    "health_p50": 45,
    "health_p95": 95,
    "courses_p50": 180,
    "courses_p95": 450
  }
}
```

### Accessing Historical Data

```bash
# View recent performance data
ls -la .github/performance-data/

# Compare performance over time
cat .github/performance-data/metrics-*.json | jq '.metrics'
```

## Maintenance

### Updating Baselines

When legitimate performance improvements are made:

1. Update thresholds in `e2e/performance-baseline.spec.ts`
2. Run tests to verify new baselines
3. Commit changes with message: `perf: update performance baselines`

```typescript
// Example: Improved API performance
const BASELINE_THRESHOLDS = {
  coursesList: { p50: 150, p95: 350, p99: 700 }, // Improved from 200/500/1000
};
```

### Adding New Endpoints

When adding new API endpoints:

1. Add endpoint to baseline thresholds
2. Create test case in `e2e/performance-baseline.spec.ts`
3. Run baseline establishment tests
4. Document expected performance characteristics

```typescript
// 1. Add threshold
const BASELINE_THRESHOLDS = {
  // ... existing endpoints
  newEndpoint: { p50: 200, p95: 500, p99: 1000 },
};

// 2. Add test case
test('should baseline GET /api/new-endpoint', async ({ request }) => {
  // Test implementation
});
```

### Tuning Regression Tolerance

Adjust regression tolerance based on application needs:

```typescript
// More aggressive detection (5% threshold)
const REGRESSION_TOLERANCE = 5;

// More lenient detection (15% threshold)
const REGRESSION_TOLERANCE = 15;
```

## Integration with CI/CD

### Pull Request Checks

Performance tests run automatically on PRs:

```yaml
# .github/workflows/performance-baseline.yml
on:
  pull_request:
    paths:
      - 'src/**'
      - 'api/**'
      - 'e2e/**'
```

### Quality Gates

Performance results are included in PR comments:

```markdown
## 📊 Performance Test Results

### Summary
- ✅ API endpoints tested
- ✅ Performance metrics collected
- ✅ No critical regressions detected

### Performance Metrics
| Endpoint | P50 | P95 | P99 | Status |
|----------|-----|-----|-----|--------|
| /api/health | < 50ms | < 100ms | < 200ms | ✅ |
| /api/courses | < 200ms | < 500ms | < 1000ms | ✅ |
```

## Troubleshooting

### Common Issues

#### 1. Flaky Performance Tests

**Problem**: Inconsistent test results
**Solution**: Increase sample size or adjust network conditions

```typescript
// Increase from 10 to 20 samples
for (let i = 0; i < 20; i++) {
  // ... test logic
}
```

#### 2. False Positive Regressions

**Problem**: Regression detected due to temporary slowness
**Solution**: Adjust regression tolerance or investigate environment

#### 3. Missing Performance Data

**Problem**: Historical data not available
**Solution**: Ensure workflow has permissions to commit to repo

```yaml
permissions:
  contents: write  # Required for storing performance data
```

### Debug Mode

Run tests with additional logging:

```bash
DEBUG=perf:* pnpm run test:performance
```

## Best Practices

### 1. Establish Realistic Baselines

- Set baselines based on production measurements
- Account for normal traffic patterns
- Consider peak usage scenarios

### 2. Monitor Trends, Not Just Thresholds

- Look for gradual performance degradation
- Identify performance improvements over time
- Correlate with code changes

### 3. Context-Aware Analysis

- Different endpoints have different requirements
- Consider business impact of performance changes
- Balance optimization with development velocity

### 4. Regular Maintenance

- Review baselines quarterly
- Update thresholds after major optimizations
- Remove deprecated endpoints from testing

### 5. Team Communication

- Share performance reports regularly
- Celebrate performance improvements
- Address regressions collaboratively

## Performance Optimization Guidelines

### When Performance Degrades

1. **Identify the Root Cause**
   - Review recent code changes
   - Check database query performance
   - Analyze network latency
   - Monitor resource utilization

2. **Implement Fixes**
   - Optimize database queries
   - Add caching layers
   - Implement pagination
   - Consider async processing

3. **Validate Improvements**
   - Run performance tests
   - Compare with baselines
   - Monitor production metrics
   - Update baselines if needed

### Performance Optimization Resources

- [Web.dev Performance](https://web.dev/performance/)
- [MDN Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)

## Reporting and Analytics

### Performance Reports

Generate performance summary reports:

```bash
# View latest performance results
cat test-results/results.json | jq '.tests[].results[]'

# Compare with historical data
./scripts/performance-report.sh --compare-week
```

### Custom Metrics

Add custom performance tracking:

```typescript
test('should track custom metric', async ({ request }) => {
  const customMetric = await measureCustomPerformance();
  expect(customMetric).toBeLessThan(CUSTOM_THRESHOLD);
});
```

## Integration with Monitoring Tools

### External Monitoring Integration

The performance baseline system can be integrated with:

- **DataDog**: Custom metrics submission
- **New Relic**: Performance event tracking
- **Prometheus**: Metrics export
- **Grafana**: Dashboard visualization

Example: DataDog Integration

```typescript
test('should send metrics to DataDog', async ({ request }) => {
  const metrics = calculateMetrics(timings);

  await fetch('https://api.datadoghq.com/api/v1/series', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      series: [{
        metric: 'api.performance.p95',
        points: [[Date.now(), metrics.p95]],
        tags: [`endpoint:${endpoint}`]
      }]
    })
  });
});
```

## Future Enhancements

### Planned Features

1. **Machine Learning Anomaly Detection**
   - Automatic pattern recognition
   - Predictive performance analysis
   - Intelligent alerting

2. **Real User Monitoring (RUM) Integration**
   - Real user performance data
   - Geographic performance analysis
   - Device-specific metrics

3. **Advanced Analytics Dashboard**
   - Interactive performance visualization
   - Custom report generation
   - Team collaboration features

4. **Automated Performance Optimization Suggestions**
   - AI-driven optimization recommendations
   - Code analysis for performance bottlenecks
   - Automated PR suggestions

## Contributing

### Adding Performance Tests

When contributing new performance tests:

1. Follow existing test patterns
2. Include proper error handling
3. Add documentation for new metrics
4. Update this README

### Performance Testing Guidelines

- Tests should be reproducible
- Use realistic data volumes
- Account for network variability
- Include proper cleanup

## Support

For questions or issues related to the performance baseline system:

1. Check this documentation first
2. Review test results in GitHub Actions
3. Check existing GitHub issues
4. Create new issue with performance data

## License

MIT License - see LICENSE file for details
