import { useState, useEffect, useCallback } from 'react';
import type { ITaskItem, ITasksConfiguration, AsyncState } from '../models/taskModels';
import { TasksService } from '../services/tasksService';

export interface IUseTasksOptions {
  service: TasksService;
  configuration: ITasksConfiguration;
  autoRefreshSeconds?: number;
}

export function useTasks(options: IUseTasksOptions): AsyncState<ITaskItem[]> {
  const { service, configuration, autoRefreshSeconds } = options;
  const [state, setState] = useState<AsyncState<ITaskItem[]>>({ status: 'loading' });

  const loadData = useCallback(async (): Promise<void> => {
    const newState = await service.loadTasks(configuration);
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