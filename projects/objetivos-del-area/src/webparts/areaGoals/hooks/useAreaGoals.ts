import { useState, useEffect, useCallback } from 'react';
import type { IGoalItem, IAreaGoalsConfiguration, AsyncState } from '../models/goalModels';
import { AreaGoalsService } from '../services/areaGoalsService';

export interface IUseAreaGoalsOptions {
  service: AreaGoalsService;
  configuration: IAreaGoalsConfiguration;
  autoRefreshSeconds?: number;
}

export function useAreaGoals(options: IUseAreaGoalsOptions): AsyncState<IGoalItem[]> {
  const { service, configuration, autoRefreshSeconds } = options;
  const [state, setState] = useState<AsyncState<IGoalItem[]>>({ status: 'loading' });

  const loadData = useCallback(async (): Promise<void> => {
    const newState = await service.loadGoals(configuration);
    setState(newState);
  }, [service, configuration]);

  useEffect(() => {
    loadData().catch(() => undefined);

    if (autoRefreshSeconds && autoRefreshSeconds > 0) {
      const intervalId = setInterval(() => {
        loadData().catch(() => undefined);
      }, autoRefreshSeconds * 1000);
      return () => clearInterval(intervalId);
    }
  }, [loadData, autoRefreshSeconds]);

  return state;
}