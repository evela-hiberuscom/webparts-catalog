import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { IFavoriteLoadConfig } from '../models/favoritesTypes';
import type { IFavoritesRepository, IFavoritesRepositoryResult } from '../repositories/favoritesRepository';
import { useFavorites } from './useFavorites';

describe('useFavorites', () => {
  let container: HTMLDivElement;

  const config: IFavoriteLoadConfig = {
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
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.innerHTML = '';
    container.remove();
  });

  it('transitions from loading to ready once the repository resolves', async () => {
    let resolveLoad: (value: IFavoritesRepositoryResult) => void = () => undefined;
    const loadPromise = new Promise<IFavoritesRepositoryResult>((resolve) => {
      resolveLoad = resolve;
    });

    const repository: IFavoritesRepository = {
      load: jest.fn(() => loadPromise)
    };

    let latestState = '';
    let latestCount = 0;

    function Probe(): React.ReactElement | null {
      const viewModel = useFavorites(config, repository);
      latestState = viewModel.state;
      latestCount = viewModel.items.length;
      return null;
    }

    await act(async () => {
      ReactDOM.render(<Probe />, container);
    });

    expect(latestState).toBe('loading');

    await act(async () => {
      resolveLoad({
        items: [
          {
            title: 'Portal Comercial',
            openUrl: '/sites/comercial',
            type: 'site',
            category: 'Negocio',
            featured: true,
            sortOrder: 1
          }
        ],
        warnings: [],
        sourceLabel: 'Static config',
        isFallback: false
      });

      await loadPromise;
    });

    expect(latestState).toBe('ready');
    expect(latestCount).toBe(1);
  });
});
