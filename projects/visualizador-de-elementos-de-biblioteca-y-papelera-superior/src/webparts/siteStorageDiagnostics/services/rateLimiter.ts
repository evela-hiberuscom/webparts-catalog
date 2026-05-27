export interface IRateLimiterOptions {
  maxRequestsPerSecond: number;
}

export class RateLimiter {
  private readonly interval: number;
  private lastRequestTime: number = 0;
  private pausedUntil: number = 0;

  public constructor(options: IRateLimiterOptions) {
    this.interval = 1000 / Math.max(1, options.maxRequestsPerSecond);
  }

  public async waitForSlot(): Promise<void> {
    const now = Date.now();

    if (this.pausedUntil > now) {
      const waitTime = this.pausedUntil - now;
      await this.delay(waitTime);
    }

    const elapsed = Date.now() - this.lastRequestTime;
    if (elapsed < this.interval) {
      await this.delay(this.interval - elapsed);
    }

    this.lastRequestTime = Date.now();
  }

  public applyRetryAfter(seconds: number): void {
    this.pausedUntil = Date.now() + seconds * 1000;
  }

  public reset(): void {
    this.lastRequestTime = 0;
    this.pausedUntil = 0;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
