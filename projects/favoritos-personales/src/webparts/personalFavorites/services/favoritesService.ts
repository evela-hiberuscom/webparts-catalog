import type { IFavoriteLoadConfig, IFavoritesViewModel } from '../models/favoritesTypes';
import { createFavoritesRepository, type IFavoritesRepository } from '../repositories/favoritesRepository';
import {
  isPartialFavorite,
  limitFavorites,
  normalizeFavoriteItem,
  sortFavorites,
  describeSource
} from '../utils/favoritesUtils';

export async function loadFavoritesViewModel(
  config: IFavoriteLoadConfig,
  repository: IFavoritesRepository = createFavoritesRepository(config)
): Promise<IFavoritesViewModel> {
  const result = await repository.load();
  const normalizedItems = sortFavorites(
    result.items.map((item, index) => normalizeFavoriteItem(item, index))
  );
  const items = limitFavorites(normalizedItems, config.maxItems);
  const hasPartialData = Boolean(
    result.isFallback ||
      result.warnings.length > 0 ||
      items.some(isPartialFavorite)
  );

  let state: IFavoritesViewModel['state'];
  if (items.length === 0) {
    state = hasPartialData ? 'partialData' : 'empty';
  } else if (hasPartialData) {
    state = 'partialData';
  } else {
    state = 'ready';
  }

  return {
    state,
    title: config.title,
    description: config.description,
    sourceLabel: result.sourceLabel || describeSource(config.dataSourceType, config.listTitleOrUrl),
    items,
    warnings: result.warnings,
    hasPartialData,
    userDisplayName: config.userDisplayName
  };
}
