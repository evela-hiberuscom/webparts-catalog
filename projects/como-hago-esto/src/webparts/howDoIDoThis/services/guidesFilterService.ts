import type { IGuideItem } from '../models/howDoIDoThisModels';
import { ALL_CATEGORIES_LABEL, normalizeText } from '../utils/howDoIDoThisUtils';

export class GuidesFilterService {
  public getCategories(items: IGuideItem[]): string[] {
    const seen = new Set<string>();
    const categories: string[] = [];

    for (const item of items) {
      const key = item.category.toLowerCase();
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      categories.push(item.category);
    }

    return categories;
  }

  public getVisibleItems(items: IGuideItem[], selectedCategory: string): IGuideItem[] {
    const normalized = normalizeText(selectedCategory);
    if (!normalized || normalized.toLowerCase() === ALL_CATEGORIES_LABEL.toLowerCase()) {
      return items;
    }

    const key = normalized.toLowerCase();
    return items.filter((item) => item.category.toLowerCase() === key);
  }

  public resolveSelectedCategory(defaultCategory: string, categories: string[]): string {
    const normalized = normalizeText(defaultCategory);
    if (!normalized) {
      return ALL_CATEGORIES_LABEL;
    }

    return categories.some((category) => category.toLowerCase() === normalized.toLowerCase())
      ? normalized
      : ALL_CATEGORIES_LABEL;
  }
}
