import { createFavoritesRepository } from './favoritesRepository';

describe('favoritesRepository', () => {
  const globalWithFetch = globalThis as unknown as { fetch: jest.Mock };

  beforeEach(() => {
    globalWithFetch.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('loads SharePoint favorites for the current user', async () => {
    globalWithFetch.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        value: [
          {
            Id: 41,
            Title: 'Portal Comercial',
            OpenUrl: '/sites/comercial',
            Icon: 'WorkforceManagement',
            Type: 'site',
            Category: 'Negocio',
            Featured: true,
            SortOrder: 2,
            FavoriteOwnerId: 17
          }
        ]
      })
    });

    const repository = createFavoritesRepository({
      title: 'Favoritos personales',
      description: 'Accesos personales',
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'FavoritesList',
      maxItems: 12,
      showMetadata: true,
      favoritesJson: '[]',
      userDisplayName: 'Ada Lovelace',
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo',
      currentUserId: 17
    });

    const result = await repository.load();

    expect(globalWithFetch.fetch).toHaveBeenCalledTimes(1);
    expect(globalWithFetch.fetch.mock.calls[0][0]).toContain("FavoriteOwnerId eq 17");
    expect(result.sourceLabel).toBe('SharePoint list: FavoritesList');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.title).toBe('Portal Comercial');
  });

  it('falls back to static config parsing when configured for StaticConfig', async () => {
    const repository = createFavoritesRepository({
      title: 'Favoritos personales',
      description: 'Accesos personales',
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: '',
      maxItems: 12,
      showMetadata: true,
      favoritesJson: '',
      userDisplayName: 'Ada Lovelace',
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo',
      currentUserId: 17
    });

    const result = await repository.load();

    expect(globalWithFetch.fetch).not.toHaveBeenCalled();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.isFallback).toBe(true);
  });
});
