import { classifyAsyncState } from '@paquete/spfx-common/utils';
import type { IQuickActionsRequest, IQuickActionsViewModel, IQuickAction } from '../models/quickActionsModels';
import { filterQuickActions, hasPartialQuickAction, sortQuickActions, uniqueCategories, ALL_CATEGORIES_LABEL } from '../utils/quickActionsUtils';
import { QuickActionsRepository } from '../repositories/quickActionsRepository';

function resolveSelectedCategory(request: IQuickActionsRequest, categories: string[]): string {
  const requested = (request.defaultCategory ?? '').trim();
  if (!requested) {
    return ALL_CATEGORIES_LABEL;
  }

  return categories.some((category) => category.toLowerCase() === requested.toLowerCase()) ? requested : ALL_CATEGORIES_LABEL;
}

function limitItems(items: IQuickAction[], maxItems: number): IQuickAction[] {
  if (!Number.isFinite(maxItems) || maxItems <= 0) {
    return [];
  }

  return items.slice(0, Math.trunc(maxItems));
}

export class QuickActionsService {
  public constructor(private readonly repository: QuickActionsRepository) {}

  public async load(request: IQuickActionsRequest): Promise<IQuickActionsViewModel> {
    try {
      const result = await this.repository.load(request);
      const normalizedItems = sortQuickActions(limitItems(result.items, request.maxItems));
      const categories = uniqueCategories(normalizedItems);
      const selectedCategory = resolveSelectedCategory(request, categories);
      const visibleItems = filterQuickActions(normalizedItems, selectedCategory);
      const hasPartialData = result.hasPartialData || normalizedItems.some(hasPartialQuickAction);
      const status = classifyAsyncState({
        hasData: normalizedItems.length > 0,
        isPartial: hasPartialData
      });

      return {
        status,
        items: normalizedItems,
        visibleItems,
        categories,
        selectedCategory,
        sourceLabel: result.sourceLabel,
        hasPartialData,
        errorMessage: undefined
      };
    } catch (error) {
      return {
        status: 'error',
        items: [],
        visibleItems: [],
        categories: [],
        selectedCategory: ALL_CATEGORIES_LABEL,
        sourceLabel: 'Centro de acciones rápidas',
        hasPartialData: false,
        errorMessage: (error as Error).message
      };
    }
  }
}
