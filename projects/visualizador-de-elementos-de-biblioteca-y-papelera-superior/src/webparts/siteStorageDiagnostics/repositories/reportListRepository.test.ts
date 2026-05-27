import { ReportListRepository } from './reportListRepository';

describe('ReportListRepository', () => {
  function createMockHttpClient(getResponse = {}, postResponse = {}) {
    return {
      get: jest.fn(async () => ({
        ok: true,
        status: 200,
        headers: { get: () => undefined },
        json: async () => ({ value: [] }),
        ...getResponse
      })),
      post: jest.fn(async () => ({
        ok: true,
        status: 201,
        headers: { get: () => undefined },
        json: async () => ({}),
        ...postResponse
      }))
    };
  }

  describe('listApiBase URL parsing', () => {
    it('parses Lists/ path correctly', async () => {
      const client = createMockHttpClient();
      const repo = new ReportListRepository({
        spHttpClient: client,
        reportListUrl: 'https://contoso.sharepoint.com/sites/admin/Lists/SiteStorageReports'
      });

      await repo.getReports();

      expect(client.get).toHaveBeenCalledWith(
        expect.stringContaining("/_api/web/lists/getbytitle('SiteStorageReports')/items"),
        undefined,
        expect.any(Object)
      );
    });

    it('uses default list name when no Lists/ path', async () => {
      const client = createMockHttpClient();
      const repo = new ReportListRepository({
        spHttpClient: client,
        reportListUrl: 'https://contoso.sharepoint.com/sites/admin'
      });

      await repo.getReports();

      expect(client.get).toHaveBeenCalledWith(
        expect.stringContaining("/_api/web/lists/getbytitle('SiteStorageReports')/items"),
        undefined,
        expect.any(Object)
      );
    });

    it('passes through direct API URLs', async () => {
      const client = createMockHttpClient();
      const repo = new ReportListRepository({
        spHttpClient: client,
        reportListUrl: "https://contoso.sharepoint.com/sites/admin/_api/web/lists/getbytitle('Custom')"
      });

      await repo.getReports();

      expect(client.get).toHaveBeenCalledWith(
        expect.stringContaining("getbytitle('Custom')/items"),
        undefined,
        expect.any(Object)
      );
    });

    it('throws on invalid URL', async () => {
      const client = createMockHttpClient();
      const repo = new ReportListRepository({
        spHttpClient: client,
        reportListUrl: 'not a valid url at all'
      });

      await expect(repo.getReports()).rejects.toThrow('Invalid report list URL');
    });
  });

  describe('getReports', () => {
    it('returns items from response', async () => {
      const items = [
        { SiteUrl: 'https://contoso.sharepoint.com/sites/a', SiteTitle: 'Site A', ScanDate: '2026-01-01' }
      ];
      const client = createMockHttpClient({ json: async () => ({ value: items }) });
      const repo = new ReportListRepository({
        spHttpClient: client,
        reportListUrl: 'https://contoso.sharepoint.com/sites/admin/Lists/Reports'
      });

      const result = await repo.getReports();

      expect(result).toEqual(items);
    });

    it('throws on HTTP error', async () => {
      const client = createMockHttpClient({ ok: false, status: 403 });
      const repo = new ReportListRepository({
        spHttpClient: client,
        reportListUrl: 'https://contoso.sharepoint.com/sites/admin/Lists/Reports'
      });

      await expect(repo.getReports()).rejects.toThrow('HTTP 403');
    });
  });

  describe('saveReport', () => {
    it('posts item to list', async () => {
      const client = createMockHttpClient();
      const repo = new ReportListRepository({
        spHttpClient: client,
        reportListUrl: 'https://contoso.sharepoint.com/sites/admin/Lists/Reports'
      });

      const item = { SiteUrl: 'https://site.com', SiteTitle: 'Test', ScanDate: '2026-01-01' };
      await repo.saveReport(item as any);

      expect(client.post).toHaveBeenCalledWith(
        expect.stringContaining('/items'),
        undefined,
        expect.objectContaining({ body: JSON.stringify(item) })
      );
    });

    it('throws on HTTP error', async () => {
      const client = createMockHttpClient({}, { ok: false, status: 500 });
      const repo = new ReportListRepository({
        spHttpClient: client,
        reportListUrl: 'https://contoso.sharepoint.com/sites/admin/Lists/Reports'
      });

      await expect(repo.saveReport({ SiteUrl: 'https://x.com' } as any)).rejects.toThrow('HTTP 500');
    });
  });

  describe('saveReportsBatch', () => {
    it('saves all items sequentially', async () => {
      const client = createMockHttpClient();
      const repo = new ReportListRepository({
        spHttpClient: client,
        reportListUrl: 'https://contoso.sharepoint.com/sites/admin/Lists/Reports'
      });

      await repo.saveReportsBatch([
        { SiteUrl: 'https://a.com' } as any,
        { SiteUrl: 'https://b.com' } as any
      ]);

      expect(client.post).toHaveBeenCalledTimes(2);
    });
  });
});
