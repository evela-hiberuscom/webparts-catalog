import type {
  IRequestCatalogRepository,
  IRequestCatalogRequest,
  IRequestCatalogService,
  IStartARequestSnapshot,
  RequestCatalogStatus
} from '../models/startARequestModels';
import {
  classifyRequestStatus,
  deriveCategories,
  filterRequestsByCategory,
  sortRequests
} from '../utils/startARequestUtils';

function createStatus(
  hasData: boolean,
  hasError: boolean,
  hasPartialData: boolean,
  isLoading: boolean
): RequestCatalogStatus {
  return classifyRequestStatus({
    hasData,
    hasError,
    hasPartialData,
    isLoading
  });
}

function normalizeCategory(value: string | undefined): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : 'all';
}

function resolveActiveCategory(defaultCategory: string | undefined, categories: string[]): string {
  const normalized = normalizeCategory(defaultCategory);
  if (normalized === 'all') {
    return normalized;
  }

  return categories.some((category) => category.toLowerCase() === normalized.toLowerCase()) ? normalized : 'all';
}

export class RequestsCatalogService implements IRequestCatalogService {
  public constructor(private readonly repository: IRequestCatalogRepository) {}

  public async resolve(request: IRequestCatalogRequest): Promise<IStartARequestSnapshot> {
    const result = await this.repository.loadCatalog(request);
    const items = sortRequests(result.items);
    const categories = deriveCategories(items);
    const activeCategory = resolveActiveCategory(request.defaultCategory, categories);
    const filteredItems = filterRequestsByCategory(items, activeCategory);
    const hasData = filteredItems.length > 0;
    const status = createStatus(hasData, false, result.hasPartialData, false);

    return {
      status: hasData ? status : 'empty',
      activeCategory,
      items,
      filteredItems,
      categories,
      sourceLabel: result.sourceLabel,
      notes: result.notes,
      hasPartialData: result.hasPartialData
    };
  }
}
