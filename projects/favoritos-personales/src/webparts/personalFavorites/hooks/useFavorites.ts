import * as React from 'react';

import type { IFavoriteLoadConfig, IFavoritesViewModel } from '../models/favoritesTypes';
import { loadFavoritesViewModel } from '../services/favoritesService';
import type { IFavoritesRepository } from '../repositories/favoritesRepository';
import { describeSource } from '../utils/favoritesUtils';

function createLoadingViewModel(config: IFavoriteLoadConfig): IFavoritesViewModel {
  return {
    state: 'loading',
    title: config.title,
    description: config.description,
    sourceLabel: describeSource(config.dataSourceType, config.listTitleOrUrl),
    items: [],
    warnings: [],
    hasPartialData: false,
    userDisplayName: config.userDisplayName
  };
}

export function useFavorites(
  config: IFavoriteLoadConfig,
  repository?: IFavoritesRepository
): IFavoritesViewModel {
  const [viewModel, setViewModel] = React.useState<IFavoritesViewModel>(() => createLoadingViewModel(config));

  const configSignature = [
    config.title,
    config.description,
    config.dataSourceType,
    config.listTitleOrUrl,
    config.maxItems,
    config.showMetadata ? '1' : '0',
    config.favoritesJson,
    config.userDisplayName,
    config.webAbsoluteUrl,
    String(config.currentUserId)
  ].join('::');

  React.useEffect(() => {
    let cancelled = false;
    setViewModel(createLoadingViewModel(config));

    loadFavoritesViewModel(config, repository)
      .then((next) => {
        if (!cancelled) {
          setViewModel(next);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'No se pudieron cargar los favoritos.';
          setViewModel({
            ...createLoadingViewModel(config),
            state: 'error',
            errorMessage: message
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [configSignature, repository]);

  return viewModel;
}
