import type {
  ICorporateGlossaryConfiguration,
  ICorporateGlossaryRepository,
  ICorporateGlossaryService,
  ICorporateGlossaryState
} from '../models/corporateGlossaryModels';
import { buildAlphabetIndex, sortGlossaryItems } from '../utils/corporateGlossaryUtils';

export class CorporateGlossaryService implements ICorporateGlossaryService {
  public constructor(private readonly repository: ICorporateGlossaryRepository) {}

  public async load(configuration: ICorporateGlossaryConfiguration): Promise<ICorporateGlossaryState> {
    try {
      const items = sortGlossaryItems(await this.repository.getGlossary(configuration));
      const categories = Array.from(new Set(items.map((item) => item.category ?? configuration.defaultCategory).filter(Boolean))).sort((left, right) => left.localeCompare(right, 'es', { sensitivity: 'base' }));
      const letters = buildAlphabetIndex(items);

      if (!items.length) {
        return {
          status: 'empty',
          items: [],
          categories,
          letters,
          hasPartialData: false
        };
      }

      const hasPartialData = items.some((item) => item.partialData);

      return {
        status: hasPartialData ? 'partialData' : 'ready',
        items,
        categories,
        letters,
        hasPartialData
      };
    } catch (error) {
      return {
        status: 'error',
        items: [],
        categories: [],
        letters: [],
        hasPartialData: false,
        errorMessage: error instanceof Error ? error.message : 'Unexpected error loading glossary'
      };
    }
  }
}
