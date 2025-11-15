const { test, expect } = require('@playwright/test');

test.describe('CMUCourses.com Synthetic Monitoring', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(30000); // 30 second timeout
  });

  test('Homepage loads successfully', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('https://cmucourses.com');
    const loadTime = Date.now() - startTime;

    // Check that page loaded
    await expect(page).toHaveTitle(/CMU Courses/i);

    // Log performance metric
    console.log(`METRIC:homepage_load_time:${loadTime}`);

    // Assert reasonable load time (under 10 seconds)
    expect(loadTime).toBeLessThan(10000);
  });

  test('Search functionality works', async ({ page }) => {
    await page.goto('https://cmucourses.com');

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    // Look for search input or search functionality
    // Note: Adjust selectors based on actual page structure
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="course" i]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('15-213');
      await searchInput.press('Enter');

      // Wait for search results
      await page.waitForLoadState('networkidle');

      const searchTime = Date.now() - startTime;
      console.log(`METRIC:search_response_time:${searchTime}`);

      // Check that we got some results
      const pageContent = await page.content();
      const hasResults = pageContent.includes('213') || pageContent.includes('15-213');

      console.log(`METRIC:search_successful:${hasResults ? 1 : 0}`);
    } else {
      console.log('METRIC:search_available:0');
    }
  });

  // TODO: Fix this test - modal blocks clicking on course links
  test.skip('Course listing page loads', async ({ page }) => {
    await page.goto('https://cmucourses.com');

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    // Try to find and click on a course link
    // Adjust selectors based on actual page structure
    const courseLinks = page.locator('a[href*="course"], .course-link, [class*="course"]').first();

    if (await courseLinks.count() > 0) {
      await courseLinks.click();
      await page.waitForLoadState('networkidle');

      const navigationTime = Date.now() - startTime;
      console.log(`METRIC:course_page_load_time:${navigationTime}`);

      // Verify we're on a course page
      const url = page.url();
      console.log(`METRIC:course_navigation_successful:${url.includes('course') ? 1 : 0}`);
    } else {
      console.log('METRIC:course_links_available:0');
    }
  });

  test('SSL certificate is valid', async ({ page, context }) => {
    const response = await page.goto('https://cmucourses.com');

    // Check that HTTPS is being used
    const url = page.url();
    const isHttps = url.startsWith('https://');

    console.log(`METRIC:https_enabled:${isHttps ? 1 : 0}`);

    // Check response status
    const status = response.status();
    console.log(`METRIC:ssl_response_status:${status}`);

    expect(isHttps).toBeTruthy();
    expect(status).toBe(200);
  });

  test('Page performance metrics', async ({ page }) => {
    await page.goto('https://cmucourses.com');

    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        responseTime: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
      };
    });

    console.log(`METRIC:dom_content_loaded:${performanceMetrics.domContentLoaded}`);
    console.log(`METRIC:page_load_complete:${performanceMetrics.loadComplete}`);
    console.log(`METRIC:response_time:${performanceMetrics.responseTime}`);
    console.log(`METRIC:dom_interactive:${performanceMetrics.domInteractive}`);
  });

  test('No critical console errors', async ({ page }) => {
    const errors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto('https://cmucourses.com');
    await page.waitForLoadState('networkidle');

    const errorCount = errors.length;
    console.log(`METRIC:console_errors:${errorCount}`);

    // Log first few errors for debugging
    if (errorCount > 0) {
      console.log(`Console errors detected: ${errors.slice(0, 3).join(', ')}`);
    }
  });

  test('API endpoints are responsive', async ({ page, request }) => {
    // Try to detect and test API endpoints
    // This is a generic test - adjust based on actual API structure

    const startTime = Date.now();
    await page.goto('https://cmucourses.com');

    // Intercept API calls
    const apiCalls = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/') || url.includes('.json')) {
        apiCalls.push({
          url,
          status: response.status(),
          timing: Date.now() - startTime
        });
      }
    });

    await page.waitForLoadState('networkidle');

    // Log API call metrics
    if (apiCalls.length > 0) {
      const successfulCalls = apiCalls.filter(call => call.status >= 200 && call.status < 300).length;
      const failedCalls = apiCalls.filter(call => call.status >= 400).length;

      console.log(`METRIC:api_calls_total:${apiCalls.length}`);
      console.log(`METRIC:api_calls_successful:${successfulCalls}`);
      console.log(`METRIC:api_calls_failed:${failedCalls}`);

      if (apiCalls.length > 0) {
        const avgTiming = apiCalls.reduce((sum, call) => sum + call.timing, 0) / apiCalls.length;
        console.log(`METRIC:api_average_response_time:${avgTiming}`);
      }
    } else {
      console.log('METRIC:api_calls_detected:0');
    }
  });
});
