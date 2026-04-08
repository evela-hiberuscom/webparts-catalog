import type {
  INewsSummaryConfiguration,
  INewsSummaryRepository,
  INewsSummaryService,
  INewsSummaryState
} from '../models/newsSummaryModels';
import { isNewsItemPartial, sortNewsItems } from '../utils/newsSummaryUtils';

export class NewsSummaryService implements INewsSummaryService {
  public constructor(private readonly repository: INewsSummaryRepository) {}

  public async load(configuration: INewsSummaryConfiguration): Promise<INewsSummaryState> {
    try {
      const items = sortNewsItems(await this.repository.getNews(configuration), configuration.featuredFirst);

      if (!items.length) {
        return {
          status: 'empty',
          items: [],
          hasPartialData: false
        };
      }

      const hasPartialData = items.some((item) => isNewsItemPartial(item));

      return {
        status: hasPartialData ? 'partialData' : 'ready',
        items,
        hasPartialData
      };
    } catch (error) {
      return {
        status: 'error',
        items: [],
        hasPartialData: false,
        errorMessage: error instanceof Error ? error.message : 'Unexpected error loading news'
      };
    }
  }
}
