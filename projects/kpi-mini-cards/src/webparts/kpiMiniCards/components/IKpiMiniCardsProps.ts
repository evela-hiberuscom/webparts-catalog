import type { IKpiCatalogConfig } from '../models/kpiModels';

export interface IKpiMiniCardsProps extends IKpiCatalogConfig {
  title: string;
  subtitle: string;
  webUrl: string;
  userDisplayName: string;
}
