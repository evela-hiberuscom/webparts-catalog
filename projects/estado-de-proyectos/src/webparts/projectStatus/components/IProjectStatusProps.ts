import type { IProjectStatusWebPartConfig } from '../models/projectStatusTypes';

export interface IProjectStatusProps extends IProjectStatusWebPartConfig {
  webUrl: string;
  title: string;
  subtitle: string;
}
