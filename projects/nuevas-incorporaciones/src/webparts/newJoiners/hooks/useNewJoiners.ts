import { useState, useEffect, useCallback } from 'react';
import type { IJoiner, INewJoinersConfiguration, AsyncState } from '../models/joinerModels';
import { NewJoinersService } from '../services/newJoinersService';

export interface IUseNewJoinersOptions {
  service: NewJoinersService;
  configuration: INewJoinersConfiguration;
  autoRefreshSeconds?: number;
}

export function useNewJoiners(options: IUseNewJoinersOptions): AsyncState<IJoiner[]> {
  const { service, configuration, autoRefreshSeconds } = options;
  const [state, setState] = useState<AsyncState<IJoiner[]>>({ status: 'loading' });

  const loadData = useCallback(async (): Promise<void> => {
    const newState = await service.loadJoiners(configuration);
    setState(newState);
  }, [service, configuration]);

  useEffect(() => {
    void loadData();

    if (autoRefreshSeconds && autoRefreshSeconds > 0) {
      const intervalId = setInterval(() => {
        void loadData();
      }, autoRefreshSeconds * 1000);
      return () => clearInterval(intervalId);
    }
  }, [loadData, autoRefreshSeconds]);

  return state;
}