import { ScanEngine, type IScanEvent } from './scanEngine';

jest.mock('../repositories/siteMetricsRepository', () => ({
  ThrottledError: class ThrottledError extends Error {
    public retryAfterSeconds: number;
    public constructor(r: number) { super('Throttled'); this.retryAfterSeconds = r; }
  },
  SiteMetricsRepository: jest.fn().mockImplementation(() => ({
    getDocumentLibraries: jest.fn().mockResolvedValue([
      { id: 'lib1', title: 'Documents', itemCount: 10, lastModified: '2026-01-01T00:00:00Z' }
    ]),
    getRecycleBinMetrics: jest.fn().mockResolvedValue({
      itemCount: 5,
      sizeBytes: 2048,
      isAccessible: true,
      errorMessage: undefined
    }),
    getSiteUsage: jest.fn().mockResolvedValue({
      storageUsedBytes: 1073741824,
      storageQuotaBytes: 27917287424
    })
  }))
}));

function createMockCache(): any {
  return {
    open: jest.fn().mockResolvedValue(undefined),
    saveReport: jest.fn().mockResolvedValue(undefined),
    getReport: jest.fn().mockResolvedValue(undefined),
    getAllReports: jest.fn().mockResolvedValue([]),
    saveScanState: jest.fn().mockResolvedValue(undefined),
    getScanState: jest.fn().mockResolvedValue(undefined),
    clearReports: jest.fn().mockResolvedValue(undefined)
  };
}

function createMockRateLimiter(): any {
  return {
    waitForSlot: jest.fn().mockResolvedValue(undefined),
    applyRetryAfter: jest.fn(),
    reset: jest.fn()
  };
}

describe('ScanEngine', () => {
  const mockHttpClient = {
    get: jest.fn(),
    post: jest.fn()
  };

  function createEngine(overrides = {}): ScanEngine {
    return new ScanEngine({
      spHttpClient: mockHttpClient,
      currentSiteUrl: 'https://contoso.sharepoint.com/sites/admin',
      configuration: {
        reportListUrl: '',
        batchSize: 50,
        maxRequestsPerSecond: 5,
        scope: 'all' as const,
        manualSiteUrls: [],
        ...overrides
      },
      _dependencies: {
        rateLimiter: createMockRateLimiter(),
        cache: createMockCache()
      }
    });
  }

  it('completes a full scan emitting progress events', async () => {
    const engine = createEngine({
      scope: 'manual',
      manualSiteUrls: [
        'https://contoso.sharepoint.com/sites/site1',
        'https://contoso.sharepoint.com/sites/site2'
      ]
    });
    const events: IScanEvent[] = [];
    engine.onEvent((e) => events.push(e));

    await engine.start();

    expect(events.some((e) => e.type === 'site-completed')).toBe(true);
    expect(events.some((e) => e.type === 'completed')).toBe(true);
    expect(events.filter((e) => e.type === 'site-completed')).toHaveLength(2);
  });

  it('filters invalid manual URLs', async () => {
    const engine = createEngine({
      scope: 'manual',
      manualSiteUrls: [
        'https://contoso.sharepoint.com/sites/valid',
        'not-a-url',
        'http://localhost',
        'https://other.sharepoint.com/sites/also-valid'
      ]
    });
    const events: IScanEvent[] = [];
    engine.onEvent((e) => events.push(e));

    await engine.start();

    const completedEvents = events.filter((e) => e.type === 'site-completed');
    expect(completedEvents).toHaveLength(2);
  });

  it('pause does nothing when not scanning', () => {
    const engine = createEngine();
    const events: IScanEvent[] = [];
    engine.onEvent((e) => events.push(e));

    engine.pause();

    expect(events).toHaveLength(0);
    expect(engine.getProgress().globalStatus).toBe('idle');
  });

  it('resume does nothing when not paused', () => {
    const engine = createEngine();
    const events: IScanEvent[] = [];
    engine.onEvent((e) => events.push(e));

    engine.resume();

    expect(events).toHaveLength(0);
  });

  it('cancel stops scan loop', async () => {
    const engine = createEngine({
      scope: 'manual',
      manualSiteUrls: [
        'https://contoso.sharepoint.com/sites/site1',
        'https://contoso.sharepoint.com/sites/site2',
        'https://contoso.sharepoint.com/sites/site3'
      ]
    });
    const events: IScanEvent[] = [];
    engine.onEvent((e) => {
      events.push(e);
      if (e.type === 'site-completed') {
        engine.cancel();
      }
    });

    await engine.start();

    expect(events.some((e) => e.type === 'cancelled')).toBe(true);
    const siteCompleted = events.filter((e) => e.type === 'site-completed');
    expect(siteCompleted.length).toBeLessThanOrEqual(1);
  });

  it('unsubscribes listener via returned dispose function', async () => {
    const engine = createEngine();
    const events: IScanEvent[] = [];
    const dispose = engine.onEvent((e) => events.push(e));

    dispose();
    await engine.start();

    expect(events).toHaveLength(0);
  });

  it('getProgress returns current state copy', () => {
    const engine = createEngine();
    const p1 = engine.getProgress();
    const p2 = engine.getProgress();

    expect(p1).toEqual(p2);
    expect(p1).not.toBe(p2);
  });
});
