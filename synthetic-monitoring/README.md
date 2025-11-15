# Synthetic Monitoring

Playwright-based functional tests for cmucourses.com that expose Prometheus metrics.

## Quick Start

```bash
# Build and run with other services
podman-compose up -d --build

# View logs
podman-compose logs synthetic-monitoring

# Manual test trigger
curl http://localhost:9091/trigger
```

## Endpoints

- `/metrics` - Prometheus metrics (scraped every 60s)
- `/health` - Health check
- `/trigger` - Manually run tests

## Configuration

Environment variables (in `podman-compose.yml`):
- `TEST_INTERVAL` - Test frequency in ms (default: 300000 = 5 min)
- `PORT` - Metrics port (default: 9091)

## Key Metrics

- `synthetic_functionality_up{feature}` - Feature working (1) or broken (0)
- `synthetic_feature_response_time_ms{feature}` - Feature response time
- `synthetic_tests_passed_total` - Passing test count
- `synthetic_tests_failed_total` - Failing test count
- `synthetic_console_errors_total` - JavaScript errors detected
- `synthetic_performance_metric_ms{metric_type}` - Browser performance data

## Adding Tests

Edit `tests/cmucourses.spec.js` and add Playwright test cases. Log metrics as:
```javascript
console.log(`METRIC:metric_name:${value}`);
```

## Local Development

```bash
npm install
npx playwright install chromium
npm test  # Run tests
npm start # Start metrics server
```
