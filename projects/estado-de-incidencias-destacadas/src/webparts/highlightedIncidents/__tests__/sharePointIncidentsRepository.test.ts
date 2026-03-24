import {
  SharePointIncidentsRepository,
  deriveServerRelativeListPath,
  resolveListEndpoint
} from '../repositories/sharePointIncidentsRepository';

describe('SharePointIncidentsRepository', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('builds a list endpoint and loads payloads', async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        value: [
          {
            Id: '1',
            Title: 'Incidencia'
          }
        ]
      })
    } as Response);

    const repository = new SharePointIncidentsRepository();
    const items = await repository.loadIncidents({
      title: 'Estado de incidencias destacadas',
      subtitle: '',
      webUrl: 'https://contoso.sharepoint.com/sites/portal',
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'IncidentsList',
      showResolved: false,
      maxItems: 5
    });

    expect(resolveListEndpoint('https://contoso.sharepoint.com/sites/portal', 'IncidentsList')).toContain("/_api/web/lists/getbytitle('IncidentsList')/items");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(items[0].sourceName).toBe('IncidentsList');
  });

  it('derives a REST endpoint from a normal SharePoint list url', async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        value: [
          {
            Id: 42,
            Title: 'Incidencia desde URL'
          }
        ]
      })
    } as Response);

    const repository = new SharePointIncidentsRepository();

    await repository.loadIncidents({
      title: 'Estado de incidencias destacadas',
      subtitle: '',
      webUrl: 'https://contoso.sharepoint.com/sites/portal',
      dataSourceType: 'SharePointList',
      listTitleOrUrl: '/sites/portal/Lists/Incidents/AllItems.aspx?viewid=123',
      showResolved: false,
      maxItems: 5
    });

    expect(
      resolveListEndpoint(
        'https://contoso.sharepoint.com/sites/portal',
        '/sites/portal/Lists/Incidents/AllItems.aspx?viewid=123'
      )
    ).toBe(
      "https://contoso.sharepoint.com/sites/portal/_api/web/GetList('/sites/portal/Lists/Incidents')/items?$select=Id,Title,Severity,Impact,Status,Workaround,ETA,DetailUrl,SourceName&$top=100"
    );
    expect(deriveServerRelativeListPath('/sites/portal/Lists/Incidents/AllItems.aspx')).toBe('/sites/portal/Lists/Incidents');
    expect(fetchMock).toHaveBeenCalledWith(
      "https://contoso.sharepoint.com/sites/portal/_api/web/GetList('/sites/portal/Lists/Incidents')/items?$select=Id,Title,Severity,Impact,Status,Workaround,ETA,DetailUrl,SourceName&$top=100",
      expect.any(Object)
    );
  });

  it('throws when the payload is malformed', async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ unexpected: true })
    } as Response);

    const repository = new SharePointIncidentsRepository();

    await expect(
      repository.loadIncidents({
        title: 'Estado de incidencias destacadas',
        subtitle: '',
        webUrl: 'https://contoso.sharepoint.com/sites/portal',
        dataSourceType: 'SharePointList',
        listTitleOrUrl: 'IncidentsList',
        showResolved: false,
        maxItems: 5
      })
    ).rejects.toThrow('formato inesperado');
  });

  it('rejects cross-origin list urls', () => {
    expect(() => resolveListEndpoint('https://contoso.sharepoint.com/sites/portal', 'https://example.com/list')).toThrow('same-origin');
  });
});
