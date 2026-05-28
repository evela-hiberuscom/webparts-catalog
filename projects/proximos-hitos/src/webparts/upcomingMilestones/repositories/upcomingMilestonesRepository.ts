import type {
  IUpcomingMilestoneItem,
  IUpcomingMilestonesConfiguration,
  IUpcomingMilestonesContext,
  IUpcomingMilestonesRepository
} from '../models/upcomingMilestonesModels';
import { mapSharePointMilestone } from '../utils/upcomingMilestonesUtils';
import { escapeODataString as escapeODataListTitle } from '@paquete/spfx-common';

interface ISharePointItemsResponse {
  value?: Record<string, unknown>[];
}

export class UpcomingMilestonesRepository implements IUpcomingMilestonesRepository {
  public constructor(private readonly context: IUpcomingMilestonesContext) {}

  public async getMilestones(configuration: IUpcomingMilestonesConfiguration): Promise<IUpcomingMilestoneItem[]> {
    const endpoint =
      `${this.context.webAbsoluteUrl}/_api/web/lists/getByTitle('${escapeODataListTitle(configuration.listTitleOrUrl)}')/items` +
      `?$orderby=Modified desc&$top=${Math.max(configuration.maxItems * 3, 12)}`;

    const response = await this.context.spHttpClient.get(endpoint, this.context.spHttpClientConfiguration);
    if (!response.ok) {
      throw new Error(`Failed to load milestones: ${response.status}`);
    }

    const payload = await response.json() as ISharePointItemsResponse;
    return (payload.value ?? []).map((item) => mapSharePointMilestone(item, this.context.webAbsoluteUrl));
  }
}
