import { classifyAsyncState } from '@paquete/spfx-common';

import type {
  IPlannedMaintenanceRepositoryResult,
  IPlannedMaintenanceRequest,
  IPlannedMaintenanceViewModel
} from '../models/plannedMaintenanceModels';
import { PlannedMaintenanceRepository } from '../repositories/PlannedMaintenanceRepository';
import {
  countByStatus,
  filterCompleted,
  normalizeWebPartProps,
  sortMaintenanceItems
} from '../utils/plannedMaintenanceUtils';

interface IPlannedMaintenanceRepositoryLike {
  load(request: IPlannedMaintenanceRequest): Promise<IPlannedMaintenanceRepositoryResult>;
}

export class PlannedMaintenanceService {
  public constructor(private readonly repository?: IPlannedMaintenanceRepositoryLike) {}

  public buildLoadingViewModel(request: IPlannedMaintenanceRequest): IPlannedMaintenanceViewModel {
    const webPartProps = normalizeWebPartProps(request.webPartProps);
    return {
      title: webPartProps.title,
      description: webPartProps.description,
      sourceLabel: 'loading',
      allItems: [],
      items: [],
      hideCompleted: webPartProps.hideCompleted,
      state: 'loading',
      hasPartialData: false,
      notes: [],
      counts: {
        inProgress: 0,
        upcoming: 0,
        completed: 0,
        unknown: 0
      }
    };
  }

  public async load(request: IPlannedMaintenanceRequest): Promise<IPlannedMaintenanceViewModel> {
    const webPartProps = normalizeWebPartProps(request.webPartProps);
    const repository = this.repository ?? new PlannedMaintenanceRepository(request.hostContext.spHttpClient);
    const repositoryResult = await repository.load({
      ...request,
      webPartProps
    });
    const sortedItems = sortMaintenanceItems(repositoryResult.items).slice(0, webPartProps.maxItems);
    const visibleItems = filterCompleted(sortedItems, webPartProps.hideCompleted);
    const hasPartialData = repositoryResult.hasPartialData || sortedItems.some((item) => item.partialData);

    return {
      title: webPartProps.title,
      description: webPartProps.description,
      sourceLabel: repositoryResult.sourceLabel,
      allItems: sortedItems,
      items: visibleItems,
      hideCompleted: webPartProps.hideCompleted,
      state: classifyAsyncState({
        hasData: visibleItems.length > 0,
        hasError: false,
        isLoading: false,
        isPartial: hasPartialData
      }),
      hasPartialData,
      notes: repositoryResult.notes,
      counts: countByStatus(sortedItems)
    };
  }
}
