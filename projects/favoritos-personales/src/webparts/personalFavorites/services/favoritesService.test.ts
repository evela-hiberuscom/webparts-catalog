import { loadFavoritesViewModel } from './favoritesService';
import type { IFavoritesRepository } from '../repositories/favoritesRepository';

describe('favoritesService', () => {
  it('returns a partial view model when repository data is incomplete', async () => {
    const repository: IFavoritesRepository = {
      load: async () => ({
        items: [
          {
            title: 'Portal Comercial',
            type: 'site',
            sortOrder: 2
          }
        ],
        warnings: [],
        sourceLabel: 'StaticConfig',
        isFallback: false
      })
    };

    const viewModel = await loadFavoritesViewModel(
      {
        title: 'Favoritos personales',
        description: 'Accesos personales',
        dataSourceType: 'StaticConfig',
        listTitleOrUrl: 'FavoritesList',
        maxItems: 10,
        showMetadata: true,
        favoritesJson: '[]',
        userDisplayName: 'Ada Lovelace',
        webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo',
        currentUserId: 17
      },
      repository
    );

    expect(viewModel.state).toBe('partialData');
    expect(viewModel.items).toHaveLength(1);
    expect(viewModel.items[0]?.icon).toBe('Globe');
  });

  it('keeps empty state when repository returns no data', async () => {
    const repository: IFavoritesRepository = {
      load: async () => ({
        items: [],
        warnings: [],
        sourceLabel: 'StaticConfig',
        isFallback: false
      })
    };

    const viewModel = await loadFavoritesViewModel(
      {
        title: 'Favoritos personales',
        description: 'Accesos personales',
        dataSourceType: 'StaticConfig',
        listTitleOrUrl: 'FavoritesList',
        maxItems: 10,
        showMetadata: true,
        favoritesJson: '[]',
        userDisplayName: 'Ada Lovelace',
        webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo',
        currentUserId: 17
      },
      repository
    );

    expect(viewModel.state).toBe('empty');
    expect(viewModel.items).toHaveLength(0);
  });

  it('treats warnings with no items as partial data', async () => {
    const repository: IFavoritesRepository = {
      load: async () => ({
        items: [],
        warnings: ['FavoritesList no existe'],
        sourceLabel: 'SharePoint list: FavoritesList',
        isFallback: true
      })
    };

    const viewModel = await loadFavoritesViewModel(
      {
        title: 'Favoritos personales',
        description: 'Accesos personales',
        dataSourceType: 'SharePointList',
        listTitleOrUrl: 'FavoritesList',
        maxItems: 10,
        showMetadata: true,
        favoritesJson: '[]',
        userDisplayName: 'Ada Lovelace',
        webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo',
        currentUserId: 17
      },
      repository
    );

    expect(viewModel.state).toBe('partialData');
    expect(viewModel.hasPartialData).toBe(true);
  });
});
