import type { RecentAccessesSourceMode } from '../models/recentAccesses.types';

export interface IMyRecentAccessesProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  dataSourceMode: RecentAccessesSourceMode;
  recentItemsJsonUrl: string;
  maxItems: number;
  resourceTypeFilter: string;
}
