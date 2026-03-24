import * as React from 'react';
import { classifyAsyncState } from '@paquete/spfx-common/utils';
import type {
  IChecklistStateSnapshot,
  IChecklistViewModel,
  IOffboardingOrChangeChecklistRequest,
  OffboardingScenarioFilter
} from '../models/offboardingOrChangeChecklistModels';
import {
  collectPhaseOptions,
  collectScenarioOptions,
  filterChecklistSteps,
  sortChecklistSteps
} from '../utils/offboardingOrChangeChecklistUtils';
import { useOffboardingOrChangeChecklistService } from '../contexts/OffboardingOrChangeChecklistContext';

function createLoadingState(request: IOffboardingOrChangeChecklistRequest): IChecklistStateSnapshot {
  return {
    status: 'loading',
    items: [],
    sourceLabel: request.title,
    notes: [],
    hasPartialData: false,
    activeScenario: request.defaultScenario,
    activePhase: request.defaultPhase?.trim() || 'all'
  };
}

function classifyViewState(snapshot: IChecklistStateSnapshot): IChecklistStateSnapshot {
  const status = classifyAsyncState({
    isLoading: snapshot.status === 'loading',
    hasError: snapshot.status === 'error',
    isPartial: snapshot.hasPartialData && snapshot.items.length > 0,
    hasData: snapshot.items.length > 0
  });

  return {
    ...snapshot,
    status: status as IChecklistStateSnapshot['status']
  };
}

export function useOffboardingOrChangeChecklist(request: IOffboardingOrChangeChecklistRequest): IChecklistViewModel {
  const service = useOffboardingOrChangeChecklistService();
  const [snapshot, setSnapshot] = React.useState<IChecklistStateSnapshot>(() => createLoadingState(request));
  const [reloadTick, setReloadTick] = React.useState(0);
  const [scenarioFilter, setScenarioFilter] = React.useState<OffboardingScenarioFilter>(request.defaultScenario);
  const [phaseFilter, setPhaseFilter] = React.useState<string | 'all'>(request.defaultPhase?.trim() || 'all');
  const requestRef = React.useRef(request);
  requestRef.current = request;

  const reload = React.useCallback(() => {
    setReloadTick((current) => current + 1);
  }, []);

  const resetFilters = React.useCallback(() => {
    setScenarioFilter(requestRef.current.defaultScenario);
    setPhaseFilter(requestRef.current.defaultPhase?.trim() || 'all');
  }, []);

  React.useEffect(() => {
    let disposed = false;

    async function load(): Promise<void> {
      setSnapshot(createLoadingState(request));
      const result = await service.resolve(request);
      if (!disposed) {
        setSnapshot(classifyViewState(result));
      }
    }

    load().catch((error) => {
      if (!disposed) {
        setSnapshot({
          status: 'error',
          items: [],
          sourceLabel: request.title,
          notes: [],
          hasPartialData: false,
          errorMessage: (error as Error).message,
          activeScenario: request.defaultScenario,
          activePhase: request.defaultPhase?.trim() || 'all'
        });
      }
    });

    return () => {
      disposed = true;
    };
  }, [
    reloadTick,
    request.dataSourceType,
    request.defaultPhase,
    request.defaultScenario,
    request.description,
    request.jsonUrl,
    request.listTitleOrUrl,
    request.staticConfigJson,
    request.title,
    request.userDisplayName,
    request.webUrl,
    service
  ]);

  const filteredItems = filterChecklistSteps(sortChecklistSteps(snapshot.items), scenarioFilter, phaseFilter);
  const criticalCount = filteredItems.filter((item) => item.critical).length;
  const scenarioOptions = collectScenarioOptions(snapshot.items);
  const phaseOptions = collectPhaseOptions(snapshot.items);

  return {
    ...snapshot,
    filteredItems,
    criticalCount,
    scenarioOptions,
    phaseOptions,
    activeScenario: scenarioFilter,
    activePhase: phaseFilter,
    reload,
    setScenarioFilter,
    setPhaseFilter,
    resetFilters
  };
}
