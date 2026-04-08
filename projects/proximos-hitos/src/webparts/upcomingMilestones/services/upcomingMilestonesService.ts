import type {
  IUpcomingMilestonesConfiguration,
  IUpcomingMilestonesRepository,
  IUpcomingMilestonesService,
  IUpcomingMilestonesState
} from '../models/upcomingMilestonesModels';
import { isMilestonePartial, sortMilestonesByDate } from '../utils/upcomingMilestonesUtils';

export class UpcomingMilestonesService implements IUpcomingMilestonesService {
  public constructor(private readonly repository: IUpcomingMilestonesRepository) {}

  public async load(configuration: IUpcomingMilestonesConfiguration): Promise<IUpcomingMilestonesState> {
    try {
      const items = sortMilestonesByDate(await this.repository.getMilestones(configuration))
        .slice(0, configuration.maxItems);

      if (!items.length) {
        return {
          status: 'empty',
          items: [],
          hasPartialData: false
        };
      }

      const hasPartialData = items.some((item) => isMilestonePartial(item));

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
        errorMessage: error instanceof Error ? error.message : 'Unexpected error loading milestones'
      };
    }
  }
}
