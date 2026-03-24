import type {
  ICorporateResourceItem,
  ICorporateResourcesFilters,
  ICorporateResourcesRequest,
  ICorporateResourcesStateSnapshot,
  CorporateResourcesViewState
} from '../models/corporateResourcesSearchModels';
import { CorporateResourcesRepository } from '../repositories/corporateResourcesRepository';
import {
  buildFacets,
  dedupeResources,
  matchesFilters,
  normalizeText,
  rankResourceItem
} from '../utils/corporateResourcesSearchUtils';

function normalizeFilters(filters: Partial<ICorporateResourcesFilters>): ICorporateResourcesFilters {
  return {
    resourceType: normalizeText(filters.resourceType),
    category: normalizeText(filters.category)
  };
}

function sortItems(items: ICorporateResourceItem[], query: string): ICorporateResourceItem[] {
  return [...items]
    .map((item) => ({
      ...item,
      isExactMatch: query.trim() ? item.title.toLowerCase() === query.trim().toLowerCase() : item.isExactMatch
    }))
    .sort((left, right) => {
      const leftScore = rankResourceItem(left, query);
      const rightScore = rankResourceItem(right, query);
      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      if (left.isExactMatch !== right.isExactMatch) {
        return left.isExactMatch ? -1 : 1;
      }

      if (left.isFeatured !== right.isFeatured) {
        return left.isFeatured ? -1 : 1;
      }

      return left.title.localeCompare(right.title);
    });
}

function determineStatus(args: {
  query: string;
  featuredItems: ICorporateResourceItem[];
  visibleItems: ICorporateResourceItem[];
  hasPartialData: boolean;
}): CorporateResourcesViewState {
  if (args.visibleItems.length === 0) {
    if (args.hasPartialData) {
      return 'partialData';
    }

    return args.query.trim() ? 'empty' : 'idle';
  }

  return args.hasPartialData ? 'partialData' : 'ready';
}

export class CorporateResourcesSearchService {
  constructor(private readonly repository: CorporateResourcesRepository = new CorporateResourcesRepository()) {}

  public async resolve(
    request: ICorporateResourcesRequest,
    filters: Partial<ICorporateResourcesFilters> = {}
  ): Promise<ICorporateResourcesStateSnapshot> {
    const normalizedFilters = normalizeFilters(filters);
    const sourceResults = await this.repository.load(request);
    const mergedItems = dedupeResources(
      sourceResults.reduce<ICorporateResourceItem[]>((accumulator, result) => accumulator.concat(result.items), [])
    );
    const query = normalizeText(request.query);
    const visibleItems = sortItems(
      mergedItems.filter((item) => matchesFilters(item, normalizedFilters)),
      query
    );
    const featuredItems = request.showFeaturedWhenEmpty && !query
      ? visibleItems.filter((item) => item.isFeatured).slice(0, request.maxItems)
      : [];
    const limitedVisibleItems = query
      ? visibleItems.slice(0, request.maxItems)
      : featuredItems.length > 0
        ? featuredItems.slice(0, request.maxItems)
        : visibleItems.slice(0, request.maxItems);
    const hasPartialData =
      sourceResults.some((result) => result.hasPartialData) ||
      limitedVisibleItems.some((item) => !item.openUrl || !item.summary || !item.category);

    const status = determineStatus({
      query,
      featuredItems,
      visibleItems: limitedVisibleItems,
      hasPartialData
    });

    return {
      status,
      query,
      items: visibleItems,
      featuredItems,
      filteredItems: limitedVisibleItems,
      facets: buildFacets(visibleItems),
      filters: normalizedFilters,
      sourceLabel: sourceResults.map((result) => result.sourceLabel).filter(Boolean).join(' + '),
      hasPartialData,
      errorMessage: undefined
    };
  }
}
