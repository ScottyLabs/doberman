const express = require('express');
const { execSync } = require('child_process');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 9091;
const SITE_NAME = 'cmucourses.com';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Synthetic monitoring specific metrics (complementing blackbox exporter)
const testDuration = new client.Gauge({
  name: 'synthetic_test_duration_seconds',
  help: 'Duration of the entire test suite execution',
  registers: [register]
});

const testsPassed = new client.Gauge({
  name: 'synthetic_tests_passed_total',
  help: 'Number of tests that passed',
  registers: [register]
});

const testsFailed = new client.Gauge({
  name: 'synthetic_tests_failed_total',
  help: 'Number of tests that failed',
  registers: [register]
});

const lastRunTimestamp = new client.Gauge({
  name: 'synthetic_last_run_timestamp',
  help: 'Timestamp of the last test run',
  registers: [register]
});

// Functional metrics (these are what blackbox can't test)
const functionalityUp = new client.Gauge({
  name: 'synthetic_functionality_up',
  help: 'Whether core functionality is working (1) or broken (0)',
  labelNames: ['site', 'feature'],
  registers: [register]
});

const featureResponseTime = new client.Gauge({
  name: 'synthetic_feature_response_time_ms',
  help: 'Response time for specific features in milliseconds',
  labelNames: ['site', 'feature'],
  registers: [register]
});

const performanceMetrics = new client.Gauge({
  name: 'synthetic_performance_metric_ms',
  help: 'Browser performance metrics in milliseconds',
  labelNames: ['site', 'metric_type'],
  registers: [register]
});

const consoleErrors = new client.Gauge({
  name: 'synthetic_console_errors_total',
  help: 'Number of console errors detected during page load',
  labelNames: ['site'],
  registers: [register]
});

const apiHealthMetrics = new client.Gauge({
  name: 'synthetic_api_health',
  help: 'API health metrics (calls, success rate)',
  labelNames: ['site', 'metric_type'],
  registers: [register]
});

// Function to parse metrics from test output
function parseMetrics(output) {
  const lines = output.split('\n');
  const metrics = {};

  lines.forEach(line => {
    const match = line.match(/METRIC:([^:]+):(.+)/);
    if (match) {
      const [, metricName, value] = match;
      metrics[metricName] = parseFloat(value);
    }
  });

  return metrics;
}

// Function to run Playwright tests
async function runTests() {
  console.log(`[${new Date().toISOString()}] Running synthetic tests for ${SITE_NAME}...`);
  const startTime = Date.now();

  try {
    // Run Playwright tests and capture output
    const output = execSync('npx playwright test --reporter=list', {
      cwd: __dirname + '/..',
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    const duration = (Date.now() - startTime) / 1000;
    testDuration.set(duration);
    lastRunTimestamp.set(Date.now());

    // Parse test results from output
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);

    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;

    testsPassed.set(passed);
    testsFailed.set(failed);

    // Parse custom metrics
    const metrics = parseMetrics(output);

    // Update functional metrics
    if (metrics.homepage_load_time !== undefined) {
      featureResponseTime.set({ site: SITE_NAME, feature: 'homepage' }, metrics.homepage_load_time);
      functionalityUp.set({ site: SITE_NAME, feature: 'homepage' }, 1);
    }

    if (metrics.search_response_time !== undefined) {
      featureResponseTime.set({ site: SITE_NAME, feature: 'search' }, metrics.search_response_time);
    }

    if (metrics.search_successful !== undefined) {
      functionalityUp.set({ site: SITE_NAME, feature: 'search' }, metrics.search_successful);
    }

    if (metrics.course_page_load_time !== undefined) {
      featureResponseTime.set({ site: SITE_NAME, feature: 'course_detail' }, metrics.course_page_load_time);
    }

    if (metrics.course_navigation_successful !== undefined) {
      functionalityUp.set({ site: SITE_NAME, feature: 'course_navigation' }, metrics.course_navigation_successful);
    }

    // Update performance metrics
    if (metrics.dom_content_loaded !== undefined) {
      performanceMetrics.set({ site: SITE_NAME, metric_type: 'dom_content_loaded' }, metrics.dom_content_loaded);
    }

    if (metrics.page_load_complete !== undefined) {
      performanceMetrics.set({ site: SITE_NAME, metric_type: 'page_load_complete' }, metrics.page_load_complete);
    }

    if (metrics.response_time !== undefined) {
      performanceMetrics.set({ site: SITE_NAME, metric_type: 'response_time' }, metrics.response_time);
    }

    if (metrics.dom_interactive !== undefined) {
      performanceMetrics.set({ site: SITE_NAME, metric_type: 'dom_interactive' }, metrics.dom_interactive);
    }

    // Update error metrics
    if (metrics.console_errors !== undefined) {
      consoleErrors.set({ site: SITE_NAME }, metrics.console_errors);
    }

    // Update API health metrics
    if (metrics.api_calls_total !== undefined) {
      apiHealthMetrics.set({ site: SITE_NAME, metric_type: 'total_calls' }, metrics.api_calls_total);
    }

    if (metrics.api_calls_successful !== undefined) {
      apiHealthMetrics.set({ site: SITE_NAME, metric_type: 'successful_calls' }, metrics.api_calls_successful);
    }

    if (metrics.api_calls_failed !== undefined) {
      apiHealthMetrics.set({ site: SITE_NAME, metric_type: 'failed_calls' }, metrics.api_calls_failed);
    }

    console.log(`Tests completed in ${duration}s. Passed: ${passed}, Failed: ${failed}`);

  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    testDuration.set(duration);
    lastRunTimestamp.set(Date.now());

    console.error('Test execution failed:', error.message);

    // Try to parse any metrics from stderr/stdout
    if (error.stdout) {
      const metrics = parseMetrics(error.stdout.toString());
      if (Object.keys(metrics).length > 0) {
        console.log('Partial metrics captured before failure');
      }
    }

    // Mark all functionality as down if tests completely failed
    testsFailed.set(1);
    testsPassed.set(0);
  }
}

// Metrics endpoint for Prometheus scraping
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    lastRun: lastRunTimestamp.hashMap['']?.value || null,
    site: SITE_NAME
  });
});

// Manual trigger endpoint (useful for debugging)
app.get('/trigger', async (req, res) => {
  res.json({ status: 'Test run triggered' });
  runTests().catch(console.error);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Synthetic monitoring service started on port ${PORT}`);
  console.log(`- Metrics endpoint: http://localhost:${PORT}/metrics`);
  console.log(`- Health check: http://localhost:${PORT}/health`);
  console.log(`- Manual trigger: http://localhost:${PORT}/trigger`);

  // Run tests immediately on startup
  runTests().catch(console.error);

  // Schedule tests to run periodically
  const interval = process.env.TEST_INTERVAL || 300000; // 5 minutes default
  setInterval(() => {
    runTests().catch(console.error);
  }, interval);

  console.log(`Automated tests will run every ${interval / 1000} seconds`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
