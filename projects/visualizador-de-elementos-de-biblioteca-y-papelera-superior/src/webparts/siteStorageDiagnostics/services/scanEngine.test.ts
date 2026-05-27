import type { IHttpClient, IHttpResponse } from '../models/httpClient';
import { ScanEngine, type IScanEvent } from './scanEngine';

type IScanConfigurationOverrides = Partial<{
  reportListUrl: string;
  batchSize: number;
  maxRequestsPerSecond: number;
  scope: 'all' | 'manual';
  manualSiteUrls: string[];
}>;

function createJsonResponse(payload: unknown, status = 200): IHttpResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => undefined },
    json: async () => payload
  };
}

function createMockHttpClient(): jest.Mocked<IHttpClient> {
  return {
    get: jest.fn(async (url: string, _configuration: unknown, _options?: { headers?: Record<string, string> }) => {
      if (url.includes('/_api/search/query')) {
        return createJsonResponse({
          PrimaryQueryResult: {
            RelevantResults: {
              TotalRows: 1,
              Table: {
                Rows: [
                  {
                    Cells: [
                      { Key: 'SPSiteURL', Value: 'https://contoso.sharepoint.com/sites/discovered' },
                      { Key: 'SiteTitle', Value: 'Discovered site' }
                    ]
                  }
                ]
              }
            }
          }
        });
      }

      if (url.includes('/_api/web/lists?')) {
        return createJsonResponse({
          value: [
            { Id: 'lib1', Title: 'Documents', ItemCount: 10, LastItemModifiedDate: '2026-01-01T00:00:00Z' }
          ]
        });
      }

      if (url.includes('/_api/web/RecycleBin')) {
        return createJsonResponse({
          value: [
            { Id: '1', Size: 1024 },
            { Id: '2', Size: 1024 }
          ]
        });
      }

      if (url.includes('/_api/site/usage')) {
        return createJsonResponse({
          Usage: { Storage: 1073741824 }
        });
      }

      throw new Error(`Unexpected GET request in test: ${url}`);
    }),
    post: jest.fn(async (_url: string, _configuration: unknown, _options: { headers?: Record<string, string>; body: string }) => createJsonResponse({}, 201))
  };
}

function createMockCache() {
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

function createMockRateLimiter() {
  return {
    waitForSlot: jest.fn().mockResolvedValue(undefined),
    applyRetryAfter: jest.fn(),
    reset: jest.fn()
  };
}

describe('ScanEngine', () => {
  function createEngine(
    overrides: IScanConfigurationOverrides = {},
    dependencies?: {
      cache?: ReturnType<typeof createMockCache>;
      rateLimiter?: ReturnType<typeof createMockRateLimiter>;
    }
  ): ScanEngine {
    return new ScanEngine({
      spHttpClient: createMockHttpClient(),
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
        rateLimiter: (dependencies?.rateLimiter ?? createMockRateLimiter()) as never,
        cache: (dependencies?.cache ?? createMockCache()) as never
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

  it('skips persistence when report list URL is invalid and records a single scan error', async () => {
    const engine = createEngine({
      reportListUrl: 'ddd',
      scope: 'manual',
      manualSiteUrls: [
        'https://contoso.sharepoint.com/sites/site1',
        'https://contoso.sharepoint.com/sites/site2'
      ]
    });

    await engine.start();

    expect(engine.getProgress().errors).toEqual([
      expect.objectContaining({
        siteUrl: 'https://contoso.sharepoint.com/sites/admin',
        message: 'La URL de la lista de informes no es válida. La descarga CSV seguirá disponible sin guardar.'
      })
    ]);
  });

  it('skips persistence outside the current site and records a single scan error', async () => {
    const engine = createEngine({
      reportListUrl: 'https://contoso.sharepoint.com/sites/other/Lists/Reports',
      scope: 'manual',
      manualSiteUrls: [
        'https://contoso.sharepoint.com/sites/site1'
      ]
    });

    await engine.start();

    expect(engine.getProgress().errors).toEqual([
      expect.objectContaining({
        siteUrl: 'https://contoso.sharepoint.com/sites/admin',
        message: 'El guardado de informes solo está permitido en el sitio actual. La descarga CSV seguirá disponible sin guardar.'
      })
    ]);
  });

  it('always starts a fresh scan even if IndexedDB still has completed URLs from a previous run', async () => {
    const cache = createMockCache();
    cache.getScanState.mockResolvedValue({
      id: 'current',
      completedUrls: ['https://contoso.sharepoint.com/sites/site1'],
      pendingUrls: ['https://contoso.sharepoint.com/sites/site2'],
      timestamp: '2026-05-27T12:00:00Z'
    });

    const engine = createEngine({
      scope: 'manual',
      manualSiteUrls: [
        'https://contoso.sharepoint.com/sites/site1',
        'https://contoso.sharepoint.com/sites/site2'
      ]
    }, { cache });

    const events: IScanEvent[] = [];
    engine.onEvent((event) => events.push(event));

    await engine.start();

    expect(cache.clearReports).toHaveBeenCalledTimes(1);
    expect(events.filter((event) => event.type === 'site-completed')).toHaveLength(2);
    expect(cache.saveScanState).toHaveBeenNthCalledWith(1, expect.objectContaining({
      id: 'current',
      completedUrls: [],
      pendingUrls: [
        'https://contoso.sharepoint.com/sites/site1',
        'https://contoso.sharepoint.com/sites/site2'
      ]
    }));
  });
});
