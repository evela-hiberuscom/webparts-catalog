import type {
  INewsByAreaConfiguration,
  INewsByAreaRepository,
  INewsByAreaService,
  INewsByAreaState
} from '../models/newsByAreaModels';
import { extractMatchedTags, isNewsByAreaItemPartial, sortNewsByAreaItems } from '../utils/newsByAreaUtils';

export class NewsByAreaService implements INewsByAreaService {
  public constructor(private readonly repository: INewsByAreaRepository) {}

  public async load(configuration: INewsByAreaConfiguration): Promise<INewsByAreaState> {
    try {
      const normalizedFilter = configuration.areaFilter.trim();
      const filteredItems = (await this.repository.getNews(configuration))
        .filter((item) => !normalizedFilter || extractMatchedTags(item.tags, normalizedFilter).length > 0);
      const items = sortNewsByAreaItems(filteredItems, configuration.featuredFirst).slice(0, configuration.maxItems);

      if (!items.length) {
        return {
          status: 'empty',
          items: [],
          hasPartialData: false
        };
      }

      const hasPartialData = items.some((item) => isNewsByAreaItemPartial(item));

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
        errorMessage: error instanceof Error ? error.message : 'Unexpected error loading area news'
      };
    }
  }
}
