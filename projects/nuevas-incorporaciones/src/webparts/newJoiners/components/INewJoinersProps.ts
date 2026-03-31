import type { INewJoinersConfiguration } from '../models/joinerModels';
import type { NewJoinersService } from '../services/newJoinersService';

export interface INewJoinersProps {
  configuration: INewJoinersConfiguration;
  service: NewJoinersService;
  autoRefreshSeconds?: number;
  title?: string;
}