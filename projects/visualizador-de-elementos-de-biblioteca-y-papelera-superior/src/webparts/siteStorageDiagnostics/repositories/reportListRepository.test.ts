import { ReportListRepository } from './reportListRepository';
import type { IHttpClient, IHttpResponse } from '../models/httpClient';
import type { ISiteReportListItem } from '../models/siteReport';

describe('ReportListRepository', () => {
  function createMockHttpResponse(overrides: Partial<IHttpResponse> = {}): IHttpResponse {
    return {
      ok: true,
      status: 200,
      headers: { get: () => undefined },
      json: async () => ({}),
      ...overrides
    };
  }

  function createMockHttpClient(
    getResponse: Partial<IHttpResponse> = {},
    postResponse: Partial<IHttpResponse> = {}
  ): jest.Mocked<IHttpClient> {
    const getMock: jest.MockedFunction<IHttpClient['get']> = jest.fn(
      async (_url, _configuration, _options) => createMockHttpResponse({
        json: async () => ({ value: [] }),
        ...getResponse
      })
    );
    const postMock: jest.MockedFunction<IHttpClient['post']> = jest.fn(
      async (_url, _configuration, _options) => createMockHttpResponse({
        status: 201,
        ...postResponse
      })
    );

    return {
      get: getMock,
      post: postMock
    };
  }

  function createReportListItem(overrides: Partial<ISiteReportListItem> = {}): ISiteReportListItem {
    return {
      SiteUrl: 'https://contoso.sharepoint.com/sites/test',
      SiteTitle: 'Test',
      ScanDate: '2026-01-01',
      LibraryCount: 0,
      TotalLibraryItems: 0,
      RecycleBinItemCount: undefined,
      RecycleBinSizeBytes: undefined,
      StorageUsedBytes: undefined,
      StorageQuotaBytes: undefined,
      HealthLevel: 'ok',
      Flags: '',
      ScanStatus: 'completed',
      ErrorMessage: undefined,
      ...overrides
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

      const item = createReportListItem({ SiteUrl: 'https://site.com' });
      await repo.saveReport(item);

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

      await expect(repo.saveReport(createReportListItem({ SiteUrl: 'https://x.com' }))).rejects.toThrow('HTTP 500');
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
        createReportListItem({ SiteUrl: 'https://a.com' }),
        createReportListItem({ SiteUrl: 'https://b.com' })
      ]);

      expect(client.post).toHaveBeenCalledTimes(2);
    });
  });
});
