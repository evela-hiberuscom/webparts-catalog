import type { IGuideItem, IHowDoIDoThisRequest, IHowDoIDoThisViewModel } from '../models/howDoIDoThisModels';
import { GuidesRepository } from '../repositories/guidesRepository';
import { GuidesFilterService } from './guidesFilterService';
import { ALL_CATEGORIES_LABEL, sortGuides } from '../utils/howDoIDoThisUtils';

function limitItems(items: IGuideItem[], maxItems: number): IGuideItem[] {
  if (!Number.isFinite(maxItems) || maxItems <= 0) {
    return [];
  }

  return items.slice(0, Math.trunc(maxItems));
}

export class GuidesCatalogService {
  public constructor(
    private readonly repository: GuidesRepository,
    private readonly filterService: GuidesFilterService
  ) {}

  public async load(request: IHowDoIDoThisRequest): Promise<IHowDoIDoThisViewModel> {
    try {
      const result = await this.repository.load(request);
      const items = sortGuides(limitItems(result.items, request.maxItems));
      const categories = this.filterService.getCategories(items);
      const selectedCategory = this.filterService.resolveSelectedCategory(request.defaultCategory, categories);
      const visibleItems = this.filterService.getVisibleItems(items, selectedCategory);
      const hasPartialData = result.hasPartialData || items.some((item) => item.isPartial);
      const status = !items.length ? 'empty' : hasPartialData ? 'partialData' : 'ready';

      return {
        status,
        items,
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
        sourceLabel: request.title,
        hasPartialData: false,
        errorMessage: (error as Error).message
      };
    }
  }
}
