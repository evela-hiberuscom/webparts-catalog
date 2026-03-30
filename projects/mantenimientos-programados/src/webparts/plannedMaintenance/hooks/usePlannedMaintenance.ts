import * as React from 'react';

import type { IPlannedMaintenanceRequest, IPlannedMaintenanceViewModel } from '../models/plannedMaintenanceModels';
import { PlannedMaintenanceService } from '../services/PlannedMaintenanceService';
import { filterCompleted } from '../utils/plannedMaintenanceUtils';

export interface IUsePlannedMaintenanceResult {
  viewModel: IPlannedMaintenanceViewModel;
  hideCompleted: boolean;
  setHideCompleted: (value: boolean) => void;
  reload: () => void;
}

function applyLocalFilter(viewModel: IPlannedMaintenanceViewModel, hideCompleted: boolean): IPlannedMaintenanceViewModel {
  const items = filterCompleted(viewModel.allItems, hideCompleted);
  return {
    ...viewModel,
    hideCompleted,
    items,
    state: items.length === 0 && viewModel.allItems.length > 0 && hideCompleted ? 'empty' : viewModel.state
  };
}

export function usePlannedMaintenance(request: IPlannedMaintenanceRequest): IUsePlannedMaintenanceResult {
  const service = React.useMemo(() => new PlannedMaintenanceService(), []);
  const [reloadCounter, setReloadCounter] = React.useState(0);
  const [hideCompleted, setHideCompletedState] = React.useState(request.webPartProps.hideCompleted);
  const [viewModel, setViewModel] = React.useState<IPlannedMaintenanceViewModel>(() => service.buildLoadingViewModel(request));

  React.useEffect(() => {
    setHideCompletedState(request.webPartProps.hideCompleted);
  }, [request.webPartProps.hideCompleted]);

  React.useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      setViewModel(service.buildLoadingViewModel(request));

      try {
        const nextViewModel = await service.load(request);
        if (!isMounted) {
          return;
        }

        setViewModel(applyLocalFilter(nextViewModel, hideCompleted));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const loadingViewModel = service.buildLoadingViewModel(request);
        setViewModel({
          ...loadingViewModel,
          sourceLabel: 'error',
          state: 'error',
          notes: [(error as Error).message]
        });
      }
    }

    load().catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [
    reloadCounter,
    request.hostContext.siteUrl,
    request.hostContext.webUrl,
    request.webPartProps.dataSourceType,
    request.webPartProps.description,
    request.webPartProps.hideCompleted,
    request.webPartProps.jsonUrl,
    request.webPartProps.listTitleOrUrl,
    request.webPartProps.maxItems,
    request.webPartProps.title,
    service
  ]);

  const reload = React.useCallback(() => {
    setReloadCounter((current) => current + 1);
  }, []);

  const setHideCompleted = React.useCallback((value: boolean) => {
    setHideCompletedState(value);
    setViewModel((current) => applyLocalFilter(current, value));
  }, []);

  return {
    viewModel,
    hideCompleted,
    setHideCompleted,
    reload
  };
}
