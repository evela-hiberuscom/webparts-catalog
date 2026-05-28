import { loadRecentAccesses } from '../services/recentAccessesService';

describe('loadRecentAccesses', () => {
  it('returns fallback data for SharePoint list mode', async () => {
    const result = await loadRecentAccesses({
      description: 'Mis accesos recientes',
      dataSourceMode: 'SharePointList',
      recentItemsJsonUrl: '',
      maxItems: 3,
      resourceTypeFilter: ''
    });

    expect(result.items).toHaveLength(3);
    expect(result.hasPartialData).toBe(true);
    expect(result.sourceLabel).toContain('fallback');
    expect(result.availableTypes).toEqual(expect.arrayContaining(['document', 'page', 'app']));
  });

  it('loads a same-origin JSON feed when configured', async () => {
    const globalWithFetch = globalThis as typeof globalThis & {
      fetch?: jest.Mock;
    };
    const originalFetch = globalWithFetch.fetch;
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => [
        {
          id: 'json-1',
          title: 'Documento JSON',
          type: 'document',
          lastAccessedAt: '2026-03-23T08:00:00Z',
          openUrl: '/docs/json.docx',
          sourceLabel: 'Json feed'
        }
      ]
    });

    Object.defineProperty(globalWithFetch, 'fetch', {
      configurable: true,
      value: fetchMock
    });

    try {
      const result = await loadRecentAccesses({
        description: 'Mis accesos recientes',
        dataSourceMode: 'JsonUrl',
        recentItemsJsonUrl: '/recent.json',
        maxItems: 10,
        resourceTypeFilter: ''
      });

      expect(result.items).toHaveLength(1);
      expect(result.hasPartialData).toBe(false);
      expect(result.items[0].title).toBe('Documento JSON');
    } finally {
      if (originalFetch) {
        Object.defineProperty(globalWithFetch, 'fetch', {
          configurable: true,
          value: originalFetch
        });
      } else {
        Object.defineProperty(globalWithFetch, 'fetch', {
          configurable: true,
          value: undefined
        });
      }
    }
  });

  it('rejects cross-origin JSON feeds', async () => {
    await expect(
      loadRecentAccesses({
        description: 'Mis accesos recientes',
        dataSourceMode: 'JsonUrl',
        recentItemsJsonUrl: 'https://example.org/recent.json',
        maxItems: 10,
        resourceTypeFilter: ''
      })
    ).rejects.toThrow('url must be same-origin or relative');
  });
});
