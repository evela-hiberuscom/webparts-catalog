import { SiteMetricsRepository, ThrottledError } from './siteMetricsRepository';

describe('SiteMetricsRepository', () => {
  describe('getDocumentLibraries', () => {
    it('returns libraries with metrics', async () => {
      const get = jest.fn(async () => ({
        ok: true,
        status: 200,
        headers: { get: () => undefined },
        json: async () => ({
          value: [
            { Id: 'lib1', Title: 'Documents', ItemCount: 150, LastItemModifiedDate: '2026-05-20T10:00:00Z' },
            { Id: 'lib2', Title: 'Reports', ItemCount: 30, LastItemModifiedDate: '2026-05-25T10:00:00Z' }
          ]
        })
      }));

      const repo = new SiteMetricsRepository({ spHttpClient: { get, post: jest.fn() } });
      const libraries = await repo.getDocumentLibraries('https://contoso.sharepoint.com/sites/test');

      expect(libraries).toHaveLength(2);
      expect(libraries[0].title).toBe('Documents');
      expect(libraries[0].itemCount).toBe(150);
      expect(libraries[1].title).toBe('Reports');
    });

    it('throws on HTTP error', async () => {
      const get = jest.fn(async () => ({
        ok: false,
        status: 403,
        headers: { get: () => undefined },
        json: async () => ({})
      }));

      const repo = new SiteMetricsRepository({ spHttpClient: { get, post: jest.fn() } });
      await expect(repo.getDocumentLibraries('https://contoso.sharepoint.com/sites/test')).rejects.toThrow('HTTP 403');
    });
  });

  describe('getRecycleBinMetrics', () => {
    it('aggregates recycle bin items', async () => {
      const get = jest.fn(async () => ({
        ok: true,
        status: 200,
        headers: { get: () => undefined },
        json: async () => ({
          value: [
            { Id: '1', Size: 1024 },
            { Id: '2', Size: 2048 },
            { Id: '3', Size: 512 }
          ]
        })
      }));

      const repo = new SiteMetricsRepository({ spHttpClient: { get, post: jest.fn() } });
      const metrics = await repo.getRecycleBinMetrics('https://contoso.sharepoint.com/sites/test');

      expect(metrics.itemCount).toBe(3);
      expect(metrics.sizeBytes).toBe(3584);
      expect(metrics.isAccessible).toBe(true);
    });

    it('returns inaccessible on HTTP error', async () => {
      const get = jest.fn(async () => ({
        ok: false,
        status: 403,
        headers: { get: () => undefined },
        json: async () => ({})
      }));

      const repo = new SiteMetricsRepository({ spHttpClient: { get, post: jest.fn() } });
      const metrics = await repo.getRecycleBinMetrics('https://contoso.sharepoint.com/sites/test');

      expect(metrics.isAccessible).toBe(false);
      expect(metrics.errorMessage).toContain('403');
    });
  });

  describe('getSiteUsage', () => {
    it('parses site usage response', async () => {
      const get = jest.fn(async () => ({
        ok: true,
        status: 200,
        headers: { get: () => undefined },
        json: async () => ({
          Usage: { Storage: 1073741824 }
        })
      }));

      const repo = new SiteMetricsRepository({ spHttpClient: { get, post: jest.fn() } });
      const usage = await repo.getSiteUsage('https://contoso.sharepoint.com/sites/test');

      expect(usage.storageUsedBytes).toBe(1073741824);
    });

    it('handles missing usage gracefully', async () => {
      const get = jest.fn(async () => ({
        ok: false,
        status: 404,
        headers: { get: () => undefined },
        json: async () => ({})
      }));

      const repo = new SiteMetricsRepository({ spHttpClient: { get, post: jest.fn() } });
      const usage = await repo.getSiteUsage('https://contoso.sharepoint.com/sites/test');

      expect(usage.storageUsedBytes).toBeUndefined();
    });
  });

  describe('throttle detection', () => {
    it('throws ThrottledError on 429 response', async () => {
      const get = jest.fn(async () => ({
        ok: false,
        status: 429,
        headers: { get: (name: string) => name === 'Retry-After' ? '60' : undefined },
        json: async () => ({})
      }));

      const repo = new SiteMetricsRepository({ spHttpClient: { get, post: jest.fn() } });

      try {
        await repo.getDocumentLibraries('https://contoso.sharepoint.com/sites/test');
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ThrottledError);
        expect((e as ThrottledError).retryAfterSeconds).toBe(60);
      }
    });

    it('throws ThrottledError on 503 response', async () => {
      const get = jest.fn(async () => ({
        ok: false,
        status: 503,
        headers: { get: () => undefined },
        json: async () => ({})
      }));

      const repo = new SiteMetricsRepository({ spHttpClient: { get, post: jest.fn() } });

      try {
        await repo.getDocumentLibraries('https://contoso.sharepoint.com/sites/test');
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ThrottledError);
        expect((e as ThrottledError).retryAfterSeconds).toBe(30);
      }
    });

    it('defaults to 30s when Retry-After header is missing', async () => {
      const get = jest.fn(async () => ({
        ok: false,
        status: 429,
        headers: { get: () => undefined },
        json: async () => ({})
      }));

      const repo = new SiteMetricsRepository({ spHttpClient: { get, post: jest.fn() } });

      try {
        await repo.getDocumentLibraries('https://contoso.sharepoint.com/sites/test');
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ThrottledError);
        expect((e as ThrottledError).retryAfterSeconds).toBe(30);
      }
    });
  });
});
