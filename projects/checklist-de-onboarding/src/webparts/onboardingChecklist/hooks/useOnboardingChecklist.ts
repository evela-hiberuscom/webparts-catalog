import * as React from 'react';
import { classifyAsyncState } from '@paquete/spfx-common/utils';
import type {
  IOnboardingChecklistRequest,
  IOnboardingChecklistStateSnapshot,
  IOnboardingChecklistViewModel,
  OnboardingChecklistFilter
} from '../models/onboardingChecklistModels';
import {
  collectPhaseOptions,
  collectVariantOptions,
  filterOnboardingChecklistSteps,
  sortOnboardingChecklistSteps
} from '../utils/onboardingChecklistUtils';
import { useOnboardingChecklistService } from '../contexts/OnboardingChecklistContext';

function createLoadingState(request: IOnboardingChecklistRequest): IOnboardingChecklistStateSnapshot {
  return {
    status: 'loading',
    items: [],
    sourceLabel: request.title,
    notes: [],
    hasPartialData: false,
    activeVariant: request.defaultVariant?.trim() || 'all',
    activePhase: request.defaultPhase?.trim() || 'all'
  };
}

function classifyViewState(snapshot: IOnboardingChecklistStateSnapshot): IOnboardingChecklistStateSnapshot {
  const status = classifyAsyncState({
    isLoading: snapshot.status === 'loading',
    hasError: snapshot.status === 'error',
    isPartial: snapshot.hasPartialData && snapshot.items.length > 0,
    hasData: snapshot.items.length > 0
  });

  return {
    ...snapshot,
    status: status as IOnboardingChecklistStateSnapshot['status']
  };
}

export function useOnboardingChecklist(request: IOnboardingChecklistRequest): IOnboardingChecklistViewModel {
  const service = useOnboardingChecklistService();
  const [snapshot, setSnapshot] = React.useState<IOnboardingChecklistStateSnapshot>(() => createLoadingState(request));
  const [reloadTick, setReloadTick] = React.useState(0);
  const [variantFilter, setVariantFilter] = React.useState<OnboardingChecklistFilter>(request.defaultVariant?.trim() || 'all');
  const [phaseFilter, setPhaseFilter] = React.useState<OnboardingChecklistFilter>(request.defaultPhase?.trim() || 'all');
  const requestRef = React.useRef(request);
  requestRef.current = request;

  const reload = React.useCallback(() => {
    setReloadTick((current) => current + 1);
  }, []);

  const resetFilters = React.useCallback(() => {
    setVariantFilter(requestRef.current.defaultVariant?.trim() || 'all');
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
          activeVariant: request.defaultVariant?.trim() || 'all',
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
    request.defaultVariant,
    request.description,
    request.jsonUrl,
    request.listTitleOrUrl,
    request.staticConfigJson,
    request.title,
    request.userDisplayName,
    request.webUrl,
    service
  ]);

  const sortedItems = sortOnboardingChecklistSteps(snapshot.items);
  const filteredItems = filterOnboardingChecklistSteps(sortedItems, variantFilter, phaseFilter);
  const mandatoryCount = filteredItems.filter((item) => item.mandatory).length;
  const variantOptions = collectVariantOptions(sortedItems);
  const phaseOptions = collectPhaseOptions(sortedItems);

  return {
    ...snapshot,
    filteredItems,
    variantOptions,
    phaseOptions,
    mandatoryCount,
    reload,
    setVariantFilter,
    setPhaseFilter,
    resetFilters
  };
}
