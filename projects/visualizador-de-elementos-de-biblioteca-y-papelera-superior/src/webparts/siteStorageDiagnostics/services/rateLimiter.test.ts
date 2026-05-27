import { RateLimiter } from './rateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow first request immediately', async () => {
    const limiter = new RateLimiter({ maxRequestsPerSecond: 4 });
    const start = Date.now();
    await limiter.waitForSlot();
    expect(Date.now() - start).toBeLessThan(50);
  });

  it('should delay subsequent requests to respect rate', async () => {
    const limiter = new RateLimiter({ maxRequestsPerSecond: 4 });
    await limiter.waitForSlot();

    const waitPromise = limiter.waitForSlot();
    jest.advanceTimersByTime(250);
    await waitPromise;
    // Should wait ~250ms for 4 req/s
  });

  it('should apply retry-after delay', async () => {
    const limiter = new RateLimiter({ maxRequestsPerSecond: 4 });
    limiter.applyRetryAfter(5);

    const waitPromise = limiter.waitForSlot();
    jest.advanceTimersByTime(5000);
    await waitPromise;
  });

  it('should reset state', () => {
    const limiter = new RateLimiter({ maxRequestsPerSecond: 4 });
    limiter.applyRetryAfter(60);
    limiter.reset();
    // After reset, no delay should be applied
  });
});
