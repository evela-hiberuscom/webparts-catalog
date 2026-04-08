import type {
  ISmartFaqConfiguration,
  ISmartFaqRepository,
  ISmartFaqService,
  ISmartFaqState
} from '../models/smartFaqModels';
import { isFaqPartial, sortFaqs } from '../utils/smartFaqUtils';

export class SmartFaqService implements ISmartFaqService {
  public constructor(private readonly repository: ISmartFaqRepository) {}

  public async load(configuration: ISmartFaqConfiguration): Promise<ISmartFaqState> {
    try {
      const items = sortFaqs(await this.repository.getFaqs(configuration)).slice(0, configuration.maxItems);

      if (!items.length) {
        return {
          status: 'empty',
          items: [],
          categories: [],
          hasPartialData: false
        };
      }

      const categories = Array.from(new Set(items.map((item) => item.category)));
      const hasPartialData = items.some((item) => isFaqPartial(item));

      return {
        status: hasPartialData ? 'partialData' : 'ready',
        items,
        categories,
        hasPartialData
      };
    } catch (error) {
      return {
        status: 'error',
        items: [],
        categories: [],
        hasPartialData: false,
        errorMessage: error instanceof Error ? error.message : 'Unexpected error loading FAQs'
      };
    }
  }
}
