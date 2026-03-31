import type { IAreaGoalsConfiguration } from '../models/goalModels';
import type { AreaGoalsService } from '../services/areaGoalsService';

export interface IAreaGoalsProps {
  configuration: IAreaGoalsConfiguration;
  service: AreaGoalsService;
  autoRefreshSeconds?: number;
  title?: string;
}