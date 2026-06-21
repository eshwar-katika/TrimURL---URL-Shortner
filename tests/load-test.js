import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ─── Custom Metrics ────────────────────────────────────────────────────────────
const redirectErrors = new Rate('redirect_errors');
const redirectDuration = new Trend('redirect_duration_ms', true);

// ─── Load Profile ─────────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    // Ramp up to 1000 req/sec target for 1 minute
    constant_high_load: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 200,
      maxVUs: 1000,
    },
  },
  thresholds: {
    // 95th percentile latency must stay under 50ms (Redis cache hit target)
    http_req_duration: ['p(95)<50'],
    // 99th percentile must stay under 200ms (cold DB path)
    'http_req_duration{scenario:constant_high_load}': ['p(99)<200'],
    // Error rate must be below 0.1%
    http_req_failed: ['rate<0.001'],
    redirect_errors: ['rate<0.001'],
  },
};

// ─── Test Data ────────────────────────────────────────────────────────────────
// Pre-seed these short codes before running the load test
// Example: curl -X POST http://localhost:8080/api/v1/urls -d '{"longUrl":"https://google.com"}'
const SHORT_CODES = [
  'testAbc1',
  'testAbc2',
  'testAbc3',
];

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// ─── Main Test Function ────────────────────────────────────────────────────────
export default function () {
  // Pick a random short code from the pool to distribute cache reads
  const shortCode = SHORT_CODES[Math.floor(Math.random() * SHORT_CODES.length)];

  group('URL Redirect', () => {
    const start = Date.now();

    const res = http.get(`${BASE_URL}/${shortCode}`, {
      headers: {
        'User-Agent': 'k6-load-tester/1.0 (https://k6.io)',
      },
      redirects: 0,  // Measure only the TrimURL server response, not the destination
    });

    const duration = Date.now() - start;
    redirectDuration.add(duration);

    const success = check(res, {
      'status is 302 Redirect': (r) => r.status === 302,
      'Location header is present': (r) => r.headers['Location'] !== undefined,
      'Response time < 50ms': (r) => r.timings.duration < 50,
    });

    redirectErrors.add(!success);
  });

  // No sleep — we want pure throughput measurement
}

// ─── Setup: Create test short codes ───────────────────────────────────────────
export function setup() {
  console.log(`Starting load test against ${BASE_URL}`);
  console.log(`Testing ${SHORT_CODES.length} pre-seeded short code(s): ${SHORT_CODES.join(', ')}`);
  console.log('IMPORTANT: Ensure these short codes exist in the database and Redis before running.');
}

// ─── Teardown: Print summary ───────────────────────────────────────────────────
export function teardown() {
  console.log('Load test completed. Check k6 summary for p95 latency and error rate results.');
}
