import type { SPHttpClient } from '@microsoft/sp-http';
import type { AlertDataSourceType } from '../models/alertModels';

export interface IUrgentAlertBarProps {
  spHttpClient: SPHttpClient;
  webAbsoluteUrl: string;
  dataSourceType: AlertDataSourceType;
  listTitleOrUrl: string;
  jsonUrl?: string;
  staticConfigJson?: string;
  maxAlerts: number;
  dismissible: boolean;
}

