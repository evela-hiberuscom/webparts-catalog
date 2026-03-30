import type { PortalMapService } from '../services/portalMapService';
import type { PortalMapDataSourceType, PortalMapViewMode } from '../models/portalMapModels';

export interface IPortalMapProps {
  dataSourceType: PortalMapDataSourceType;
  listTitleOrUrl: string;
  viewMode: PortalMapViewMode;
  maxDepth: number;
  webUrl: string;
  isDarkTheme: boolean;
  hasTeamsContext: boolean;
  service?: PortalMapService;
}
