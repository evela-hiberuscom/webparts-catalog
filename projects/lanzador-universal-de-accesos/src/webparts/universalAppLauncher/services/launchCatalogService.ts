import { classifyAsyncState } from '@paquete/spfx-common';
import type { ILaunchCatalogConfig, ILaunchItem } from '../models/launchModels';
import { StaticLaunchRepository } from '../repositories/launchRepository';

export interface ILaunchCatalogResult {
  items: ILaunchItem[];
  categories: string[];
  sourceLabel: string;
  hasPartialData: boolean;
}

export function sortLaunchItems(items: ILaunchItem[]): ILaunchItem[] {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    const leftPriority = left.priority ?? Number.POSITIVE_INFINITY;
    const rightPriority = right.priority ?? Number.POSITIVE_INFINITY;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.title.localeCompare(right.title);
  });
}

export function getLaunchCategories(items: ILaunchItem[]): string[] {
  const categories: string[] = [];

  items.forEach((item) => {
    const category = item.category.trim();
    if (category && categories.indexOf(category) === -1) {
      categories.push(category);
    }
  });

  categories.sort((left, right) => left.localeCompare(right));
  return ['All'].concat(categories);
}

function normalizeTokens(tokens: string[]): string[] {
  return tokens.map((token) => token.trim().toLowerCase()).filter(Boolean);
}

function matchesAudience(item: ILaunchItem, audienceTokens: string[]): boolean {
  if (audienceTokens.length === 0) {
    return (
      item.audienceTokens.length === 0 ||
      item.audienceTokens.indexOf('general') >= 0 ||
      item.audienceTokens.indexOf('all') >= 0
    );
  }

  if (item.audienceTokens.length === 0) {
    return true;
  }

  const itemTokens = normalizeTokens(item.audienceTokens);
  return audienceTokens.some((token) => itemTokens.indexOf(token) >= 0);
}

export function filterLaunchItems(
  items: ILaunchItem[],
  query: string,
  selectedCategory: string,
  audienceTokens: string[] = []
): ILaunchItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedAudienceTokens = normalizeTokens(audienceTokens);

  return items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesAudienceFilter = matchesAudience(item, normalizedAudienceTokens);
    const matchesQuery =
      !normalizedQuery ||
      item.title.toLowerCase().indexOf(normalizedQuery) >= 0 ||
      item.description.toLowerCase().indexOf(normalizedQuery) >= 0 ||
      item.category.toLowerCase().indexOf(normalizedQuery) >= 0 ||
      item.audienceTokens.some((token) => token.toLowerCase().indexOf(normalizedQuery) >= 0);

    return matchesCategory && matchesAudienceFilter && matchesQuery;
  });
}

export function applyMaxItems(items: ILaunchItem[], maxItems: number): ILaunchItem[] {
  if (!Number.isFinite(maxItems) || maxItems <= 0) {
    return items;
  }

  return items.slice(0, maxItems);
}

export function getLaunchCatalogState(input: {
  isLoading: boolean;
  hasError: boolean;
  hasPartialData: boolean;
  hasData: boolean;
}): 'loading' | 'error' | 'partialData' | 'empty' | 'ready' {
  return classifyAsyncState({
    isLoading: input.isLoading,
    hasError: input.hasError,
    hasData: input.hasData,
    isPartial: input.hasPartialData
  });
}

export class LaunchCatalogService {
  constructor(private readonly repository: StaticLaunchRepository = new StaticLaunchRepository()) {}

  public resolveCatalog(config: ILaunchCatalogConfig): ILaunchCatalogResult {
    const repositoryResult = this.repository.load({
      launchItemsJson: config.launchItemsJson,
      defaultCategory: config.defaultCategory,
      openInNewTab: config.openInNewTab
    });

    const items = sortLaunchItems(
      filterLaunchItems(repositoryResult.items, '', 'All', config.currentAudienceTokens)
    );

    return {
      items,
      categories: getLaunchCategories(items),
      sourceLabel: repositoryResult.sourceLabel,
      hasPartialData: repositoryResult.hasPartialData
    };
  }
}
