import { JsonIncidentsRepository, resolveSameOriginUrl } from '../repositories/jsonIncidentsRepository';

describe('JsonIncidentsRepository', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('loads same-origin JSON payloads', async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          title: 'Sin origen',
          severity: 'high'
        }
      ]
    } as Response);

    const repository = new JsonIncidentsRepository();
    const items = await repository.loadIncidents({
      title: 'Estado de incidencias destacadas',
      subtitle: '',
      webUrl: 'https://contoso.sharepoint.com/sites/portal',
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: '/sites/portal/data/incidents.json',
      showResolved: false,
      maxItems: 5
    });

    expect(resolveSameOriginUrl('https://contoso.sharepoint.com/sites/portal', '/sites/portal/data/incidents.json')).toBe('https://contoso.sharepoint.com/sites/portal/data/incidents.json');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(items[0].sourceName).toBe('incidents.json');
  });

  it('rejects cross-origin JSON urls', () => {
    expect(() => resolveSameOriginUrl('https://contoso.sharepoint.com/sites/portal', 'https://example.com/incidents.json')).toThrow('same-origin');
  });

  it('throws when the JSON payload is malformed', async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ broken: true })
    } as Response);

    const repository = new JsonIncidentsRepository();

    await expect(
      repository.loadIncidents({
        title: 'Estado de incidencias destacadas',
        subtitle: '',
        webUrl: 'https://contoso.sharepoint.com/sites/portal',
        dataSourceType: 'JsonUrl',
        listTitleOrUrl: '/sites/portal/data/incidents.json',
        showResolved: false,
        maxItems: 5
      })
    ).rejects.toThrow('formato inesperado');
  });
});
