import type { ITasksConfiguration } from '../models/taskModels';
import type { TasksService } from '../services/tasksService';

export interface IMyTasksAndPendingProps {
  configuration: ITasksConfiguration;
  service: TasksService;
  autoRefreshSeconds?: number;
  title?: string;
}