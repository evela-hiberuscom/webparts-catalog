jest.mock('@microsoft/sp-http', () => ({
  SPHttpClient: {
    configurations: {
      v1: {}
    }
  }
}));

import { AudienceLinksRepository } from './audienceLinksRepository';

const originalFetch = globalThis.fetch;

describe('AudienceLinksRepository', () => {
  const spHttpClient = {
    get: jest.fn()
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn() as never;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('rejects external JsonUrl sources', async () => {
    const repository = new AudienceLinksRepository(spHttpClient, 'https://contoso.sharepoint.com/sites/intranet');

    await expect(
      repository.load({
        title: 'Accesos rápidos por audiencia',
        description: '',
        dataSourceType: 'JsonUrl',
        listTitleOrUrl: 'https://evil.example/feed.json',
        audienceMode: 'group',
        defaultCategory: 'General',
        maxItems: 12,
        showAudienceHint: true
      })
    ).rejects.toThrow('same origin');

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('loads same-origin JsonUrl feeds without falling back to sample data', async () => {
    const fetchMock = globalThis.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([])
    });

    const repository = new AudienceLinksRepository(spHttpClient, 'https://contoso.sharepoint.com/sites/intranet');
    const result = await repository.load({
      title: 'Accesos rápidos por audiencia',
      description: '',
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: '/sites/intranet/_api/feeds/quick-links.json',
      audienceMode: 'group',
      defaultCategory: 'General',
      maxItems: 12,
      showAudienceHint: true
    });

    expect(fetchMock).toHaveBeenCalledWith('https://contoso.sharepoint.com/sites/intranet/_api/feeds/quick-links.json', {
      method: 'GET',
      credentials: 'same-origin'
    });
    expect(result.items).toHaveLength(0);
    expect(result.hasPartialData).toBe(false);
    expect(result.sourceLabel).toBe('Catálogo JSON vacío');
  });

  it('returns an empty result when a SharePoint list has no items', async () => {
    const getMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ value: [] })
    });

    const repository = new AudienceLinksRepository({ get: getMock } as never, 'https://contoso.sharepoint.com/sites/intranet');
    const result = await repository.load({
      title: 'Accesos rápidos por audiencia',
      description: '',
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'AudienceLinks',
      audienceMode: 'group',
      defaultCategory: 'General',
      maxItems: 12,
      showAudienceHint: true
    });

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(result.items).toHaveLength(0);
    expect(result.hasPartialData).toBe(false);
    expect(result.sourceLabel).toBe('Lista SharePoint vacía: AudienceLinks');
  });

  it('requires a configured source for SharePointList and JsonUrl modes', async () => {
    const repository = new AudienceLinksRepository(spHttpClient, 'https://contoso.sharepoint.com/sites/intranet');

    await expect(
      repository.load({
        title: 'Accesos rápidos por audiencia',
        description: '',
        dataSourceType: 'SharePointList',
        listTitleOrUrl: '',
        audienceMode: 'group',
        defaultCategory: 'General',
        maxItems: 12,
        showAudienceHint: true
      })
    ).rejects.toThrow('requires listTitleOrUrl');
  });
});
